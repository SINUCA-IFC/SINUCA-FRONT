<script setup>
import { computed } from 'vue'

const props = defineProps({ activity: { type: Object, required: true } })
const colors = {
  'Mesas de Cooperação': '#849324',
  'Apresentação cultural': '#FFB30F',
  Debate: '#01295F',
  'Programação geral': '#437F97',
}
const color = computed(() => colors[props.activity.categoria] || colors['Programação geral'])
</script>

<template>
  <li class="schedule-item" :style="{ '--activity-color': color }">
    <div class="time">
      <time :datetime="activity.inicio">{{ activity.inicio }}</time>
      <span v-if="activity.fim">até <time :datetime="activity.fim">{{ activity.fim }}</time></span>
    </div>
    <article class="activity">
      <span class="category">{{ activity.categoria }}</span>
      <h3>{{ activity.titulo }}</h3>
      <p v-if="activity.descricao" class="description">{{ activity.descricao }}</p>
      <p v-if="activity.local" class="location"><span class="mdi mdi-map-marker-outline" aria-hidden="true"></span>{{ activity.local }}</p>
    </article>
  </li>
</template>

<style scoped>
.schedule-item { display: grid; grid-template-columns: 65px minmax(0, 1fr); gap: 0.8rem; align-items: start; }
.time { display: flex; flex-direction: column; gap: 0.5rem; padding-top: 1.4rem; color: #01295f; font-size: 1.05rem; font-weight: 600; }
.time > span { color: #606976; font-size: 0.72rem; font-weight: 400; }
.activity { position: relative; background: #fff; border: 1px solid #e5e8ed; border-left: 8px solid var(--activity-color); border-radius: 12px; padding: 1.2rem; }
.category { display: inline-block; color: #435166; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; line-height: 1.5; overflow-wrap: anywhere; }
h3 { color: #01295f; font-size: 1.05rem; font-weight: 600; line-height: 1.5; margin: 0.6rem 0; overflow-wrap: anywhere; }
.description { color: #606976; font-size: 0.85rem; line-height: 1.7; }
.location { display: flex; gap: 0.4rem; align-items: baseline; color: #435166; font-size: 0.8rem; line-height: 1.5; margin-top: 1rem; }
@media (max-width: 479px) {
  .schedule-item {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0;
    background: #fff;
    border: 1px solid #e5e8ed;
    border-left: 8px solid var(--activity-color);
    border-radius: 12px;
    padding: 1rem;
  }
  .time {
    flex-direction: row;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0 0 0.75rem;
    line-height: 1.5;
  }
  .time > span { font-size: 0.8rem; }
  .activity { min-width: 0; border: 0; border-radius: 0; padding: 0; }
  h3 { font-size: 1rem; margin: 0.4rem 0; }
  .description, .location { overflow-wrap: anywhere; }
}
@media (min-width: 768px) {
  .schedule-item { grid-template-columns: 85px minmax(0, 1fr); gap: 1.25rem; }
  .activity { padding: 1.5rem 1.75rem; }
  .time { font-size: 1.25rem; }
  h3 { font-size: 1.2rem; }
}
</style>
