<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import BannerComponent from '@/components/layout/BannerComponent.vue'
import HistoryTopic from '@/components/history/HistoryTopic.vue'
import HistoryTimeline from '@/components/history/HistoryTimeline.vue'
import history from '@/components/history/history.json'

const search = ref('')
const pageTop = ref(null)
function backToTop() {
  pageTop.value?.focus({ preventScroll: true })
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
const query = computed(() => search.value.trim().toLocaleLowerCase('pt-BR'))
const topics = computed(() => history.sections.filter(topic => {
  const text = [topic.title, ...(topic.blocks || []).flatMap(block => [block.heading, block.text, block.after])]
  return text.join(' ').toLocaleLowerCase('pt-BR').includes(query.value)
}))
</script>

<template>
  <AppLayout title="História">
    <main ref="pageTop" tabindex="-1" class="history-page">
      <BannerComponent title="História" subtitle="Conheça o SINUCA" icon="mdi mdi-book-open-page-variant-outline" />
      <label class="search">
        <span class="mdi mdi-magnify" aria-hidden="true"></span>
        <input v-model="search" type="search" aria-label="Pesquisar" placeholder="Pesquisar" />
      </label>
      <div v-if="topics.length" class="topics">
        <HistoryTopic v-for="topic in topics" :key="topic.title" :topic="topic" />
      </div>
      <HistoryTimeline :editions="history.editions" :query="query" />
      <button type="button" class="back-top" @click="backToTop"><span class="mdi mdi-arrow-up" aria-hidden="true"></span> Voltar ao topo</button>
    </main>
  </AppLayout>
</template>

<style scoped>
.history-page {
  --history-body: #555d68;
  --history-title: #01295f;
  --history-card-shadow: 0 1px 4px rgb(1 41 95 / 7%);
  display: grid; gap: 1.5rem; max-width: 68rem; margin-inline: auto; line-height: 1.5; }
.search { display: flex; gap: .75rem; align-items: center; background: white; border: 1px solid #d9d9d9; border-radius: .5rem; padding: .65rem 1rem; }
.search:focus-within { outline: 2px solid #01295f; }
.search input { width: 100%; border: none; outline: none; background: transparent; color: inherit; font: inherit; }
.topics { display: grid; gap: .85rem; }
@media (max-width: 1023px) { .history-page { padding: 1.25rem 1rem 7rem; } }
.back-top { justify-self: center; padding: .75rem 1.25rem; border: 0; border-radius: .5rem; background: #01295f; color: white; font: inherit; cursor: pointer; }
</style>
