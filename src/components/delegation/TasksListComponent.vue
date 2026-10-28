<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '../../stores/taskStore'
import { useStatusStore } from '../../stores/statusStore'
import { UseCategoryStore } from '../../stores/categoryStore.js'
import { formatShortDate } from '../../utils/date'
import AppButton from '../forms/AppButton.vue'

const taskStore = useTaskStore();
const statusStore = useStatusStore();
const categoryStore = UseCategoryStore();
const router = useRouter();

const emit = defineEmits(['openForm']);

/* ---------- filtro por categoria (visível só no desktop) ---------- */
const filterOpen = ref(false)
const selectedCategory = ref(null)

const selectedCategoryName = computed(() =>
    categoryStore.categories?.find((c) => c.id === selectedCategory.value)?.name
)

function pickCategory(id) {
    selectedCategory.value = id
    filterOpen.value = false
}

const applyFilter = (list) => {
    if (selectedCategory.value === null) return list
    return list.filter((t) => t.category?.some((c) => c.id === selectedCategory.value))
}

/* ---------- colunas do kanban ---------- */
const columns = computed(() => [
    { key: 'toDo', title: 'A FAZER', color: '#fd151b', empty: 'Nenhuma tarefa a fazer', tasks: applyFilter(statusStore.toDo) },
    { key: 'doing', title: 'EM ANDAMENTO', color: '#FFB30F', empty: 'Nenhuma tarefa em andamento', tasks: applyFilter(statusStore.doing) },
    { key: 'done', title: 'CONCLUÍDO', color: '#849324', empty: 'Nenhuma tarefa concluída', tasks: applyFilter(statusStore.done) },
])

/* ---------- helpers ---------- */
const catInfo = (id) => categoryStore.getCategoryActive(id) || {}

const catName = (c) =>
    c.name ?? categoryStore.categories?.find((x) => x.id === c.id)?.name ?? ''

const taskDate = (task) => formatShortDate(task.endDate || task.startDate)

function openTask(taskId) {
    router.push(`/delegacao/tarefas/${taskId}/editar`)
};

onMounted(() => {
    taskStore.getTasks();
    categoryStore.getCategories(); // necessário para o filtro e para o nome das categorias
});
</script>

<template>
    <section class="list-section">
        <div class="header-title">
            <h4 class="section-title">Quadro de Tarefas</h4>

            <div class="header-actions">
                <!-- Filtro (desktop) -->
                <div class="filter">
                    <button type="button" class="filter-btn" @click="filterOpen = !filterOpen">
                        <span class="mdi mdi-filter-variant"></span>
                        {{ selectedCategoryName ? selectedCategoryName : 'Filtrar por' }}
                        <span class="mdi" :class="filterOpen ? 'mdi-menu-up' : 'mdi-menu-down'"></span>
                    </button>

                    <template v-if="filterOpen">
                        <div class="filter-backdrop" @click="filterOpen = false"></div>
                        <ul class="filter-menu">
                            <li :class="{ current: selectedCategory === null }" @click="pickCategory(null)">
                                Todas as categorias
                            </li>
                            <li
                                v-for="c in categoryStore.categories"
                                :key="c.id"
                                :class="{ current: selectedCategory === c.id }"
                                @click="pickCategory(c.id)"
                            >
                                <span :class="catInfo(c.id).icon"></span>
                                {{ c.name }}
                            </li>
                        </ul>
                    </template>
                </div>

                <AppButton @click="emit('openForm')">Nova +</AppButton>
            </div>
        </div>

        <div class="tasks-list">
            <section v-for="col in columns" :key="col.key" class="column">
                <h5 :style="{ color: col.color }">
                    {{ col.title }}
                    <span class="count-task"> {{ col.tasks.length }} </span>
                </h5>

                <ul v-if="col.tasks.length > 0">
                    <li v-for="task in col.tasks" :key="task.id" @click="openTask(task.id)" class="task-card">
                        <!-- Apenas visual por enquanto (futuro: arrastar entre colunas) -->
                        <span class="drag-handle mdi mdi-drag" aria-hidden="true"></span>

                        <div class="task-body">
                            <span v-if="taskDate(task)" class="task-date">
                                <span class="mdi mdi-calendar-blank-outline"></span>
                                {{ taskDate(task) }}
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
                </ul>
                <p v-else class="default">{{ col.empty }}</p>
            </section>
        </div>
    </section>
</template>

<style scoped>
/* =========================== MOBILE (padrão) =========================== */
.header-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.section-title {
    font-weight: bolder;
    font-size: 1.2rem;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.filter {
    display: none; /* só desktop */
}

.tasks-list {
    margin-top: 2rem;
}

.tasks-list h5 {
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

.task-card:active{
    transition: all .3s;
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

.default {
    color: #969696;
    font-weight: 500;
}

/* ============================== DESKTOP ============================== */
@media (min-width: 1024px) {
    .section-title {
        font-weight: 400;
        font-size: 1.25rem;
    }

    /* ----- filtro ----- */
    .filter {
        display: block;
        position: relative;
    }

    .filter-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.2rem;
        border: 0;
        background: none;
        font: inherit;
        font-size: 1rem;
        color: #1a1a1a;
        cursor: pointer;
    }

    .filter-btn .mdi {
        font-size: 1.2rem;
    }

    .filter-backdrop {
        position: fixed;
        inset: 0;
        z-index: 40;
    }

    .filter-menu {
        position: absolute;
        top: calc(100% + 0.4rem);
        right: 0;
        z-index: 41;
        min-width: 14rem;
        padding: 0.4rem;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
    }

    .filter-menu li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 0.8rem;
        border-radius: 8px;
        font-size: 0.95rem;
        cursor: pointer;
    }

    .filter-menu li:hover {
        background: #f3f5f9;
    }

    .filter-menu li.current {
        color: #01295f;
        font-weight: 600;
        background: #eef3fb;
    }

    /* ----- colunas ----- */
    .tasks-list {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1.5rem;
        align-items: start;
        margin-top: 1.5rem;
    }

    .tasks-list h5 {
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

    /* ----- card ----- */
    .task-card {
        flex-direction: row;
        align-items: center;
        gap: 0.8rem;
        padding: 1.3rem 1.4rem 1.3rem 1rem;
        min-height: 0;
        cursor: pointer;
        transition: box-shadow 0.2s, transform 0.2s;
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
  .header-title { flex-wrap: wrap; gap: 0.75rem; }
  .task-card { padding: 1.25rem; }
  .task-categories { flex-wrap: wrap; gap: 0.5rem; }
  .category-item { max-width: 100%; }
  .task-card h3 { max-width: 100%; line-height: 1.5; }
}
</style>
