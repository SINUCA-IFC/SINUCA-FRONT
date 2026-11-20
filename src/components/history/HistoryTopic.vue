<script setup>
defineProps({ topic: { type: Object, required: true } })
</script>

<template>
  <details class="topic" :style="{ borderTopColor: topic.accent }">
    <summary>
      <span><span v-for="(part, index) in topic.title.split(/(SINUCA)/)" :key="index" :class="{ brand: part === 'SINUCA' }">{{ part }}</span></span>
      <span class="mdi mdi-chevron-down" aria-hidden="true"></span>
    </summary>
    <div class="article">
      <section v-for="block in topic.blocks" :key="block.image" class="passage" :class="block.layout">
        <h3 v-if="block.heading">{{ block.heading }}</h3>
        <p v-if="block.layout">{{ block.text }}</p>
        <img :src="'/static/history/' + block.image" alt="" loading="lazy" />
        <p v-if="block.after">{{ block.after }}</p>
        <p v-if="!block.layout && block.text">{{ block.text }}</p>
      </section>
    </div>
  </details>
</template>

<style scoped>
.topic { border-top: 9px solid; border-radius: .65rem; background: white; color: var(--history-title); box-shadow: var(--history-card-shadow); }
summary { padding: 1.25rem; font-size: clamp(1rem, 2vw, 1.25rem); font-weight: 600; }
summary { display: flex; align-items: center; justify-content: space-between; gap: .75rem; cursor: pointer; }
summary:focus-visible { outline: 2px solid var(--history-title); outline-offset: -2px; border-radius: .4rem; }
summary::-webkit-details-marker { display: none; }
details[open] summary .mdi { transform: rotate(180deg); }
.article { display: grid; gap: 2rem; padding: 0 1.25rem 1.5rem; }
.passage { display: grid; gap: .875rem; align-items: center; line-height: 1.65; }
.passage h3 { font-size: 1.1rem; font-weight: 600; grid-column: 1 / -1; }
.passage img { display: block; width: 100%; max-height: 24rem; object-fit: contain; border-radius: 5px; }
@media (min-width: 1024px) {
  .topic { border-top-width: 12px; }
}
@media (min-width: 800px) {
  .passage:has(p) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
  .passage:nth-child(odd) img { order: 1; }
}
.brand { background: linear-gradient(90deg,#fd151b,#ffb30f 44%,#849324 72%,#01295f); background-clip: text; color: transparent; }
.passage p { color: var(--history-body); }
.passage.introduction { grid-template-columns: 1fr; }
.passage.introduction img { order: 0; max-width: 492px; }
.passage.origin img { max-width: 490px; max-height: none; }
@media (min-width: 800px) {
  .passage.origin { grid-template-columns: minmax(0, 3fr) minmax(0, 5fr); gap: clamp(2rem, 5vw, 5rem); }
}
</style>
