<script setup>
import { useTaskStore } from '../stores/taskStore'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { usePostStore } from '../stores/postStore'
import { useGangStore } from '../stores/gangStore'
import { useScheduleStore } from '../stores/scheduleStore'
import { useLinkStore } from '../stores/linkStore'
import { useMessageStore } from '../stores/messageStore'

const router = useRouter();

const taskStore = useTaskStore();
const userStore = useUserStore();
const postStore = usePostStore();
const gangStore = useGangStore();
const scheduleStore = useScheduleStore();
const linkStore = useLinkStore();
const messageStore = useMessageStore();

const t = ref('')
const c = ref('')

onMounted(() => {
    userStore.checkAuth()
})

onMounted(() => {
    userStore.getAllUsers()
})

onMounted(() => {
    taskStore.getTasks()
})

onMounted(() => {
    postStore.getPosts()
})

onMounted(() => {
    gangStore.getGangs()
})

onMounted(() => {
    scheduleStore.getSchedules()
})

onMounted(() => {
    linkStore.getLinks()
})

onMounted(() => {
    messageStore.getMessages()
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

    <nav style="margin: 4rem;">
    <ul>
    <li>
    <a href="#task">taks</a>
    </li>
    <li>
    <a href="#login">login</a>
    </li>
        <li>
    <a href="#post">post</a>
    </li>
        <li>
    <a href="#mensagem">mensagem</a>
    </li>
    </ul>
    </nav>

<input type="text" v-model="novaTask.title" placeholder="New task title">
<input type="text" v-model="novaTask.description" placeholder="New task description">

<button @click="createTask">Create Task</button>

<div v-for="task in taskStore.tasks" :key="task.id" class="task">
    <p @click="goToTask(task.id)">{{ task.title }}</p>  <button @click="taskStore.deleteTask(task.id)">X</button>
</div>
<br>
<br><br><br>

<h2 id="login">Login:</h2>

<p>{{ userStore.loggedIn }}</p>

<input type="email" name="email" id="" v-model="Email">
<input type="password" name="password" id="" v-model="Password">

<button @click="userStore.login(Email, Password)">Login</button>
<button @click="userStore.logout">logout</button>

<br>
<br>
<br>

<h2 id="post">Postagens:</h2>
<div v-for="p in postStore.posts" :key="p.id">
    <h3>{{ p.title }}</h3>
    <p>{{ p.content }}</p>
    
</div>
<br>
<br>
<div>
    <h2>Usuários:</h2>
    <div v-for="u in userStore.users" :key="u.id">
        <p>{{ u.email }}</p>
        <p>{{ u.name }}</p>
    </div>
</div>
<br><br><br>
<div>
    <h2>Gangs:</h2>
    <div v-for="g in gangStore.gangs" :key="g.id" id="gang">
        <p>{{ g.name }}</p>
        <p>{{ g.courses }}</p>
    </div>
</div>
<br><br><br>
<div>
    <h2>Schedules:</h2>
    <div v-for="s in scheduleStore.schedules" :key="s.id" id="schedule">
        <p>{{ s.title }}</p>
        <p>{{ s.description }}</p>
    </div>
</div>
<br><br><br>
<div>
    <h2>Links:</h2>
    <div v-for="l in linkStore.links" :key="l.id" id="link">
        <p>{{ l.name }}</p>
        <p>{{ l.url }}</p>
    </div>
</div>
<div id="mensagem">
    <h2>Mensagens:</h2>
    <div v-for="m in messageStore.messages" :key="m.id" id="mensagem">
        <p>{{ m.text }}</p>
        <p>{{ m.country }}</p>
    </div>
    <br>
    <br>
    <h2>Post Mensagem:</h2>
    <div>
        <input type="text" v-model="t" placeholder="Mensagem">
        <input type="text" v-model="c" placeholder="País">
    </div>
    <button @click="messageStore.sendMessage(t, c)" && console.log(userStore.isOrganizer)>Post</button>
</div>
</template>
<style scoped>

</style>