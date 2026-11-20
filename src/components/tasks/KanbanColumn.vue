<script setup>
import draggable from 'vuedraggable'
import AppButton from '@/components/forms/AppButton.vue'
import TaskCard from './TaskCard.vue'

defineProps({
  title: String,
  color: String,
  empty: String,
  tasks: { type: Array, default: () => [] },
  disabled: Boolean,
  categories: { type: Array, default: () => [] },
  categoryStyles: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['open', 'move-task', 'add-task', 'drag-start', 'drag-end'])

function handleChange({ added, moved }) {
  const destination = added ?? moved
  if (destination) emit('move-task', destination)
}
</script>
<template>
  <section class="column" :style="{ '--column-color': color }">
    <h5 class="column-title">
      {{ title }}
      <span class="count-task">{{ tasks.length }}</span>
    </h5>

    <div class="column-body">
      <draggable
        class="task-drop-zone"
        tag="ul"
        :aria-label="title"
        :model-value="tasks"
        :disabled="disabled"
        item-key="id"
        group="kanban-tasks"
        handle=".drag-handle"
        direction="vertical"
        ghost-class="task-ghost"
        :animation="150"
        :force-fallback="true"
        :fallback-on-body="true"
        :fallback-tolerance="5"
        @start="emit('drag-start')"
        @end="emit('drag-end')"
        @change="handleChange"
      >
        <template #item="{ element }">
          <TaskCard
            :task="element"
            :categories="categories"
            :category-styles="categoryStyles"
            @open="emit('open', $event)"
          />
        </template>
      </draggable>
      <p v-if="tasks.length === 0" class="default">{{ empty }}</p>
    </div>

    <AppButton class="add-task" :aria-label="`Adicionar tarefa · ${title}`" @click="emit('add-task')">
      Adicionar tarefa
      <span class="mdi mdi-plus" aria-hidden="true"></span>
    </AppButton>
  </section>
</template>
<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  min-width: 0;
  padding: 1rem;
  border: 2px solid var(--column-color);
  border-radius: 0.75rem;
  background: #fff;
}

.column-title {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  color: #142238;
  font-size: clamp(1.05rem, 1.5vw, 1.25rem);
  font-weight: 600;
  line-height: 1.4;
}

.count-task {
  color: color-mix(in srgb, var(--column-color) 70%, #142238);
  font-size: 0.875rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.column-body {
  position: relative;
}

.task-drop-zone {
  block-size: clamp(24rem, 55dvh, 36rem);
  overflow-y: auto;
  padding: 0.2rem;
}

.task-drop-zone :deep(.task-ghost) {
  opacity: 0.35;
}

.default {
  position: absolute;
  inset: 0.9rem 0.75rem auto;
  pointer-events: none;
  color: #596578;
  font-size: 0.875rem;
  line-height: 1.5;
}

.column-body:has(.task-ghost) .default {
  visibility: hidden;
}

.add-task {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 44px;
  margin-top: 0;
  padding-inline: 0.75rem;
  font-size: 0.925rem;
}

@media (max-width: 1023px) {
  .column {
    padding: 0.75rem;
  }

  .task-drop-zone {
    block-size: clamp(22rem, 60dvh, 36rem);
  }
}
</style>
