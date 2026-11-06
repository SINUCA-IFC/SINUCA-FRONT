<script setup>
import TaskCard from './TaskCard.vue'
defineProps({
  title: String,
  color: String,
  empty: String,
  tasks: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  categoryStyles: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['open'])
</script>
<template>
  <section class="column">
    <h5 :style="{ color: color }">
      {{ title }}
      <span class="count-task"> {{ tasks.length }} </span>
    </h5>

    <ul v-if="tasks.length > 0">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :categories="categories"
        :category-styles="categoryStyles"
        @open="emit('open', $event)"
      />
    </ul>
    <p v-else class="default">{{ empty }}</p>
  </section>
</template>
<style scoped>
.column {
  min-width: 0;
}

h5 {
  font-weight: 500;
  margin: 1.2rem 0;
}

.count-task {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  background-color: #fff;
  border-radius: 50%;
  margin-left: 1rem;
}

.default {
  color: #969696;
  font-weight: 500;
}

@media (min-width: 1024px) {
  h5 {
    font-size: 1.2rem;
    margin: 0 0 1.2rem;
  }

  .count-task {
    width: 22px;
    height: 22px;
    margin-left: 0.6rem;
    font-size: 0.85rem;
    color: #1a1a1a;
  }
}
</style>
