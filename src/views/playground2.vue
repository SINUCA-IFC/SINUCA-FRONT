<script setup>
import { useRoute } from 'vue-router'
import { useTaskStore } from '../stores/taskStore'
import { onMounted, ref } from 'vue'
const taskStore = useTaskStore()

onMounted(() => {
    if (id) {
        taskStore.getTask(id)
    }
})

const route = useRoute()
const id = route.params?.id

const newName = ref('')
const newDescription = ref('')

function mudar() {
    taskStore.updateTask(id, {
        title: newName.value,
        description: newDescription.value
    })
}
</script>
<template>

    <h1>Task Details</h1>
    <p>Task ID: {{ taskStore.task?.id }}</p>
    <p>Task title: {{ taskStore.task?.title }}</p>
    <p>task description: {{ taskStore.task?.description }}</p>

<br><br><br>

    <h1>Edit Task</h1>
    <input type="text" v-model="newName">
    <input type="text" v-model="newDescription">
    <button @click="mudar()">Edit Task</button>
</template>