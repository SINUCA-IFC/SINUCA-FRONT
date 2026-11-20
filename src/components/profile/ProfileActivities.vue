<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useDelegationTabs } from '@/composables/useDelegationTabs'
import TaskService from '@/services/taskService'
import AppButton from '@/components/forms/AppButton.vue'
import NavigationComponent from '@/components/delegation/NavigationComponent.vue'
import { parseDate } from '@/utils/date'

const userStore = useUserStore()
const { setTab } = useDelegationTabs()
const taskService = new TaskService()
const tasks = ref([])
const loading = ref(true)
const error = ref('')
const filter = ref('all')
const search = ref('')
const statuses = [
  { id: 1, label: 'A fazer', icon: 'mdi-circle-outline' },
  { id: 2, label: 'Em andamento', icon: 'mdi-progress-clock' },
  { id: 3, label: 'Concluídas', icon: 'mdi-check-circle-outline' },
]
const activityTabs = [
  { id: 'all', name: 'Todas', icon: 'mdi mdi-view-grid-outline' },
  ...statuses.map((status) => ({ id: status.id, name: status.label, icon: `mdi ${status.icon}` })),
]
const completed = computed(() => tasks.value.filter((task) => Number(task.status) === 3).length)
const progress = computed(() =>
  tasks.value.length ? Math.round((completed.value / tasks.value.length) * 100) : 0,
)
const overdue = computed(() => tasks.value.filter(isOverdue).length)
const filteredTasks = computed(() =>
  tasks.value
    .filter(
      (task) =>
        (filter.value === 'all' || Number(task.status) === filter.value) &&
        task.title
          ?.toLocaleLowerCase('pt-BR')
          .includes(search.value.trim().toLocaleLowerCase('pt-BR')),
    )
    .sort(
      (a, b) =>
        (Number(a.status) === 3) - (Number(b.status) === 3) ||
        (parseDate(a.endDate)?.getTime() ?? Infinity) -
          (parseDate(b.endDate)?.getTime() ?? Infinity),
    ),
)
function isOverdue(task) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = parseDate(task.endDate)
  return Number(task.status) !== 3 && date && date < today
}
function dateLabel(value) {
  return parseDate(value)?.toLocaleDateString('pt-BR') || 'Sem prazo definido'
}
function taskStatus(task) {
  return statuses.find((status) => status.id === Number(task.status))
}
function clearFilters() {
  filter.value = 'all'
  search.value = ''
}
async function loadTasks() {
  loading.value = true
  error.value = ''
  try {
    tasks.value = await taskService.getAssignedTasks(userStore.user.id)
  } catch {
    error.value = 'Não foi possível carregar suas atividades.'
  } finally {
    loading.value = false
  }
}
onMounted(loadTasks)
</script>

<template>
  <section class="activities" :aria-busy="loading" aria-labelledby="activities-heading">
    <div class="section-heading">
      <div>
        <h2 id="activities-heading">Minhas atividades</h2>
        <p>As tarefas atribuídas a você, em um só lugar.</p>
      </div>
    </div>
    <p v-if="loading" class="empty-state" role="status">Carregando suas atividades…</p>
    <div v-else-if="error" class="empty-state" role="alert">
      <p>{{ error }}</p>
      <AppButton @click="loadTasks">Tentar novamente</AppButton>
    </div>
    <template v-else>
      <div class="stats-grid">
        <div
          v-for="status in statuses"
          :key="status.id"
          class="stat-card"
          :class="`status-${status.id}`"
        >
          <span class="mdi" :class="status.icon" aria-hidden="true"></span>
          <strong>{{ tasks.filter((task) => Number(task.status) === status.id).length }}</strong>
          <span>{{ status.label }}</span>
        </div>
      </div>
      <div v-if="tasks.length" class="progress-panel">
        <div>
          <span>Seu progresso</span><strong>{{ progress }}%</strong>
        </div>
        <progress
          :value="completed"
          :max="tasks.length"
          aria-label="Atividades concluídas"
        ></progress>
        <p>
          {{ completed }} de {{ tasks.length }} atividades concluídas<span v-if="overdue">
            · {{ overdue }} com prazo vencido</span
          >
        </p>
      </div>
      <div class="activity-toolbar">
        <NavigationComponent v-model="filter" :tabs="activityTabs" label="Filtrar atividades por status" class="activity-navigation" />
        <input
          v-model="search"
          type="search"
          placeholder="Buscar atividade…"
          aria-label="Buscar atividade pelo título"
        />
      </div>
      <ul v-if="filteredTasks.length" class="task-list">
        <li v-for="task in filteredTasks" :key="task.id">
          <RouterLink
            :to="`/delegacao/tarefas/${task.id}/editar`"
            class="task-row"
            @click="setTab(0)"
          >
            <span
              class="task-indicator mdi"
              :class="[taskStatus(task)?.icon, `status-${task.status}`]"
              aria-hidden="true"
            ></span>
            <div class="task-content">
              <h3>{{ task.title }}</h3>
              <div class="task-meta">
                <span :class="{ overdue: isOverdue(task) }"
                  ><span class="mdi mdi-calendar-blank-outline" aria-hidden="true"></span>
                  {{ dateLabel(task.endDate) }}{{ isOverdue(task) ? ' · Atrasada' : '' }}</span
                >
                <span v-for="category in task.category" :key="category.id" class="category">{{
                  category.name
                }}</span>
              </div>
            </div>
            <span class="status-badge" :class="`status-${task.status}`">{{
              taskStatus(task)?.label || 'Sem status'
            }}</span>
            <span class="mdi mdi-chevron-right" aria-hidden="true"></span>
          </RouterLink>
        </li>
      </ul>
      <div v-else class="empty-state">
        <span class="mdi mdi-clipboard-text-outline" aria-hidden="true"></span>
        <h3>{{ tasks.length ? 'Nenhuma atividade encontrada' : 'Tudo tranquilo por aqui' }}</h3>
        <p>
          {{
            tasks.length
              ? 'Tente outro título ou filtro de status.'
              : 'As tarefas atribuídas a você no Kanban aparecerão aqui.'
          }}
        </p>
        <AppButton v-if="tasks.length" variant="secondary" @click="clearFilters"
          >Limpar filtros</AppButton
        >
      </div>
    </template>
  </section>
</template>

<style scoped>
.activities {
  --navy: #01295f;
  --muted: #687487;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--navy);
}
.section-heading p {
  color: var(--muted);
  font-size: 0.9rem;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.stat-card {
  padding: 1.2rem;
  border: 1px solid #e7e9ec;
  background: white;
  border-radius: 12px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.2rem;
}
.stat-card > .mdi {
  font-size: 1.5rem;
}
.stat-card strong {
  font-size: 1.8rem;
  font-weight: 600;
}
.stat-card > span:last-child {
  grid-column: 1 / -1;
  font-size: 0.8rem;
  color: var(--muted);
}
.status-1 {
  color: #c33c43;
}
.status-2 {
  color: #936400;
}
.status-3 {
  color: #61751a;
}
.progress-panel {
  padding: 1.2rem 1.5rem;
  background: #edf1e5;
  border-radius: 12px;
  color: #40521b;
}
.progress-panel > div {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}
.progress-panel p {
  font-size: 0.75rem;
}
progress {
  width: 100%;
  height: 7px;
  border: 0;
  border-radius: 10px;
  overflow: hidden;
  background: #dbe3cb;
  accent-color: #849324;
  margin: 0.6rem 0;
}
progress::-webkit-progress-bar {
  background: #dbe3cb;
}
progress::-webkit-progress-value {
  background: #849324;
}
progress::-moz-progress-bar {
  background: #849324;
}
.activity-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.activity-navigation {
  width: 100%;
  min-width: 0;
}
input {
  width: 100%;
  max-width: 240px;
  font: inherit;
  font-size: 0.9rem;
  border: 1px solid #dce2e9;
  border-radius: 8px;
  padding: 0.75rem;
  background: white;
  color: var(--navy);
}
.task-list {
  background: white;
  border: 1px solid #e7e9ec;
  border-radius: 12px;
  overflow: hidden;
}
.task-list li + li {
  border-top: 1px solid #edf0f3;
}
.task-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  color: var(--navy);
}
.task-row:hover {
  background: #f7f9fc;
}
.task-indicator {
  font-size: 1.5rem;
}
.task-content {
  flex: 1;
  min-width: 0;
}
.task-content h3 {
  font-size: 0.95rem;
  font-weight: 500;
}
.task-meta {
  display: flex;
  gap: 0.5rem 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
  color: var(--muted);
  font-size: 0.75rem;
}
.overdue {
  color: #b32c3d;
}
.category {
  background: #f1f3f7;
  padding: 0 0.4rem;
  border-radius: 4px;
}
.status-badge {
  font-size: 0.7rem;
  border: 1px solid currentColor;
  border-radius: 99px;
  padding: 0.2rem 0.6rem;
  white-space: nowrap;
}
.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  background: white;
  border: 1px dashed #dce2e9;
  border-radius: 12px;
  color: var(--muted);
}
.empty-state > .mdi {
  font-size: 2.5rem;
  color: #849324;
}
.empty-state h3 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--navy);
  margin: 0.5rem 0;
}
.empty-state p {
  font-size: 0.85rem;
}
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid #93b6e3;
  outline-offset: 3px;
}
@media (max-width: 600px) {
  .stats-grid {
    gap: 0.5rem;
  }
  .stat-card {
    padding: 0.8rem;
  }
  .stat-card strong {
    font-size: 1.5rem;
  }
  .stat-card > span:last-child {
    font-size: 0.7rem;
  }
  input {
    max-width: none;
  }
  .task-row {
    padding: 1rem;
    gap: 0.65rem;
    flex-wrap: wrap;
  }
  .task-content {
    flex-basis: calc(100% - 3rem);
  }
  .status-badge {
    margin-left: 2.15rem;
  }
  .task-row > .mdi:last-child {
    margin-left: auto;
  }
}
</style>
