<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTaskStore } from '../../stores/taskStore'
import { useStatusStore } from '../../stores/statusStore'
import { UseCategoryStore } from '../../stores/categoryStore.js'
import KanbanColumn from '@/components/tasks/KanbanColumn.vue'
import TaskCategoryFilter from '@/components/tasks/TaskCategoryFilter.vue'

const taskStore = useTaskStore()
const statusStore = useStatusStore()
const categoryStore = UseCategoryStore()
const router = useRouter()
const route = useRoute()

const emit = defineEmits(['openForm'])

const searchText = ref('')
const selectedCategory = ref(null)
const savingMove = ref(false)
const moveError = ref('')

function normalizeSearch(value) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR').trim()
}

const searchTerm = computed(() => normalizeSearch(searchText.value))

function applyFilters(tasks) {
  const term = searchTerm.value
  const categoryId = selectedCategory.value
  if (!term && categoryId === null) return tasks

  return tasks.filter(
    (task) =>
      (categoryId === null || task.category?.some((category) => category.id === categoryId)) &&
      (!term || normalizeSearch(task.title).includes(term)),
  )
}

watch(() => [route.query.task, taskStore.tasks], async () => {
  const taskId = Number(route.query.task)
  if (!Number.isSafeInteger(taskId) || taskId <= 0) return
  selectedCategory.value = null
  searchText.value = ''
  await nextTick()
  const card = document.getElementById(`task-${taskId}`)
  card?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  card?.focus({ preventScroll: true })
}, { immediate: true })

const columns = computed(() => [
  {
    status: 1,
    title: 'A fazer',
    color: '#e94d2b',
    empty: 'Nenhuma tarefa a fazer',
    tasks: applyFilters(statusStore.toDo),
  },
  {
    status: 2,
    title: 'Em andamento',
    color: '#e99a13',
    empty: 'Nenhuma tarefa em andamento',
    tasks: applyFilters(statusStore.doing),
  },
  {
    status: 3,
    title: 'Concluída',
    color: '#2a9655',
    empty: 'Nenhuma tarefa concluída',
    tasks: applyFilters(statusStore.done),
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

    <label class="task-search">
      <span class="mdi mdi-magnify" aria-hidden="true"></span>
      <input
        v-model="searchText"
        type="search"
        aria-label="Pesquisar tarefas por título"
        placeholder="Pesquisar tarefas"
      />
    </label>

    <p v-if="moveError" class="move-error" role="alert">{{ moveError }}</p>
    <div class="tasks-list" :aria-busy="savingMove">
      <KanbanColumn
        v-for="col in columns"
        :key="col.status"
        :title="col.title"
        :color="col.color"
        :empty="searchTerm ? 'Sem resultados nesta coluna' : col.empty"
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

.task-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  margin-top: 0.875rem;
  padding-inline: 0.75rem;
  border: 1px solid #bdc6d1;
  border-radius: 0.5rem;
  color: #596578;
  background: #fff;
  cursor: text;
}

.task-search:focus-within {
  outline: 2px solid #01295f;
  outline-offset: 1px;
}

.task-search .mdi {
  font-size: 1.25rem;
}

.task-search input {
  width: 100%;
  min-height: 44px;
  padding: 0;
  border: 0;
  outline: none;
  color: #142238;
  background: transparent;
  font: inherit;
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
  .header-title {
    flex-wrap: wrap;
  }

  .tasks-list {
    grid-template-columns: repeat(3, minmax(16rem, 1fr));
    gap: 0.75rem;
    overflow-x: auto;
    padding: 0.25rem 0.25rem 1rem;
  }
}
</style>
