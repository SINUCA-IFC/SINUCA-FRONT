<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../../stores/taskStore'
import { useStatusStore } from '../../stores/statusStore'
import { UseCategoryStore } from '../../stores/categoryStore.js'
import KanbanColumn from '@/components/tasks/KanbanColumn.vue'
import TaskCategoryFilter from '@/components/tasks/TaskCategoryFilter.vue'
import AppButton from '../forms/AppButton.vue'

const taskStore = useTaskStore()
const statusStore = useStatusStore()
const categoryStore = UseCategoryStore()
const router = useRouter()

const emit = defineEmits(['openForm'])

/* ---------- filtro por categoria (visível só no desktop) ---------- */
const selectedCategory = ref(null)

const applyFilter = (list) => {
  if (selectedCategory.value === null) return list
  return list.filter((t) => t.category?.some((c) => c.id === selectedCategory.value))
}

/* ---------- colunas do kanban ---------- */
const columns = computed(() => [
  {
    key: 'toDo',
    title: 'A FAZER',
    color: '#fd151b',
    empty: 'Nenhuma tarefa a fazer',
    tasks: applyFilter(statusStore.toDo),
  },
  {
    key: 'doing',
    title: 'EM ANDAMENTO',
    color: '#FFB30F',
    empty: 'Nenhuma tarefa em andamento',
    tasks: applyFilter(statusStore.doing),
  },
  {
    key: 'done',
    title: 'CONCLUÍDO',
    color: '#849324',
    empty: 'Nenhuma tarefa concluída',
    tasks: applyFilter(statusStore.done),
  },
])

function openTask(taskId) {
  router.push(`/delegacao/tarefas/${taskId}/editar`)
}

onMounted(() => {
  taskStore.getTasks()
  categoryStore.getCategories() // necessário para o filtro e para o nome das categorias
})
</script>

<template>
  <section class="list-section">
    <div class="header-title">
      <h4 class="section-title">Quadro de Tarefas</h4>

      <div class="header-actions">
        <!-- Filtro (desktop) -->
        <TaskCategoryFilter
          v-model="selectedCategory"
          :categories="categoryStore.categories"
          :category-styles="categoryStore.categoriesStyle"
        />

        <AppButton @click="emit('openForm')">Nova +</AppButton>
      </div>
    </div>

    <div class="tasks-list">
      <KanbanColumn
        v-for="col in columns"
        :key="col.key"
        v-bind="col"
        :categories="categoryStore.categories"
        :category-styles="categoryStore.categoriesStyle"
        @open="openTask"
      />
    </div>
  </section>
</template>

<style scoped>
.header-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-weight: bolder;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.tasks-list {
  margin-top: 2rem;
}
@media (min-width: 1024px) {
  .tasks-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
    align-items: start;
    margin-top: 1.5rem;
  }
}
@media (max-width: 1023px) {
  .header-title {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}
</style>
