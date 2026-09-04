<script setup>
import { useScheduleStore } from '@/stores/scheduleStore'
import { useCountryStore } from '@/stores/countryStore'
import { useLinkStore } from '@/stores/linkStore'
import { onMounted, ref, computed, onUnmounted, watch } from 'vue'

const props = defineProps({
  scheduleId: String,
})

const countryStore = useCountryStore()
const scheduleStore = useScheduleStore()
const linkStore = useLinkStore()

const formatDate = (data) => {
  if (!data) return ''
  const date = new Date(data)

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    day: '2-digit',
  }).format(date)
}

const formatTime = (data) => {
  if (!data) return ''
  const date = new Date(data)

  return new Intl.DateTimeFormat('pt-BR', {
    timeStyle: 'short',
  }).format(date)
}

const countrys = ref([])

const loadSchedule = async () => {
  countrys.value = []

  await scheduleStore.getSchedule(props.scheduleId)

  if (scheduleStore.schedule.category == 2) {
    for (const c of scheduleStore.schedule.country || []) {
      await countryStore.getCountry(c)

      countrys.value.push({ ...countryStore.country })
    }
  }

  await linkStore.getLinks()
}

onMounted(async () => {
  document.body.style.overflow = 'hidden'
  await loadSchedule()
})

watch(
  () => props.scheduleId,
  async () => {
    await loadSchedule()
  },
)

const nameCategory = computed(() => {
  switch (scheduleStore.schedule.category) {
    case '1':
      return 'Postagem'
    case '2':
      return 'Debate'
    case '3':
      return 'Mesa de cooperação'
    default:
      return ''
  }
})

const emits = defineEmits(['close'])

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="background" @click="emits('close')"></div>
  <section
    v-if="scheduleStore.schedule.category == 1"
    class="modal"
    style="border-top: #fd151b solid 1.8rem"
  >
    <div class="header">
      <div class="title">
        <h2>Postagem</h2>
        <span
          class="mdi mdi-close"
          style="color: #969696; font-size: 2rem"
          @click="emits('close')"
        ></span>
      </div>
    </div>
    <div class="topic">
      <h4>Tema da postagem</h4>
      <h3>
        {{ scheduleStore.schedule.title }}
      </h3>
    </div>

    <div class="uldiv">
      <ul class="schedules-infos">
        <li>
          <span class="mdi mdi-calendar-month-outline"></span>
          {{ formatDate(scheduleStore.schedule.startDate) }}
        </li>
        <li>
          <span class="mdi mdi-calendar-month-outline"></span>
          {{ formatDate(scheduleStore.schedule.endDate) }}
        </li>
      </ul>
    </div>
    <div class="descricao">
      <h3>Sobre a postagem</h3>
      <p>
        {{ scheduleStore.schedule.description }}
      </p>
    </div>
    <div class="docs" v-if="linkStore.links.length > 0">
      <h3><span class="mdi mdi-file-document-outline"></span> Documentos relacionados</h3>
      <div>
        <a v-for="link in linkStore.links" :key="link.id" :href="link.url" target="_blank">{{
          link.url
        }}</a>
      </div>
    </div>
  </section>
  <section
    v-else-if="scheduleStore.schedule.category == 2"
    class="modal"
    style="border-top: #01295f solid 1.8rem"
  >
    <div class="header">
      <div class="title">
        <h2>Debate</h2>

        <span
          class="mdi mdi-close"
          style="color: #969696; font-size: 2rem"
          @click="emits('close')"
        ></span>
      </div>
      <div class="countrys">
        <div>
          <img :src="countrys[0]?.flag?.url" alt="" />
          <h5>
            {{ countrys[0]?.name }}
          </h5>
        </div>
        <span> VS </span>
        <div>
          <img :src="countrys[1]?.flag?.url" alt="" />
          <h5>
            {{ countrys[1]?.name }}
          </h5>
        </div>
      </div>
    </div>
    <div class="topic">
      <h4>Tema do debate</h4>
      <h3>
        {{ scheduleStore.schedule.title }}
      </h3>
    </div>
    <div class="uldiv">
      <ul class="schedules-infos">
        <li>
          <span class="mdi mdi-calendar-month-outline"></span>
          {{ formatDate(scheduleStore.schedule.startDate) }}
        </li>
        <li>
          <span class="mdi mdi-map-marker-outline"></span>
          {{ scheduleStore.schedule.location }}
        </li>
        <li>
          <span class="mdi mdi-clock-outline"></span>
          {{ formatTime(scheduleStore.schedule.startDate) }}
        </li>
        <li>
          <span class="mdi mdi-clock-outline"></span>
          {{ formatTime(scheduleStore.schedule.endDate) }}
        </li>
      </ul>
    </div>
    <div class="descricao">
      <h3>Sobre o debate</h3>
      <p>
        {{ scheduleStore.schedule.description }}
      </p>
    </div>
    <div class="docs" v-if="linkStore.link">
      <h3><span class="mdi mdi-file-document-outline"></span> Documentos relacionados</h3>
      <div>
        <a v-for="link in linkStore.links" :key="link.id" :href="link.url" target="_blank">{{
          link.url
        }}</a>
      </div>
    </div>
  </section>
  <section
    v-else-if="scheduleStore.schedule.category == 3"
    class="modal"
    style="border-top: #849324 solid 1.8rem"
  >
    <div class="header">
      <div class="title">
        <h2>Mesa de cooperação</h2>
        <span
          class="mdi mdi-close"
          style="color: #969696; font-size: 2rem"
          @click="emits('close')"
        ></span>
      </div>
      <div class="topic">
        <h4>Tema da mesa de cooperação</h4>
        <h3>
          {{ scheduleStore.schedule.title }}
        </h3>
      </div>
    </div>

    <div class="uldiv">
      <ul class="schedules-infos">
        <li>
          <span class="mdi mdi-calendar-month-outline"></span>
          {{ formatDate(scheduleStore.schedule.startDate) }}
        </li>
        <li>
          <span class="mdi mdi-map-marker-outline"></span>
          {{ scheduleStore.schedule.location }}
        </li>
        <li>
          <span class="mdi mdi-clock-outline"></span>
          {{ formatTime(scheduleStore.schedule.startDate) }}
        </li>
        <li>
          <span class="mdi mdi-clock-outline"></span>
          {{ formatTime(scheduleStore.schedule.endDate) }}
        </li>
      </ul>
    </div>

    <div class="descricao">
      <h3>Sobre a mesa de cooperação</h3>
      <p>
        {{ scheduleStore.schedule.description }}
      </p>
    </div>

    <div class="docs" v-if="linkStore.link">
      <h3><span class="mdi mdi-file-document-outline"></span> Documentos relacionados</h3>
      <div>
        <a v-for="link in linkStore.links" :key="link.id" :href="link.url" target="_blank">{{
          link.url
        }}</a>
      </div>
    </div>
  </section>
<section
    v-else-if="scheduleStore.schedule.category == 4"
    class="modal"
    style="border-top: #FFB30F solid 1.8rem"
  >
    <div class="header">
      <div class="title">
        <h2>Apresentação cultural</h2>

        <span
          class="mdi mdi-close"
          style="color: #969696; font-size: 2rem"
          @click="emits('close')"
        ></span>
      </div>
    </div>
    <div class="topic">
      <h4>Título da apresentação cultural</h4>
      <h3>
        {{ scheduleStore.schedule.title }}
      </h3>
    </div>
    <div class="uldiv">
      <ul class="schedules-infos">
        <li>
          <span class="mdi mdi-calendar-month-outline"></span>
          {{ formatDate(scheduleStore.schedule.startDate) }}
        </li>
        <li>
          <span class="mdi mdi-map-marker-outline"></span>
          {{ scheduleStore.schedule.location }}
        </li>
        <li>
          <span class="mdi mdi-clock-outline"></span>
          {{ formatTime(scheduleStore.schedule.startDate) }} - {{ formatTime(scheduleStore.schedule.endDate) }}
        </li>
        <li>
          <span class="mdi mdi-clock-outline"></span>
          {{ scheduleStore.schedule.tipo }}
        </li>
      </ul>
    </div>
    <div class="descricao">
      <h3>Sobre a apresentação cultural</h3>
      <p>
        {{ scheduleStore.schedule.description }}
      </p>
    </div>
    <div class="docs" v-if="linkStore.link">
      <h3><span class="mdi mdi-file-document-outline"></span> Documentos relacionados</h3>
      <div>
        <a v-for="link in linkStore.links" :key="link.id" :href="link.url" target="_blank">{{
          link.url
        }}</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.background {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  backdrop-filter: blur(2px);
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
  height: 100vh;
  width: 100%;
}

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
}

.countrys {
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-weight: 500;
  margin: 1rem 0;
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
  margin: 1rem 0;
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
  margin: 1rem 0;
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

div.docs div {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-template-rows: auto;
  gap: 1rem;
}

div.docs h3 {
  color: #01295f;
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 1rem;
}
</style>
