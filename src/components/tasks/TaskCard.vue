<script setup>
import { computed } from 'vue'
import { formatShortDate } from '@/utils/date'
import { getCategoryStyle } from '@/utils/categoryStyle'
const props = defineProps({
  task: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  categoryStyles: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['open'])
const catInfo = (id) => getCategoryStyle(id, props.categoryStyles)
const catName = (c) => c.name ?? props.categories.find((x) => x.id === c.id)?.name ?? ''
const taskDate = computed(() => formatShortDate(props.task.endDate || props.task.startDate))
</script>

<template>
  <li
    class="task-card"
    role="button"
    tabindex="0"
    @click="emit('open', task.id)"
    @keydown.enter="emit('open', task.id)"
    @keydown.space.prevent="emit('open', task.id)"
  >
    <!-- Apenas visual por enquanto (futuro: arrastar entre colunas) -->
    <span class="drag-handle mdi mdi-drag" aria-hidden="true"></span>

    <div class="task-body">
      <span v-if="taskDate" class="task-date">
        <span class="mdi mdi-calendar-blank-outline"></span>
        {{ taskDate }}
      </span>

      <h3>{{ task.title }}</h3>
      <p class="edit-hint">Clique para editar.</p>

      <div class="task-categories">
        <div
          v-for="c in task.category"
          :key="c.id"
          class="category-item"
          :style="catInfo(c.id).activeStyle"
        >
          <p>
            <span :class="catInfo(c.id).icon"></span>
            <span class="category-name">{{ catName(c) }}</span>
          </p>
        </div>
      </div>
    </div>
  </li>
</template>

<style scoped>
.task-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  background-color: #fff;
  padding: 0 2rem;
  min-height: 140px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(220, 220, 220, 0.1);
  margin-bottom: 1rem;
}

.task-card:active {
  transition: all 0.3s;
  transform: scale(0.95);
}

.task-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.task-card h3 {
  font-size: 1.2rem;
  max-width: 90%;
  word-break: break-word;
}

.edit-hint {
  color: #969696;
}

.drag-handle,
.task-date {
  display: none; /* só desktop */
}

.category-name {
  display: none; /* mobile: só o ícone */
}

.task-categories {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  max-width: 80%;
}

.category-item {
  border: none;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 15px;
  font-weight: 300;
}

.category-item p {
  font-size: 0.9rem;
}

@media (min-width: 1024px) {
  .task-card {
    flex-direction: row;
    align-items: center;
    gap: 0.8rem;
    padding: 1.3rem 1.4rem 1.3rem 1rem;
    min-height: 0;
    cursor: pointer;
    transition:
      box-shadow 0.2s,
      transform 0.2s;
  }

  .task-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(1, 41, 95, 0.1);
  }

  .task-card:active {
    transform: translateY(0) scale(0.99);
  }

  .drag-handle {
    display: block;
    flex-shrink: 0;
    color: #c4c4c4;
    font-size: 1.3rem;
  }

  .task-body {
    flex: 1;
    gap: 0.7rem;
  }

  .task-date {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    align-self: flex-start;
    color: #969696;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .task-card h3 {
    max-width: 100%;
    font-size: 1.1rem;
    font-weight: 400;
    line-height: 1.35;
  }

  .edit-hint {
    display: none;
  }

  .task-categories {
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .category-item {
    padding: 0.35rem 1rem;
    border-radius: 999px;
  }

  .category-item p {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .category-name {
    display: inline;
  }
}

@media (max-width: 1023px) {
  .task-card {
    padding: 1.25rem;
  }
  .task-categories {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .category-item {
    max-width: 100%;
  }
  .task-card h3 {
    max-width: 100%;
    line-height: 1.5;
  }
}
.task-card:focus-visible {
  outline: 2px solid #01295f;
  outline-offset: 3px;
}
</style>
