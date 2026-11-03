<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import ScheduleService from '@/services/scheduleService'
import CountryService from '@/services/countryService'
import { formatLongDate as formatDate, formatTime } from '@/utils/date'

const props = defineProps({
  scheduleId: [String, Number],
})
const emit = defineEmits(['close'])

const scheduleService = new ScheduleService()
const countryService = new CountryService()
const schedule = ref(null)
const countries = ref([])
const loading = ref(false)
const error = ref('')
let requestId = 0

const categories = {
  1: { name: 'Postagem', topic: 'Tema da postagem', about: 'Sobre a postagem', color: '#fd151b' },
  2: { name: 'Debate', topic: 'Tema do debate', about: 'Sobre o debate', color: '#01295f' },
  3: { name: 'Mesa de cooperação', topic: 'Tema da mesa de cooperação', about: 'Sobre a mesa de cooperação', color: '#849324' },
  4: { name: 'Apresentação cultural', topic: 'Título da apresentação cultural', about: 'Sobre a apresentação cultural', color: '#FFB30F' },
}

const categoryId = computed(() => Number(schedule.value?.category))
const category = computed(() => categories[categoryId.value])

async function loadSchedule() {
  const currentRequest = ++requestId
  schedule.value = null
  countries.value = []
  error.value = ''
  loading.value = true

  try {
    if (props.scheduleId == null || props.scheduleId === '') {
      throw new Error('Missing schedule ID')
    }

    const data = await scheduleService.getSchedule(props.scheduleId)
    if (currentRequest !== requestId) return

    const participants = Number(data.category) === 2
      ? await Promise.all((data.country || []).map(id => countryService.getCountry(id)))
      : []
    if (currentRequest !== requestId) return

    schedule.value = data
    countries.value = participants
  } catch {
    if (currentRequest === requestId) {
      error.value = 'Não foi possível carregar os detalhes. Tente novamente.'
    }
  } finally {
    if (currentRequest === requestId) loading.value = false
  }
}

watch(() => props.scheduleId, loadSchedule, { immediate: true })
onBeforeUnmount(() => { requestId += 1 })

</script>

<template>
  <section
    class="modal"
    :style="{ borderTop: '1.8rem solid ' + (category?.color || '#01295f') }"
  >
    <div class="header">
      <div class="title">
        <h2>{{ category?.name || 'Detalhes do cronograma' }}</h2>
        <button
          type="button"
          class="close-button"
          aria-label="Fechar detalhes"
          @click="emit('close')"
        >
          <span class="mdi mdi-close" aria-hidden="true"></span>
        </button>
      </div>
      <div v-if="!loading && !error && categoryId === 2" class="countrys">
        <div>
          <img :src="countries[0]?.flag?.url" alt="" />
          <h5>{{ countries[0]?.name }}</h5>
        </div>
        <span> VS </span>
        <div>
          <img :src="countries[1]?.flag?.url" alt="" />
          <h5>{{ countries[1]?.name }}</h5>
        </div>
      </div>
    </div>

    <p v-if="loading" class="feedback" role="status">Carregando detalhes...</p>
    <div v-else-if="error" class="feedback">
      <p role="alert">{{ error }}</p>
      <button type="button" class="retry-button" @click="loadSchedule">Tentar novamente</button>
    </div>
    <p v-else-if="!category" class="feedback" role="status">Categoria de cronograma desconhecida.</p>
    <template v-else>
    <div class="topic">
      <h4>{{ category.topic }}</h4>
      <h3>{{ schedule.title }}</h3>
    </div>

    <div class="uldiv">
      <ul class="schedules-infos">
        <li>
          <span class="mdi mdi-calendar-month-outline"></span>
          {{ formatDate(schedule.startDate) }}
        </li>
        <li v-if="categoryId === 1">
          <span class="mdi mdi-calendar-month-outline"></span>
          {{ formatDate(schedule.endDate) }}
        </li>
        <template v-else>
          <li>
            <span class="mdi mdi-map-marker-outline"></span>
            {{ schedule.location }}
          </li>
          <li>
            <span class="mdi mdi-clock-outline"></span>
            {{ formatTime(schedule.startDate) }}
            <template v-if="categoryId === 4">
              - {{ formatTime(schedule.endDate) }}
            </template>
          </li>
          <li v-if="categoryId === 4">
            <span class="mdi mdi-clock-outline"></span>
            {{ schedule.tipo == 1 ? 'Dança típica' : 'Comida típica' }}
          </li>
          <li v-else>
            <span class="mdi mdi-clock-outline"></span>
            {{ formatTime(schedule.endDate) }}
          </li>
        </template>
      </ul>
    </div>

    <div class="descricao">
      <h3>{{ category.about }}</h3>
      <p>{{ schedule.description }}</p>
    </div>

    </template>
  </section>
</template>

<style scoped>
.modal {
  border-radius: 0.8rem;
  height: 400px;
  width: 80%;
  z-index: 20;
  position: fixed;
  background-color: #ffffff;
  padding: 1.5rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow-y: auto;
}
.title {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  margin-bottom: 2rem;
}
.title h2 {
  font-size: clamp(1.6rem, 4vw, 2rem);
  font-weight: 500;
}
.countrys {
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-weight: 500;
}
img {
  width: 5rem;
  height: auto;
  border-radius: 10%;
}
.topic {
  border: 2px solid #e0e0e0;
  padding: 1rem;
  border-radius: 10px;
  margin: 2rem 0 1.5rem 0;
}
.topic h4 {
  color: #01295f;
  font-weight: 500;
}
.topic h3 {
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.uldiv {
  margin: 1rem 0;
}

.schedules-infos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto;
  gap: 1rem;
  text-align: center;
}

.schedules-infos li {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 2vw 0;
  font-size: 0.9rem;
}

.descricao {
  margin: 2rem 0;
}

.descricao h3 {
  color: #01295f;
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.descricao p {
  text-align: justify;
  line-height: 1.3;
  font-size: 0.9rem;
}

.feedback { line-height: 1.5; }
.retry-button { margin-top: 1rem; cursor: pointer; }
.close-button {
  border: 0;
  padding: 0;
  background: transparent;
  color: #969696;
  font-size: 2rem;
  cursor: pointer;
}
.close-button:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 4px;
}
.mdi-close {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.mdi-close:active {
  transform: scale(0.8);
}

@media (min-width: 1024px) {
.modal {
  z-index: 1;
  position: absolute;
  width: 50%;
  height: 80%;
}
}
@media (max-width: 1023px) {
  .modal { width: calc(100% - 2rem); height: auto; max-height: 85dvh; padding: 1rem; }
  .title { gap: 0.75rem; }
  .title h2 { min-width: 0; }
  .schedules-infos { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .schedules-infos li { padding: 0.75rem 0.25rem; line-height: 1.5; }
  .countrys { gap: 0.75rem; }
  .countrys > div { min-width: 0; flex: 1; text-align: center; }
  .countrys h5 { overflow-wrap: anywhere; line-height: 1.5; }
}
</style>
