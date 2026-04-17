<script setup>
// {
//   "title": "string",
//   "description": "string",
//   "endDate": "2026-04-15",
//   "startDate": "2026-04-15",
//   "status": 1,
//   "notification": true,
//   "category": [
//     0
//   ],
//   "user": [
//     0
//   ]
// }

import { useTaskStore } from '../stores/taskStore'
const taskStore = useTaskStore()
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore();

onMounted(() => {
    userStore.
})

onMounted(() => {
    taskStore.getTasks()
})

const novaTask = ref(
    {
        title: '',
        description: '',
        endDate: '1976-01-01',
        startDate: '1976-01-01',
        status: 1,
        notification: false,
        category: [1],
        user: [1]
    }
)

function createTask() {
    taskStore.createTask(novaTask.value)
}

function goToTask(id) {
  router.push({ name: 'playground-task', params: { id } })
}

</script>
<template>
<input type="text" v-model="novaTask.title" placeholder="New task title">
<input type="text" v-model="novaTask.description" placeholder="New task description">

<button @click="createTask">Create Task</button>

<div v-for="task in taskStore.tasks" :key="task.id">
    <p @click="goToTask(task.id)">{{ task.title }}</p> <button @click="taskStore.deleteTask(task.id)">X</button>
</div>
<br>
<br><br><br>

<h2>Login:</h2>
<input type="email" name="email" id="" v-model="Email">
</template>
<style scoped>

</style>