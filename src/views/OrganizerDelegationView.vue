<script setup>
import ModalActions from '@/components/layout/ModalActions.vue'
import BackButton from '@/components/layout/BackButton.vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import BannerComponent from '@/components/layout/BannerComponent.vue'
import NavigationComponent from '@/components/delegation/NavigationComponent.vue'
import AppButton from '@/components/forms/AppButton.vue'
import AppInput from '@/components/forms/AppInput.vue'
import AppModal from '@/components/layout/AppModal.vue'
import DocumentsListComponent from '@/components/delegation/DocumentsListComponent.vue'
import ScheduleListComponent from '@/components/delegation/schedules/ScheduleListComponent.vue'
import ScheduleModal from '@/components/delegation/modais/ScheduleModal.vue'
import UnderConstruction from '@/components/layout/UnderConstruction.vue'
import ResourceCreateModal from '@/components/delegation/modais/ResourceCreateModal.vue'
import CountryService from '@/services/countryService'
import UserService from '@/services/userService'
import GangService from '@/services/gangService'
import { getAllPages } from '@/services/pagination'
import { useToastStore } from '@/stores/toastStore'

const route = useRoute()
const country = ref(null),
  users = ref([]),
  pending = ref([]),
  tab = ref(0)
const loading = ref(false),
  error = ref(''),
  modal = ref(''),
  query = ref(''),
  selected = ref(null),
  saving = ref(false),
  modalError = ref(''),
  scheduleId = ref(null)
const service = new UserService()
const classes = ref([])
const selectedClass = ref(null)
let participantsRequest = 0
const selectedIds = ref([])
const confirmingParticipants = ref(false)
const selectedParticipants = computed(() =>
  pending.value.filter((user) => selectedIds.value.includes(user.id)),
)
function toggleParticipant(id) {
  if (saving.value) return
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter((value) => value !== id)
    : [...selectedIds.value, id]
}
const tabs = [
  { id: 0, name: 'Participantes', icon: 'mdi mdi-account-outline' },
  { id: 1, name: 'Cronograma', icon: 'mdi mdi-calendar-month-outline' },
  { id: 2, name: 'Documentos', icon: 'mdi mdi-file-document-outline' },
  { id: 3, name: 'Notas', icon: 'mdi mdi-star-outline' },
]
const participants = computed(() =>
  users.value.filter(
    (user) =>
      user.role === 'student' &&
      String(user.country?.id ?? user.country) === String(route.params.id),
  ),
)
const available = computed(() =>
  pending.value.filter(
    (user) =>
      selectedClass.value &&
      String(user.gang?.id ?? user.gang ?? '') === String(selectedClass.value.id) &&
      `${user.name} ${user.email}`.toLocaleLowerCase().includes(query.value.toLocaleLowerCase()),
  ),
)
const availableClasses = computed(() =>
  classes.value.filter((gang) =>
    gang.name.toLocaleLowerCase().includes(query.value.toLocaleLowerCase()),
  ),
)
function selectClass(gang) {
  selectedClass.value = gang
  query.value = ''
}
function backToClasses() {
  selectedClass.value = null
  query.value = ''
}
async function load() {
  loading.value = true
  error.value = ''
  country.value = null
  try {
    const [detail, all] = await Promise.all([
      new CountryService().getCountry(route.params.id),
      getAllPages((page) => service.getUsers(page)),
    ])
    country.value = detail
    users.value = all
  } catch {
    error.value = 'Não foi possível carregar a delegação.'
  } finally {
    loading.value = false
  }
}
async function openParticipants() {
  const request = ++participantsRequest
  modal.value = 'participants'
  selected.value = null
  selectedIds.value = []
  confirmingParticipants.value = false
  pending.value = []
  classes.value = []
  selectedClass.value = null
  query.value = ''
  modalError.value = ''
  saving.value = true
  try {
    const [students, gangs] = await Promise.all([
      getAllPages((page) => service.getPendingUsers(page)),
      getAllPages((page) => new GangService().getGangs(page)),
    ])
    if (request !== participantsRequest) return
    pending.value = students
    classes.value = gangs
  } catch {
    if (request !== participantsRequest) return
    modalError.value = 'Não foi possível carregar as turmas e os participantes disponíveis.'
  } finally {
    if (request === participantsRequest) saving.value = false
  }
}
function close() {
  if (!saving.value) modal.value = ''
}
function requestRemoval(user) {
  selected.value = user
  modalError.value = ''
  modal.value = 'remove'
}
async function removeParticipant() {
  if (!selected.value || saving.value) return
  saving.value = true
  modalError.value = ''
  try {
    const updated = await service.removeFromDelegation(selected.value.id, Number(route.params.id))
    users.value = users.value.map((user) => (user.id === updated.id ? updated : user))
    modal.value = ''
    useToastStore().show('Participante removido da delegação.')
  } catch {
    modalError.value =
      'Não foi possível remover o participante. Atualize a lista e tente novamente.'
  } finally {
    saving.value = false
  }
}
async function addParticipant() {
  if (!selectedParticipants.value.length || saving.value) return
  const destination = Number(route.params.id)
  const batch = [...selectedParticipants.value]
  saving.value = true
  modalError.value = ''
  const failed = []
  let added = 0
  for (const participant of batch) {
    try {
      const user = await service.approveUser(participant.id, destination)
      if (Number(route.params.id) !== destination) return
      users.value = [...users.value.filter((item) => item.id !== user.id), user]
      pending.value = pending.value.filter((item) => item.id !== participant.id)
      selectedIds.value = selectedIds.value.filter((id) => id !== participant.id)
      added++
    } catch {
      failed.push(participant.name || participant.email)
    }
    if (Number(route.params.id) !== destination) return
  }
  saving.value = false
  if (added) useToastStore().show(`${added} participante(s) adicionado(s).`, 'success')
  if (failed.length) {
    modalError.value = `${added} adicionado(s). Não foi possível adicionar: ${failed.join(', ')}. A seleção mantém apenas quem falhou; tente novamente ou revise a lista.`
  } else modal.value = ''
}
watch(
  () => route.params.id,
  () => {
    participantsRequest++
    tab.value = 0
    saving.value = false
    selectedIds.value = []
    confirmingParticipants.value = false
    modal.value = ''
    load()
  },
  { immediate: true },
)
</script>

<template>
  <AppLayout title="Delegação">
    <main class="delegation-content">
      <header class="page-heading">
        <BackButton to="/organizador" label="Voltar ao painel" />
        <BannerComponent
          v-if="country && !loading && !error"
          :title="country.name"
          :subtitle="country.political_name"
          :CountryFlagUrl="country.flag?.url"
        />
        <h1 v-else>Delegação</h1>
      </header>
      <p v-if="loading" role="status">Carregando delegação...</p>
      <div v-else-if="error" role="alert">
        {{ error }} <AppButton @click="load">Tentar novamente</AppButton>
      </div>
      <template v-else-if="country">
        <NavigationComponent v-model="tab" :tabs="tabs" />
        <section v-if="tab === 0">
          <div class="section-heading">
            <h2>Participantes ({{ participants.length }})</h2>
          </div>
          <p v-if="!participants.length">Nenhum participante nesta delegação.</p>
          <ul class="participants">
            <li v-for="user in participants" :key="user.id">
              <h3>{{ user.name }}</h3>
              <p>{{ user.gang?.name || user.email }}</p>
              <AppButton
                variant="danger"
                :aria-label="`Remover ${user.name} da delegação`"
                @click="requestRemoval(user)"
                >Remover</AppButton
              >
            </li>
          </ul>
        </section>
        <template v-if="tab === 1"
          ><ScheduleListComponent :country-id="route.params.id" @open-details="scheduleId = $event"
        /></template>
        <template v-if="tab === 2"
          ><DocumentsListComponent :country-id="route.params.id"
        /></template>
        <UnderConstruction v-if="tab === 3" title="Notas em construção" />
        <AppButton
          v-if="tab < 3"
          floating
          :aria-label="
            ['Adicionar participante +', 'Adicionar cronograma +', 'Adicionar documento +'][tab]
          "
          :title="['Adicionar participante', 'Adicionar cronograma', 'Adicionar documento'][tab]"
          @click="tab === 0 ? openParticipants() : (modal = tab === 1 ? 'schedule' : 'document')"
          ><span class="mdi mdi-plus" aria-hidden="true"></span
        ></AppButton>
      </template>
    </main>
    <ScheduleModal v-if="scheduleId" :schedule-id="scheduleId" @close="scheduleId = null" />
    <AppModal v-if="modal === 'remove'" centered @close="close">
      <section
        class="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-participant-title"
      >
        <h2 id="remove-participant-title">Remover participante?</h2>
        <p>
          Remover {{ selected.name }} da delegação de {{ country.name }}? A conta será mantida e
          poderá ser vinculada novamente.
        </p>
        <p v-if="modalError" role="alert">{{ modalError }}</p>
        <ModalActions>
          <AppButton variant="danger" :disabled="saving" @click="close">Cancelar</AppButton>
          <AppButton :disabled="saving" @click="removeParticipant">{{
            saving ? 'Removendo...' : 'Confirmar remoção'
          }}</AppButton>
        </ModalActions>
      </section>
    </AppModal>
    <ResourceCreateModal
      v-if="['schedule', 'document'].includes(modal)"
      :kind="modal"
      :country-id="Number(route.params.id)"
      @close="modal = ''"
    />
    <AppModal v-if="modal === 'participants'" centered @close="close">
      <section
        class="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="participants-title"
      >
        <h2 id="participants-title">
          {{
            confirmingParticipants
              ? 'Adicionar participantes'
              : selectedClass
                ? `Alunos de ${selectedClass.name}`
                : 'Selecionar turma'
          }}
        </h2>
        <p v-if="saving" role="status">
          {{ confirmingParticipants ? 'Adicionando participantes...' : 'Carregando...' }}
        </p>
        <template v-if="confirmingParticipants"
          ><p>
            Adicionar {{ selectedParticipants.length }} participante(s) à delegação de
            {{ country.name }}?
          </p>
          <ul class="selected-participants">
            <li v-for="user in selectedParticipants" :key="user.id">
              {{ user.name }} — {{ user.email }}
            </li>
          </ul>
        </template>
        <template v-else-if="!selectedClass">
          <AppInput v-model="query" label="Pesquisar turma" type="search" />
          <ul class="participant-options">
            <li v-for="gang in availableClasses" :key="gang.id">
              <AppButton variant="secondary" :disabled="saving" @click="selectClass(gang)">
                <span class="participant-option-copy"
                  ><strong>{{ gang.name }}</strong></span
                >
                <span class="mdi mdi-chevron-right" aria-hidden="true"></span>
              </AppButton>
            </li>
          </ul>
          <p v-if="!saving && !modalError && !availableClasses.length">Nenhuma turma disponível.</p>
        </template>
        <template v-else>
          <BackButton
            class="class-back"
            label="Voltar às turmas"
            :disabled="saving"
            @click="backToClasses"
          />
          <AppInput v-model="query" label="Pesquisar discente" type="search" />
          <ul class="participant-options">
            <li v-for="user in available" :key="user.id">
              <AppButton
                variant="secondary"
                :disabled="saving"
                :aria-pressed="selectedIds.includes(user.id)"
                @click="toggleParticipant(user.id)"
                ><span class="participant-option-copy"
                  ><strong>{{ user.name }}</strong
                  ><small>{{ user.email }}</small></span
                ><span
                  class="mdi"
                  :class="
                    selectedIds.includes(user.id)
                      ? 'mdi-checkbox-marked'
                      : 'mdi-checkbox-blank-outline'
                  "
                  aria-hidden="true"
                ></span
              ></AppButton>
            </li>
          </ul>
          <p v-if="!saving && !available.length">
            Nenhum discente disponível nesta turma.
          </p></template
        >
        <p v-if="!confirmingParticipants" role="status" style="margin-top: 1rem">
          {{ selectedIds.length }} participante(s) selecionado(s)
        </p>
        <p v-if="modalError" role="alert">{{ modalError }}</p>
        <AppButton
          v-if="modalError && !confirmingParticipants"
          variant="secondary"
          :disabled="saving"
          @click="openParticipants"
          >Tentar novamente</AppButton
        >
        <ModalActions>
          <AppButton
            v-if="confirmingParticipants"
            variant="danger"
            :disabled="saving"
            @click="confirmingParticipants = false"
            >Revisar seleção</AppButton
          >
          <AppButton v-else variant="danger" :disabled="saving" @click="close">Cancelar</AppButton>
          <AppButton
            v-if="confirmingParticipants"
            :disabled="saving || !selectedIds.length"
            @click="addParticipant"
            >Confirmar</AppButton
          >
          <AppButton
            v-else
            :disabled="saving || !selectedIds.length"
            @click="confirmingParticipants = true"
            >Continuar ({{ selectedIds.length }})</AppButton
          >
        </ModalActions>
      </section>
    </AppModal>
  </AppLayout>
</template>
<style scoped>
.class-back {
  margin-bottom: 1rem;
}
.selected-participants {
  margin: 1rem 0;
  max-height: 35dvh;
  overflow-y: auto;
  line-height: 1.6;
  overflow-wrap: anywhere;
}
.participant-options .app-button[aria-pressed='true'] {
  background: #e5edf7;
  border-color: #01295f;
}
@media (max-width: 1023px) {
  .page-heading {
    flex-direction: column;
    align-items: stretch;
  }
  .page-heading > .app-back {
    align-self: flex-start;
    margin-top: 0;
  }
  .page-heading > .banner {
    width: 100%;
    flex: auto;
  }
}
.page-heading {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}
.page-heading > .banner {
  flex: 1;
  min-width: 0;
}
.page-heading h1 {
  font-size: 1.5rem;
}
@media (max-width: 479px) {
  .page-heading {
    gap: 0.5rem;
  }
  .page-heading :deep(.ods-shape) {
    display: none;
  }
}
.delegation-content > .app-button {
  align-self: flex-end;
  margin: 0;
}
.section-heading h2 {
  font-size: 1.15rem;
  color: #223449;
}
.section-heading .app-button {
  margin: 0;
}
.modal-panel h2 {
  font-size: 1.35rem;
  color: #182b43;
  margin-bottom: 1.25rem;
}
.modal-panel :deep(.app-input) {
  margin-bottom: 1rem;
}
.participant-options {
  display: grid;
  gap: 0.625rem;
  max-height: 45dvh;
  overflow-y: auto;
}
.participant-options .app-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  text-align: left;
  margin: 0;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  background: #f8fafc;
}
.participant-option-copy {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}
.participant-option-copy strong {
  font-weight: 500;
}
.participant-option-copy small {
  color: #748193;
  font-weight: 400;
  overflow-wrap: anywhere;
}
.participants li {
  border-left-width: 6px !important;
  border: 1px solid #e7ebf0;
  border-left-color: #01295f;
  box-shadow: 0 3px 12px rgb(1 41 95 / 3%);
}
.participants h3 {
  font-size: 1.125rem !important;
  color: #20334d;
}
.participants p {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
.delegation-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.participants {
  display: grid;
  gap: 1.5rem;
}
.participants li {
  padding: 1.5rem 2rem;
  background: white;
  border-left: 24px solid #01295f;
  border-radius: 10px;
}
.participants h3 {
  font-size: 1.35rem;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.participants p {
  color: #626e76;
  overflow-wrap: anywhere;
}
@media (min-width: 1024px) {
  .delegation-content {
    margin: 0 2rem;
  }
}
</style>
