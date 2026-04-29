<script setup>
import { useTaskStore } from '../stores/taskStore'
const taskStore = useTaskStore()
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

import { useUserStore } from '@/stores/userStore'
const userStore = useUserStore();

import { usePostStore } from '@/stores/postStore'
const postStore = usePostStore()


onMounted(() => {
    userStore.checkAuth()
    userStore.getAllUsers()
})

onMounted(() => {
    taskStore.getTasks()
})

onMounted(() => {
    postStore.getPosts()
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

const Email = ref('')
const Password = ref('')

</script>
<template>
<input type="text" v-model="novaTask.title" placeholder="New task title">
<input type="text" v-model="novaTask.description" placeholder="New task description">

<button @click="createTask">Create Task</button>

<div v-for="task in taskStore.tasks" :key="task.id">
    <p @click="goToTask(task.id)">{{ task.title }}</p>  <button @click="taskStore.deleteTask(task.id)">X</button>
</div>
<br>
<br><br><br>

<h2>Login:</h2>

<p>{{ userStore.loggedIn }}</p>

<input type="email" name="email" id="" v-model="Email">
<input type="password" name="password" id="" v-model="Password">

<button @click="userStore.login(Email, Password)">Login</button>
<button @click="userStore.logout">logout</button>

<br>
<br>
<br>

<h2>Postagens:</h2>
<div v-for="p in postStore.posts" :key="p.id">
    <h3>{{ p.title }}</h3>
    <p>{{ p.content }}</p>
    
</div>
<br>
<br>
<div>
    <h2>Usuários:</h2>
    <div v-for="u in userStore.usuarios" :key="u.id">
        <p>{{ u.email }}</p>
    </div>
</div>
</template>
<style scoped>

</style>