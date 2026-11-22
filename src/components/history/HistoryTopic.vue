<script setup>
defineProps({ topic: { type: Object, required: true } })
</script>

<template>
  <details class="topic" :class="topic.layout" :style="{ borderTopColor: topic.accent }">
    <summary>
      <span
        ><span
          v-for="(part, index) in topic.title.split(/(SINUCA)/)"
          :key="index"
          :class="{ brand: part === 'SINUCA' }"
          >{{ part }}</span
        ></span
      >
      <span class="mdi mdi-chevron-down" aria-hidden="true"></span>
    </summary>
    <div class="article">
      <section
        v-for="(block, index) in topic.blocks"
        :key="index"
        class="passage"
        :class="block.layout"
      >
        <h3 v-if="block.heading">{{ block.heading }}</h3>
        <p v-if="block.layout && block.text">{{ block.text }}</p>
        <img
          v-if="block.image"
          :src="'/static/history/' + block.image"
          :alt="block.alt || ''"
          loading="lazy"
        />
        <p v-if="block.after">{{ block.after }}</p>
        <p v-if="!block.layout && block.text">{{ block.text }}</p>
      </section>
    </div>
  </details>
</template>

<style scoped>
.topic {
  border-top: 9px solid;
  border-radius: 0.65rem;
  background: white;
  color: var(--history-title);
  box-shadow: var(--history-card-shadow);
}
summary {
  padding: 1.25rem;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 600;
}
summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
}
summary:focus-visible {
  outline: 2px solid var(--history-title);
  outline-offset: -2px;
  border-radius: 0.4rem;
}
summary::-webkit-details-marker {
  display: none;
}
details[open] summary .mdi {
  transform: rotate(180deg);
}
.article {
  display: grid;
  gap: 2rem;
  padding: 0 1.25rem 1.5rem;
}
.passage {
  display: grid;
  gap: 0.875rem;
  align-items: center;
  line-height: 1.65;
}
.passage h3 {
  font-size: 1.1rem;
  font-weight: 600;
  grid-column: 1 / -1;
}
.passage img {
  display: block;
  width: 100%;
  max-height: 24rem;
  object-fit: contain;
  border-radius: 5px;
}
@media (min-width: 1024px) {
  .topic {
    border-top-width: 12px;
  }
}
@media (min-width: 800px) {
  .passage:has(p) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.5rem;
  }
  .passage:nth-child(odd) img {
    order: 1;
  }
}
.brand {
  background: linear-gradient(90deg, #fd151b, #ffb30f 44%, #849324 72%, #01295f);
  background-clip: text;
  color: transparent;
}
.passage p {
  color: var(--history-body);
}
.passage.introduction {
  grid-template-columns: 1fr;
}
.passage.introduction img {
  order: 0;
  max-width: 492px;
}
.passage.origin img {
  max-width: 490px;
  max-height: none;
}
.how-it-works {
  width: 100%;
  font-family: 'Poppins', sans-serif;
}
.how-it-works summary {
  color: #1e1e1e;
}
.how-it-works .article {
  display: block;
  padding: 12px 21px 132px;
}
.how-it-works .passage {
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  align-items: start;
  line-height: 1.5;
}
.how-it-works .passage p {
  color: #666;
  font-weight: 500;
}
.how-it-works .passage h3 {
  color: #01295f;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 36px;
}
.how-it-works .passage img {
  order: 0;
  max-height: none;
  object-fit: cover;
}
.how-it-works .overview img {
  width: 782px;
  margin: 20px auto 0;
}
.how-it-works .debates {
  margin-top: 40px;
}
.how-it-works .debates img {
  aspect-ratio: 489 / 309;
}
.how-it-works .cooperation {
  margin-top: 60px;
}
.how-it-works .cooperation h3 {
  margin-bottom: 40px;
}
.how-it-works .cooperation img {
  aspect-ratio: 496 / 457;
}
.how-it-works .cooperation-followup {
  margin-top: 26px;
}
.how-it-works .cooperation-followup img {
  aspect-ratio: 496 / 298;
}
.how-it-works .dance {
  margin-top: 26px;
}
.how-it-works .dance h3 {
  margin-bottom: 44px;
}
.how-it-works .dance img {
  width: 568px;
  aspect-ratio: 568 / 307;
  object-position: center 54%;
  margin-top: 30px;
}
.how-it-works .dance-followup {
  margin-top: 26px;
}
.how-it-works .dance-followup img {
  width: 568px;
  height: auto;
}
.how-it-works .gastronomy {
  margin: 42px -18px 0;
}
.how-it-works .gastronomy h3 {
  margin-bottom: 26px;
}
.how-it-works .gastronomy img {
  width: 681px;
  aspect-ratio: 681 / 441;
  margin: 26px 0 0 -3px;
}
@media (min-width: 800px) {
  .how-it-works .debates,
  .how-it-works .cooperation,
  .how-it-works .cooperation-followup {
    grid-template-columns: minmax(0, 355fr) minmax(0, 496fr);
    column-gap: 33px;
    padding-right: 19px;
  }
  .how-it-works .debates img,
  .how-it-works .cooperation img,
  .how-it-works .cooperation-followup img {
    grid-column: 2;
  }
}
@media (max-width: 799px) {
  .how-it-works .article {
    padding-bottom: 40px;
  }
  .how-it-works .debates img,
  .how-it-works .cooperation img,
  .how-it-works .cooperation-followup img {
    margin-top: 24px;
  }
  .how-it-works .gastronomy {
    margin-inline: 0;
  }
  .how-it-works .gastronomy img {
    margin-left: 0;
  }
}
@media (min-width: 800px) {
  .passage.origin {
    grid-template-columns: minmax(0, 3fr) minmax(0, 5fr);
    gap: clamp(2rem, 5vw, 5rem);
  }
}
</style>
