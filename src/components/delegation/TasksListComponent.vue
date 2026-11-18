<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../../stores/taskStore'
import { useStatusStore } from '../../stores/statusStore'
import { UseCategoryStore } from '../../stores/categoryStore.js'
import KanbanColumn from '@/components/tasks/KanbanColumn.vue'
import TaskCategoryFilter from '@/components/tasks/TaskCategoryFilter.vue'

const taskStore = useTaskStore()
const statusStore = useStatusStore()
const categoryStore = UseCategoryStore()
const router = useRouter()

const emit = defineEmits(['openForm'])

/* ---------- filtro por categoria (visível só no desktop) ---------- */
const selectedCategory = ref(null)
const savingMove = ref(false)
const moveError = ref('')

const applyFilter = (list) => {
  if (selectedCategory.value === null) return list
  return list.filter((t) => t.category?.some((c) => c.id === selectedCategory.value))
}

/* ---------- colunas do kanban ---------- */
const columns = computed(() => [
  {
    status: 1,
    title: 'A fazer',
    color: '#e94d2b',
    empty: 'Nenhuma tarefa a fazer',
    tasks: applyFilter(statusStore.toDo),
  },
  {
    status: 2,
    title: 'Em andamento',
    color: '#e99a13',
    empty: 'Nenhuma tarefa em andamento',
    tasks: applyFilter(statusStore.doing),
  },
  {
    status: 3,
    title: 'Concluída',
    color: '#2a9655',
    empty: 'Nenhuma tarefa concluída',
    tasks: applyFilter(statusStore.done),
  },
])

async function moveTask(column, { element, newIndex }) {
  if (savingMove.value) return

  const otherTasks = column.tasks.filter((task) => task.id !== element.id)
  const nextTask = otherTasks[newIndex]
  const previousTask = otherTasks[newIndex - 1]

  moveError.value = ''
  savingMove.value = true
  try {
    await taskStore.moveTask(element.id, column.status, nextTask?.id, previousTask?.id)
  } catch {
    moveError.value = 'Não foi possível mover a tarefa. Tente novamente.'
  } finally {
    savingMove.value = false
  }
}

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

      <TaskCategoryFilter
        v-model="selectedCategory"
        :categories="categoryStore.categories"
        :category-styles="categoryStore.categoriesStyle"
      />
    </div>

    <p v-if="moveError" class="move-error" role="alert">{{ moveError }}</p>
    <div class="tasks-list" :aria-busy="savingMove">
      <KanbanColumn
        v-for="col in columns"
        :key="col.status"
        :title="col.title"
        :color="col.color"
        :empty="col.empty"
        :tasks="col.tasks"
        :disabled="savingMove"
        :categories="categoryStore.categories"
        :category-styles="categoryStore.categoriesStyle"
        @open="openTask"
        @add-task="emit('openForm', col.status)"
        @move-task="moveTask(col, $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.header-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-title {
  font-weight: bolder;
  font-size: 1.5rem;
}

.tasks-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.move-error {
  margin-top: 1rem;
  color: #b42318;
}

@media (max-width: 1023px) {
  .tasks-list {
    grid-template-columns: repeat(3, minmax(16rem, 1fr));
    gap: 0.75rem;
    overflow-x: auto;
    padding: 0.25rem 0.25rem 1rem;
  }
}
</style>
