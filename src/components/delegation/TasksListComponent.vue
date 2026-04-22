<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import { useStatusStore } from '@/stores/statusStore'
import AppButton from '../forms/AppButton.vue'

const router = useRouter();

const taskStore = useTaskStore();
const statusStore = useStatusStore();

onMounted(() => {
    taskStore.getTasks()
});
</script>

<template>
    <section class="list-section">
        <div class="header-title">
            <h4 style="font-weight: bolder; font-size: 1.2rem">Quadro de Tarefas</h4>
            <AppButton @click="router.push('/delegacao/nova-tarefa')">Nova +</AppButton>
        </div>

        <div class="tasks-list">

            <!-- tarefas a fazer -->
            <h5 style="color: #fd151b">
                A FAZER
                <span class="count-task"> {{ statusStore.toDo.length }} </span>
            </h5>
            <ul v-if="statusStore.toDo.length > 0">
                <li v-for="task in statusStore.toDo" class="task-card">
                    <h3>{{ task.title }}</h3>
                    <p v-for="c in task.category" :key="c.id" style="color: #969696">{{ c.name }}</p>
                </li>
            </ul>
            <p v-else class="default">Nenhuma tarefa a fazer</p>

            <!-- tarefas em andamento -->
            <h5 style="color: #FFB30F">
                EM ANDAMENTO
                <span class="count-task"> {{ statusStore.doing.length }} </span>
            </h5>
            <ul v-if="statusStore.doing.length > 0">
                <li v-for="task in statusStore.doing" class="task-card">
                    <h3>{{ task.title }}</h3>
                    <p v-for="c in task.category" :key="c.id" style="color: #969696">{{ c.name }}</p>
                </li>
            </ul>
            <p v-else class="default">Nenhuma tarefa em andamento</p>

            <!-- tarefas concluídas -->
            <h5 style="color: #849324">
                CONCLUÍDO
                <span class="count-task"> {{ statusStore.doing.length }} </span>
            </h5>
            <ul v-if="statusStore.doing.length > 0">
                <li v-for="task in statusStore.doing" class="task-card">
                    <h3 >{{ task.title }}</h3>
                    <p v-for="c in task.category" :key="c.id" style="color: #969696">{{ c.name }}</p>
                </li>
            </ul>
            <p v-else class="default">Nenhuma tarefa concluída</p>
        </div>
    </section>
</template>

<style scoped>
.header-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
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

.task-card h3 {
    font-size: 1.2rem;
    max-width: 70%;
    word-break: break-word;
}

.default {
    color: #969696;
    font-weight: 500;
}
</style>
