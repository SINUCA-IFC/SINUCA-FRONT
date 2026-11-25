<script setup>
import ModalActions from '@/components/layout/ModalActions.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import AppModal from '@/components/layout/AppModal.vue'
import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/forms/AppButton.vue'
import TaskCategorySelect from '@/components/tasks/TaskCategorySelect.vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useLinkStore } from '@/stores/linkStore'
import { useCountryStore } from '@/stores/countryStore'
import { useToastStore } from '@/stores/toastStore'
import ScheduleService from '@/services/scheduleService'

const props = defineProps({ kind: String, countryId: Number, scheduleId: [String, Number] })
const emit = defineEmits(['close'])
const schedules = useScheduleStore(),
  links = useLinkStore(),
  countries = useCountryStore()
const saving = ref(false),
  error = ref(''),
  confirming = ref(false),
  loading = ref(false)
const loadError = ref('')
const original = ref(null)
const isEditing = computed(() => props.kind === 'schedule' && props.scheduleId != null)
const dateFields = (value) => {
  const date = new Date(value)
  const pad = (part) => String(part).padStart(2, '0')
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}
const multiDay = computed(
  () =>
    original.value &&
    dateFields(original.value.startDate).date !== dateFields(original.value.endDate).date,
)
const form = reactive({
  title: '',
  description: '',
  url: '',
  category: 2,
  date: '',
  endDate: '',
  start: '',
  end: '',
  location: '',
  opponent: '',
  tipo: 1,
  docs: [],
})
const categories = [
  { id: 2, name: 'Debate' },
  { id: 1, name: 'Postagem' },
  { id: 4, name: 'Apresentação cultural' },
  { id: 3, name: 'Mesa de cooperação' },
]
const selectedCategories = computed({
  get: () => [form.category],
  set: (values) => {
    if (values.length) form.category = values.at(-1)
  },
})
const categoryStyles = {
  1: {
    icon: 'mdi mdi-instagram',
    activeStyle: 'background:#fff0f1;color:#b91c32;border-color:#b91c32',
  },
  2: {
    icon: 'mdi mdi-forum-outline',
    activeStyle: 'background:#edf3fc;color:#01295f;border-color:#01295f',
  },
  3: {
    icon: 'mdi mdi-handshake-outline',
    activeStyle: 'background:#f3f5e8;color:#617018;border-color:#849324',
  },
  4: {
    icon: 'mdi mdi-drama-masks',
    activeStyle: 'background:#fff7e3;color:#795400;border-color:#d69a00',
  },
}
const scheduleCountries = computed(() => {
  if (original.value && Number(original.value.category) === form.category) {
    const ids = original.value.country.map((country) => Number(country.id ?? country))
    if (form.category !== 2 || !form.opponent) return ids
    const previousOpponent = ids.find((id) => id !== props.countryId)
    if (previousOpponent == null) return [...ids, Number(form.opponent)]
    return [...new Set(ids.map((id) => (id === previousOpponent ? Number(form.opponent) : id)))]
  }
  return [props.countryId, ...(form.category === 2 && form.opponent ? [Number(form.opponent)] : [])]
})
const eligibleDocs = computed(() =>
  links.links.filter((doc) =>
    scheduleCountries.value.every((id) =>
      doc.country?.some((country) => Number(country.id ?? country) === id),
    ),
  ),
)
function close() {
  if (!saving.value) emit('close')
}
async function load() {
  loading.value = true
  error.value = ''
  loadError.value = ''
  try {
    const [, , schedule] = await Promise.all([
      countries.getCountrys(),
      links.getLinks(),
      isEditing.value ? new ScheduleService().getSchedule(props.scheduleId) : null,
    ])
    if (schedule) {
      original.value = schedule
      Object.assign(form, {
        title: schedule.title,
        description: schedule.description,
        category: Number(schedule.category),
        date: dateFields(schedule.startDate).date,
        endDate: dateFields(schedule.endDate).date,
        start: dateFields(schedule.startDate).time,
        end: dateFields(schedule.endDate).time,
        location: schedule.location || '',
        opponent:
          (schedule.country || [])
            .map((country) => Number(country.id ?? country))
            .find((id) => id !== props.countryId) ?? '',
        tipo: schedule.tipo ?? null,
        docs: (schedule.docs || []).map((doc) => doc.id ?? doc),
      })
    }
  } catch {
    loadError.value = isEditing.value
      ? 'Não foi possível carregar o cronograma. Tente novamente.'
      : 'Não foi possível carregar as opções. Tente novamente.'
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  if (props.kind === 'schedule') load()
})
function review() {
  if (loading.value || loadError.value || saving.value) return
  error.value = ''
  if (
    props.kind === 'schedule' &&
    ((multiDay.value && form.endDate < form.date) ||
      (form.category !== 1 &&
        (!multiDay.value || form.endDate === form.date) &&
        form.end <= form.start))
  ) {
    error.value = 'O horário final deve ser posterior ao inicial.'
    return
  }
  confirming.value = true
}
function scheduleDate(edge) {
  const date = edge === 'start' || !multiDay.value ? form.date : form.endDate
  const time = form.category === 1 ? (edge === 'start' ? '00:00' : '23:59') : form[edge]
  if (original.value) {
    const value = original.value[`${edge}Date`]
    const previous = dateFields(value)
    if (
      date === previous.date &&
      Number(original.value.category) === form.category &&
      (form.category === 1 || form[edge] === previous.time)
    )
      return value
  }
  return new Date(`${date}T${time}`).toISOString()
}
async function save() {
  if (saving.value || loading.value || loadError.value) return
  saving.value = true
  error.value = ''
  try {
    if (props.kind === 'document') {
      const url = new URL(form.url)
      if (!['https:', 'http:'].includes(url.protocol))
        throw new Error('Informe um link HTTP ou HTTPS válido.')
      await links.createLink({
        name: form.title.trim(),
        url: url.href,
        country: [props.countryId],
        category: form.category,
      })
    } else {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        startDate: scheduleDate('start'),
        endDate: scheduleDate('end'),
        location:
          form.category === 1
            ? Number(original.value?.category) === 1
              ? original.value.location
              : ''
            : form.location.trim(),
        tipo:
          form.category === 4
            ? form.tipo == null
              ? null
              : Number(form.tipo)
            : Number(original.value?.category) === form.category
              ? original.value.tipo
              : null,
        country: scheduleCountries.value,
        docs: form.docs.filter((id) =>
          eligibleDocs.value.some((doc) => String(doc.id) === String(id)),
        ),
      }
      if (isEditing.value) await schedules.updateSchedule(props.scheduleId, payload)
      else await schedules.createSchedule(payload)
    }
    useToastStore().show(
      isEditing.value ? 'Cronograma atualizado.' : 'Cadastro concluído.',
      'success',
    )
    emit('close')
  } catch (cause) {
    error.value = cause.response
      ? 'Não foi possível salvar. Confira os dados e tente novamente.'
      : cause.message
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <AppModal centered @close="close">
    <section
      class="modal-panel resource-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-title"
    >
      <header>
        <h2 id="resource-title">
          {{
            kind === 'document'
              ? 'Novo documento'
              : isEditing
                ? 'Editar cronograma'
                : 'Novo Cronograma'
          }}
        </h2>
        <AppButton variant="secondary" aria-label="Fechar" :disabled="saving" @click="close"
          ><span class="mdi mdi-close" aria-hidden="true"></span
        ></AppButton>
      </header>
      <p v-if="loading" role="status">Carregando opções...</p>
      <form v-if="!loading && !loadError && !confirming" @submit.prevent="review">
        <AppInput
          v-model="form.title"
          :label="kind === 'document' ? 'Nome' : 'Tema'"
          required
          maxlength="100"
        />
        <AppInput
          v-if="kind === 'document'"
          v-model="form.url"
          label="Link do documento"
          type="url"
          required
          placeholder="https://..."
        />
        <template v-else>
          <label class="field"
            >Descrição *<textarea
              v-model="form.description"
              required
              placeholder="Digite a descrição do cronograma aqui."
            ></textarea>
          </label>
          <TaskCategorySelect
            v-model="selectedCategories"
            :categories="categories"
            :category-styles="categoryStyles"
          />
          <div v-if="form.category === 2" class="two-columns">
            <AppInput
              :model-value="countries.countrys.find((c) => c.id === countryId)?.name"
              label="Primeiro país"
              disabled
            />
            <label class="field"
              >Segundo país *<select v-model="form.opponent" required>
                <option value="" disabled>Selecionar</option>
                <option
                  v-for="country in countries.countrys.filter((c) => c.id !== countryId)"
                  :key="country.id"
                  :value="country.id"
                >
                  {{ country.name }}
                </option>
              </select></label
            >
          </div>
          <div v-if="form.category !== 1" class="two-columns">
            <AppInput v-model="form.start" label="Horário inicial" type="time" required /><AppInput
              v-model="form.end"
              label="Horário final"
              type="time"
              required
            />
          </div>
          <div class="two-columns">
            <AppInput
              v-model="form.date"
              :label="multiDay ? 'Data inicial' : 'Data'"
              type="date"
              required
            />
            <AppInput
              v-if="multiDay"
              v-model="form.endDate"
              label="Data final"
              type="date"
              required
            />
            <AppInput
              v-if="form.category !== 1"
              v-model="form.location"
              label="Local"
              :required="form.category !== 2"
              maxlength="100"
            />
          </div>
          <label v-if="form.category === 4" class="field"
            >Categoria de apresentação<select v-model="form.tipo" :required="!isEditing">
              <option v-if="isEditing && original?.tipo == null" :value="null">
                Não informado
              </option>
              <option :value="1">Dança Típica</option>
              <option :value="2">Comida Típica</option>
            </select></label
          >
          <fieldset v-if="eligibleDocs.length">
            <legend>Documentos relacionados</legend>
            <label v-for="doc in eligibleDocs" :key="doc.id" class="document-choice"
              ><input v-model="form.docs" type="checkbox" :value="doc.id" /> {{ doc.name }}</label
            >
          </fieldset>
        </template>
        <TaskCategorySelect
          v-if="kind === 'document'"
          v-model="selectedCategories"
          :categories="categories.filter((item) => [2, 3].includes(item.id))"
          :category-styles="categoryStyles"
        />
        <ModalActions>
          <AppButton variant="danger" @click="close">Cancelar</AppButton
          ><AppButton type="submit" :disabled="saving || loading">{{
            isEditing ? 'Salvar alterações' : 'Adicionar'
          }}</AppButton>
        </ModalActions>
      </form>
      <div v-else-if="confirming">
        <p>
          {{ isEditing ? 'Confirmar as alterações de' : 'Confirmar o cadastro de' }}
          <strong>{{ form.title }}</strong> nesta delegação?
        </p>
        <ModalActions>
          <AppButton variant="danger" :disabled="saving" @click="confirming = false"
            >Cancelar confirmação</AppButton
          >
          <AppButton :disabled="saving" @click="save">{{
            saving ? 'Salvando...' : isEditing ? 'Confirmar alterações' : 'Confirmar cadastro'
          }}</AppButton>
        </ModalActions>
      </div>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <p v-if="loadError" role="alert" class="error">{{ loadError }}</p>
      <AppButton v-if="loadError && !loading" variant="secondary" @click="load"
        >Tentar novamente</AppButton
      >
    </section>
  </AppModal>
</template>
<style scoped>
.resource-panel :deep(.app-input) {
  margin: 0;
}
.resource-panel form {
  display: grid;
  gap: 1.25rem;
}
.resource-panel :deep(.label-class),
.field,
legend {
  font-size: 0.9375rem;
  font-weight: 500;
}
.resource-panel :deep(.label-class) {
  margin-bottom: 0.5rem;
}
.resource-panel :deep(.input-class),
textarea,
select {
  min-height: 48px;
  border: 1px solid #d8dfe7;
  border-radius: 8px;
  background: #fff;
}
.resource-panel :deep(.categories) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.625rem;
  margin: 0;
}
.resource-panel :deep(.category-option) {
  border: 1px solid #d8dfe7;
  border-radius: 8px;
  padding: 0.75rem;
  color: #526176;
  min-height: 52px;
}
.resource-panel :deep(.category-option p) {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.8rem !important;
}
.resource-panel :deep(.category-option .mdi) {
  font-size: 1.3rem;
  flex-shrink: 0;
}
.resource-panel :deep(.category-option.active) {
  border: 1px solid;
  font-weight: 600;
}
.resource-panel .field {
  margin: 0;
  gap: 0.5rem;
}
.resource-panel header {
  padding-bottom: 1rem;
  border-bottom: 1px solid #e8edf2;
}
.resource-panel header .app-button {
  min-width: 40px;
  border: 0;
  background: #f2f5f9;
  color: #65758a;
}
textarea:focus,
select:focus {
  outline: 2px solid #01295f;
  outline-offset: 2px;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
header .app-button {
  margin: 0;
  padding: 0.5rem;
}
h2 {
  font-size: 1.5rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
textarea,
select {
  width: 100%;
  min-height: 44px;
  border: 2px solid #d9d9d9;
  border-radius: 5px;
  padding: 0.75rem;
  font: inherit;
  background: white;
}
textarea {
  min-height: 150px;
  resize: vertical;
}
.two-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.document-choice {
  display: block;
  padding: 0.5rem;
}
fieldset {
  border: 0;
}
.error {
  color: #b00020;
  margin-top: 1rem;
}
@media (max-width: 600px) {
  .resource-panel {
    padding: 1.25rem !important;
  }
}
</style>
