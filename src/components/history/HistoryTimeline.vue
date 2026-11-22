<script setup>
import { computed, ref } from 'vue'
import FilterMenu from '@/components/forms/FilterMenu.vue'
import { useIsDesktop } from '@/composables/useIsDesktop'

const props = defineProps({ editions: { type: Array, required: true }, query: { type: String, default: '' } })
const selectedYear = ref(null)
const yearOptions = computed(() => props.editions.map(({ year }) => ({ id: year, name: year })))
const desktop = useIsDesktop()
const wording = (item) => typeof item === 'string' ? item : desktop.value ? item.desktop : item.mobile
const visibleEditions = computed(() => props.editions.filter(edition => {
  if (selectedYear.value && edition.year !== selectedYear.value) return false
  const text = [edition.year, edition.title, edition.intro, ...edition.groups.flatMap(group => [group.title, ...group.items.map(wording)])]
  return text.join(' ').toLocaleLowerCase('pt-BR').includes(props.query)
}))
</script>

<template>
  <section aria-labelledby="editions-title">
    <header class="timeline-tools">
      <h2 id="editions-title">{{ desktop ? 'Últimas Edições' : 'Ultimas Edições' }}</h2>
      <FilterMenu v-model="selectedYear" :options="yearOptions" all-label="Todos os anos" />
    </header>
    <ol class="timeline">
      <li v-for="edition in visibleEditions" :key="edition.year">
        <strong class="year">{{ edition.year }}</strong>
        <article>
          <h3>{{ edition.title }}</h3>
          <img :src="'/static/history/' + edition.image" :alt="edition.title" loading="lazy" />
          <p v-if="edition.intro">{{ edition.intro }}</p>
          <section v-for="group in edition.groups" :key="group.title">
            <h4>{{ group.title }}</h4>
            <ul v-if="group.items.length > 1" :class="{ countries: group.title === 'Delegações Participantes' }">
              <li v-for="item in group.items" :key="wording(item)" :class="{ award: group.title === 'Delegações Participantes' && wording(item).includes(' - ') }">
                <template v-if="group.title === 'Debates' && wording(item).includes(':')"><strong>{{ wording(item).split(':')[0] }}:</strong>{{ wording(item).slice(wording(item).indexOf(':') + 1) }}</template>
                <template v-else>{{ wording(item) }}</template>
                <span v-if="group.title === 'Delegações Participantes' && wording(item).includes('Vencedor Geral')" class="mdi mdi-crown-outline" aria-hidden="true"></span>
              </li>
            </ul>
            <p v-else>{{ wording(group.items[0]) }}</p>
          </section>
        </article>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.timeline-tools { display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap; }
h2 { font-weight: 600; font-size: clamp(1.3rem, 2.5vw, 1.9rem); }
.timeline { margin: 2rem 0; padding: 0; list-style: none; }
.timeline > li { position: relative; padding: 0 0 2.5rem 1.5rem; border-left: 2px solid #ccd6e3; }
.year { color: var(--history-title); font-size: 1.5rem; font-weight: 700; }
.year::before { content: ''; position: absolute; left: -6px; top: .6rem; width: 10px; height: 10px; border-radius: 50%; background: #01295f; }
article { background: white; color: var(--history-body); box-shadow: var(--history-card-shadow); border-radius: .65rem; padding: clamp(1rem, 3vw, 2rem); margin-top: .75rem; line-height: 1.65; }
article img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; margin: .75rem 0; border-radius: 5px; }
h3, h4 { font-weight: 600; }
h3 { font-size: clamp(1.2rem, 2vw, 1.625rem); font-weight: 700; color: var(--history-title); }
article .countries { list-style: none; padding: 0; }
.countries .award { color: var(--history-title); font-weight: 600; }
.award .mdi { margin-inline-start: .25rem; }
article li strong { font-weight: 600; }
h4 { color: var(--history-title); margin: 1.25rem 0 .35rem; }
article ul { list-style: disc; padding-left: 1.25rem; }
@media (min-width: 1024px) {
  .timeline { position: relative; }
  .timeline::before { content: ''; position: absolute; left: 50%; inset-block: 0; border-left: 2px solid #ccd6e3; }
  .timeline > li { width: 50%; padding-inline: 1.5rem; border: none; }
  .timeline > li:nth-child(even) { margin-left: 50%; }
  .timeline > li:nth-child(odd) .year::before { left: auto; right: -6px; }
  .timeline > li:nth-child(odd) { text-align: right; }
  .timeline > li:nth-child(odd) .year { display: block; }
  .timeline > li:nth-child(odd) article ul:not(.countries) { list-style-position: inside; padding-left: 0; }
}
</style>
