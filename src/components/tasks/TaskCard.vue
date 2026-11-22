<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { formatShortDate, parseDate } from '@/utils/date'
import { getCategoryStyle } from '@/utils/categoryStyle'

const props = defineProps({
  task: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  categoryStyles: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['open'])
const route = useRoute()

const dates = computed(() =>
  [props.task.startDate, props.task.endDate]
    .map((value) => ({ value, label: formatShortDate(value) }))
    .filter((date) => date.label),
)

const isOverdue = computed(() => {
  const dueDate = parseDate(props.task.endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return props.task.status !== 3 && dueDate !== null && dueDate < today
})

const categoryName = (category) =>
  category.name ?? props.categories.find((item) => item.id === category.id)?.name
</script>

<template>
  <li
    class="task-card"
    :id="`task-${task.id}`"
    :class="{
      overdue: isOverdue,
      'task-card--highlighted': String(route.query.task) === String(task.id),
    }"
    role="button"
    tabindex="0"
    @click="emit('open', task.id)"
    @keydown.enter="emit('open', task.id)"
    @keydown.space.prevent="emit('open', task.id)"
  >
    <span class="drag-handle mdi mdi-drag" aria-hidden="true" @click.stop></span>

    <div class="task-body">
      <div v-if="dates.length" class="task-dates">
        <template v-for="(date, index) in dates" :key="index">
          <span v-if="index" aria-hidden="true">–</span>
          <time :datetime="date.value">
            <span class="mdi mdi-calendar-blank-outline" aria-hidden="true"></span>
            {{ date.label }}
          </time>
        </template>
      </div>

      <h3>
        {{ task.title }}
        <span
          v-if="isOverdue"
          class="overdue-icon mdi mdi-alert-circle"
          role="img"
          aria-label="Tarefa atrasada"
          title="Tarefa atrasada"
        ></span>
      </h3>

      <ul v-if="task.category?.length" class="task-categories">
        <li
          v-for="category in task.category"
          :key="category.id"
          class="category-item"
          :style="getCategoryStyle(category.id, categoryStyles).activeStyle"
          :title="categoryName(category)"
        >
          <span
            :class="getCategoryStyle(category.id, categoryStyles).icon"
            role="img"
            :aria-label="categoryName(category) || 'Categoria'"
          ></span>
        </li>
      </ul>
    </div>
  </li>
</template>

<style scoped>
.task-card--highlighted {
  outline: 3px solid #ffb30f;
  outline-offset: 3px;
}
.task-card {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  min-height: 6.25rem;
  margin-bottom: 0.875rem;
  padding: 0.85rem 0.85rem 0.85rem 0.45rem;
  border: 1px solid #d0d5dd;
  border-radius: 0.65rem;
  color: #142238;
  background: #fff;
  cursor: pointer;
}

.task-card:last-child {
  margin-bottom: 0;
}

.task-card:hover {
  background: #f8fafc;
}

.task-card:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 1px;
}

.task-card.overdue {
  border-color: #dc5656;
}

.drag-handle {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
  color: #657185;
  font-size: 1.15rem;
  cursor: grab;
  touch-action: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.task-body {
  display: grid;
  flex: 1;
  gap: 0.375rem;
  min-width: 0;
}

.task-dates {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
  color: #596578;
  font-size: 0.75rem;
  line-height: 1.25;
}

.task-dates time {
  white-space: nowrap;
}

.task-card h3 {
  font-size: 0.975rem;
  font-weight: 600;
  line-height: 1.4;
}

.overdue-icon {
  margin-inline-start: 0.2rem;
  color: #b42318;
  font-size: 0.85em;
}

.task-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.35rem;
}

.category-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  min-height: 1.5rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  color: #fff;
  font-size: 0.875rem;
  line-height: 1;
}
</style>
