<script setup>
import { computed, ref } from 'vue'
import { onMounted } from 'vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import AppButton from '@/components/forms/AppButton.vue'
import { formatShortDate as formatDate } from '@/utils/date'
import { useToastStore } from '@/stores/toastStore'
const error = ref('')

const scheduleStore = useScheduleStore()
const props = defineProps({ countryId: [String, Number] })
const schedules = computed(() =>
  scheduleStore.schedules.filter(
    (item) =>
      !props.countryId ||
      item.country?.some((id) => String(id.id ?? id) === String(props.countryId)),
  ),
)

const emit = defineEmits(['openDetails'])

async function loadSchedules() {
  error.value = ''
  try {
    await scheduleStore.getSchedules()
  } catch {
    error.value = 'Não foi possível carregar o cronograma. Tente novamente.'
    useToastStore().show(error.value, 'error')
  }
}
onMounted(loadSchedules)

function openSchedule(scheduleId) {
  emit('openDetails', scheduleId)
}
</script>

<template>
  <section>
    <div class="header-section">
      <h4 style="font-weight: bolder; font-size: 1.5rem; margin-bottom: 1.5rem">Cronograma</h4>
    </div>
    <p v-if="scheduleStore.loading" role="status">Carregando cronograma...</p>
    <div v-else-if="error">
      <p role="alert">{{ error }}</p>
      <AppButton @click="loadSchedules">Tentar novamente</AppButton>
    </div>
    <p v-else-if="!schedules.length">Nenhuma atividade no cronograma por enquanto.</p>
    <ul v-else>
      <li
        v-for="s in schedules"
        :key="s.id"
        class="schedule-item"
        role="button"
        tabindex="0"
        @click="openSchedule(String(s.id))"
        @keydown.enter="openSchedule(String(s.id))"
        @keydown.space.prevent="openSchedule(String(s.id))"
      >
        <div class="header-schedule">
          <span style="color: #969696" v-if="s.category == '1'" class="mdi mdi-instagram">
            Postagem
          </span>

          <span style="color: #969696" v-else-if="s.category == '2'" class="mdi mdi-forum-outline">
            Debate
          </span>

          <span
            style="color: #969696"
            v-else-if="s.category == '3'"
            class="mdi mdi-handshake-outline"
          >
            Mesa de cooperação
          </span>

          <span style="color: #969696" v-else-if="s.category == '4'" class="mdi mdi-drama-masks">
            Apresentação cultural
          </span>

          <p style="font-weight: 500">
            <span
              class="mdi mdi-calendar-blank"
              style="font-size: 1.05rem; white-space: nowrap"
            ></span>
            {{ formatDate(s.endDate) }}
          </p>
        </div>
        <h3>
          {{ s.title }}
        </h3>
        <p style="font-size: 1rem; color: #969696">Clique para ver mais detalhes.</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
ul {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

li:active {
  transition: all 0.3s;
  transform: scale(0.95);
}

.schedule-item {
  cursor: pointer;
  margin-top: 0.6rem;
  padding: 1.2rem 1.4rem;
  background-color: #fff;
  border-radius: 0.8rem;
}
.schedule-item:focus-visible {
  outline: 3px solid #01295f;
  outline-offset: 3px;
}

.schedule-item:has(.mdi-instagram) {
  border-left: 0.9rem solid #fd151b;
}

.schedule-item:has(.mdi-forum-outline) {
  border-left: 0.9rem solid #01295f;
}

.schedule-item:has(.mdi-handshake-outline) {
  border-left: 0.9rem solid #849324;
}

.schedule-item:has(.mdi-drama-masks) {
  border-left: 0.9rem solid #ffb30f;
}

.header-schedule {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.2rem;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 0.6rem;
  max-width: 90%;
  word-break: break-word;
}

@media (max-width: 1023px) {
  .header-schedule {
    flex-wrap: wrap;
    gap: 0.75rem;
    line-height: 1.5;
  }
  .schedule-item h3 {
    max-width: 100%;
    line-height: 1.5;
  }
}
</style>
