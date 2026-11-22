<script setup>
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
  pending.value.filter((user) =>
    `${user.name} ${user.email}`.toLocaleLowerCase().includes(query.value.toLocaleLowerCase()),
  ),
)
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
  modal.value = 'participants'
  selected.value = null
  query.value = ''
  modalError.value = ''
  saving.value = true
  try {
    pending.value = await getAllPages((page) => service.getPendingUsers(page))
  } catch {
    modalError.value = 'Não foi possível carregar os participantes disponíveis.'
  } finally {
    saving.value = false
  }
}
function close() {
  if (!saving.value) modal.value = ''
}
async function addParticipant() {
  if (!selected.value || saving.value) return
  saving.value = true
  modalError.value = ''
  try {
    const user = await service.approveUser(selected.value.id, Number(route.params.id))
    users.value = [...users.value.filter((item) => item.id !== user.id), user]
    modal.value = ''
    useToastStore().show('Participante adicionado.', 'success')
  } catch {
    modalError.value =
      'Não foi possível adicionar. O participante pode já ter recebido uma delegação.'
  } finally {
    saving.value = false
  }
}
watch(
  () => route.params.id,
  () => {
    tab.value = 0
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
            <AppButton @click="openParticipants">Adicionar participante +</AppButton>
          </div>
          <p v-if="!participants.length">Nenhum participante nesta delegação.</p>
          <ul class="participants">
            <li v-for="user in participants" :key="user.id">
              <h3>{{ user.name }}</h3>
              <p>{{ user.gang?.name || user.email }}</p>
            </li>
          </ul>
        </section>
        <template v-if="tab === 1"
          ><AppButton @click="modal = 'schedule'">Adicionar cronograma +</AppButton
          ><ScheduleListComponent :country-id="route.params.id" @open-details="scheduleId = $event"
        /></template>
        <template v-if="tab === 2"
          ><AppButton @click="modal = 'document'">Adicionar documento +</AppButton
          ><DocumentsListComponent :country-id="route.params.id"
        /></template>
        <UnderConstruction v-if="tab === 3" title="Notas em construção" />
      </template>
    </main>
    <ScheduleModal v-if="scheduleId" :schedule-id="scheduleId" @close="scheduleId = null" />
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
        <h2 id="participants-title">Adicionar participante</h2>
        <p v-if="saving" role="status">Carregando...</p>
        <template v-if="selected"
          ><p>
            Adicionar <strong>{{ selected.name }}</strong> à delegação de {{ country.name }}?
          </p>
        </template>
        <template v-else
          ><AppInput v-model="query" label="Pesquisar discente" type="search" />
          <ul class="participant-options">
            <li v-for="user in available" :key="user.id">
              <AppButton variant="secondary" :disabled="saving" @click="selected = user"
                ><span class="participant-option-copy"
                  ><strong>{{ user.name }}</strong
                  ><small>{{ user.email }}</small></span
                ><span class="mdi mdi-plus" aria-hidden="true"></span
              ></AppButton>
            </li>
          </ul>
          <p v-if="!saving && !available.length">Nenhum discente disponível.</p></template
        >
        <p v-if="modalError" role="alert">{{ modalError }}</p>
        <footer class="modal-actions">
          <AppButton v-if="selected" variant="danger" :disabled="saving" @click="selected = null"
            >Cancelar seleção</AppButton
          >
          <AppButton v-else variant="danger" :disabled="saving" @click="close">Cancelar</AppButton>
          <AppButton v-if="selected" :disabled="saving" @click="addParticipant"
            >Confirmar</AppButton
          >
        </footer>
      </section>
    </AppModal>
  </AppLayout>
</template>
<style scoped>
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
.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}
.modal-actions .app-button {
  margin: 0;
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
