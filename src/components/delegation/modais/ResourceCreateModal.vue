<script setup>
import BackButton from '@/components/layout/BackButton.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import AppModal from '@/components/layout/AppModal.vue'
import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/forms/AppButton.vue'
import TaskCategorySelect from '@/components/tasks/TaskCategorySelect.vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useLinkStore } from '@/stores/linkStore'
import { useCountryStore } from '@/stores/countryStore'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({ kind: String, countryId: Number })
const emit = defineEmits(['close'])
const schedules = useScheduleStore(),
  links = useLinkStore(),
  countries = useCountryStore()
const saving = ref(false),
  error = ref(''),
  confirming = ref(false),
  loading = ref(false)
const form = reactive({
  title: '',
  description: '',
  url: '',
  category: 2,
  date: '',
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
const eligibleDocs = computed(() =>
  links.links.filter((doc) =>
    [
      props.countryId,
      ...(form.category === 2 && form.opponent ? [Number(form.opponent)] : []),
    ].every((id) => doc.country?.some((country) => Number(country.id ?? country) === id)),
  ),
)
function close() {
  if (!saving.value) emit('close')
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    await Promise.all([countries.getCountrys(), links.getLinks()])
  } catch {
    error.value = 'Não foi possível carregar as opções. Tente novamente.'
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  if (props.kind === 'schedule') load()
})
function review() {
  error.value = ''
  if (props.kind === 'schedule' && form.category !== 1 && form.end <= form.start) {
    error.value = 'O horário final deve ser posterior ao inicial.'
    return
  }
  confirming.value = true
}
async function save() {
  if (saving.value) return
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
      const start = form.category === 1 ? '00:00' : form.start
      const end = form.category === 1 ? '23:59' : form.end
      await schedules.createSchedule({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        startDate: new Date(`${form.date}T${start}`).toISOString(),
        endDate: new Date(`${form.date}T${end}`).toISOString(),
        location: form.category === 1 ? '' : form.location.trim(),
        tipo: form.category === 4 ? Number(form.tipo) : null,
        country: [props.countryId, ...(form.category === 2 ? [Number(form.opponent)] : [])],
        docs: form.docs.filter((id) => eligibleDocs.value.some((doc) => doc.id === id)),
      })
    }
    useToastStore().show('Cadastro concluído.', 'success')
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
          {{ kind === 'document' ? 'Novo documento' : 'Novo Cronograma' }}
        </h2>
        <AppButton variant="secondary" aria-label="Fechar" :disabled="saving" @click="close"
          ><span class="mdi mdi-close" aria-hidden="true"></span
        ></AppButton>
      </header>
      <p v-if="loading" role="status">Carregando opções...</p>
      <form v-if="!confirming" @submit.prevent="review">
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
            <AppInput v-model="form.date" label="Data" type="date" required /><AppInput
              v-if="form.category !== 1"
              v-model="form.location"
              label="Local"
              :required="form.category !== 2"
              maxlength="100"
            />
          </div>
          <label v-if="form.category === 4" class="field"
            >Categoria de apresentação *<select v-model="form.tipo" required>
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
        <footer class="form-actions">
          <AppButton variant="secondary" @click="close">Cancelar</AppButton
          ><AppButton type="submit" :disabled="saving || loading">Adicionar</AppButton>
        </footer>
      </form>
      <div v-else>
        <p>
          Confirmar o cadastro de <strong>{{ form.title }}</strong> nesta delegação?
        </p>
        <BackButton :disabled="saving" @click="confirming = false" />
        <AppButton :disabled="saving" @click="save">{{
          saving ? 'Salvando...' : 'Confirmar cadastro'
        }}</AppButton>
      </div>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <AppButton
        v-if="error && kind === 'schedule' && !confirming"
        variant="secondary"
        @click="load"
        >Recarregar opções</AppButton
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
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #e8edf2;
  padding-top: 1.25rem;
  margin-top: 0.25rem;
}
.form-actions .app-button {
  margin: 0;
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
