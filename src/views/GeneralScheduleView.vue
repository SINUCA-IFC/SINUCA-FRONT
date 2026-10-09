<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import ScheduleDaySelector from '@/components/schedule/ScheduleDaySelector.vue'
import ScheduleItem from '@/components/schedule/ScheduleItem.vue'
import schedule from '@/data/cronograma.json'

const selectedDay = ref(schedule.dias.find((item) => item.id === 'dia-1')?.id ?? schedule.dias[0]?.id)
const day = computed(() => schedule.dias.find((item) => item.id === selectedDay.value))
const activities = computed(() =>
  [...(day.value?.atividades ?? [])].sort((a, b) => a.inicio.localeCompare(b.inicio)),
)
</script>

<template>
  <AppLayout title="Cronograma geral">
    <section class="schedule-page">
      <div class="schedule-header">
        <h1>SINUCA 2026<br/>Programação.</h1>
        <p>Acompanhe os horários e locais das atividades do evento.</p>
      </div>

      <ScheduleDaySelector v-model="selectedDay" :days="schedule.dias" />

      <div>
          <h2 class="day-heading">{{ activities.length }} atividades previstas.</h2>
        <ul v-if="activities.length" class="schedule-list">
          <ScheduleItem v-for="activity in activities" :key="activity.id" :activity="activity" />
        </ul>
        <p v-else class="empty">A programação deste dia será divulgada em breve.</p>
      </div>
    </section>
  </AppLayout>
</template>

<style scoped>
.schedule-page {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 1rem 1rem calc(7rem + env(safe-area-inset-bottom, 0px));
  max-width: 920px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.schedule-header {
  border-radius: 16px;
  padding: 1.25rem;
  background: #fff;
}
h1 {
  font-size: clamp(1.6rem, 3vw, 2.6rem);
  line-height: 1.25;
  margin: 0 0 0.75rem;
}
.schedule-header p {
  color: #606976;
  font-size: 0.9rem;
  line-height: 1.7;
}

h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #01295f;
  line-height: 1.5;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}
.empty {
  color: #606976;
  font-size: 0.8rem;
  line-height: 1.6;
  text-align: center;
}
@media (min-width: 600px) {
  .schedule-page {
    padding-inline: 1.5rem;
    gap: 1.75rem;
  }
  .schedule-header {
    padding: 1.75rem;
  }
}
@media (min-width: 1024px) {
  .schedule-page {
    padding: 0;
  }
  .schedule-header {
    padding: 2.5rem;
  }
}
</style>
