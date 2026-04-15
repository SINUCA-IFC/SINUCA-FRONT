import { ref } from 'vue'
import { defineStore } from 'pinia'

import TaskService from '@/services/taskService'

const taskService = new TaskService()

export const useTaskStore = defineStore('task', () => {
    const tasks = ref([])
    const task = ref(
        {
        title: "string",
        description: "string",
        endDate: "2026-04-15",
        startDate: "2026-04-15",
        status: 1,
        notification: true,
        category: [
            0
        ],
        user: [
            0
        ]
    }
    )
    const carregando = ref(false)

    async function getTasks() {
        carregando.value = true;
        try {
            const data = await taskService.getTasks()
            tasks.value = data.results
        } finally {
            carregando.value = false;
        }
    }

    async function getTask(id) {
        task.value = await taskService.getTask(id)
    }

    async function createTask(newTask) {
        const createdTask = await taskService.createTask(newTask)
        tasks.value.push(createdTask)

    }

    async function updateTask(id, updatedTask) {
        const updated = await taskService.updateTask(id, updatedTask)
        const index = tasks.value.findIndex(t => t.id === id)
        if (index !== -1) {
            tasks.value[index] = updated
        }
    }

    async function deleteTask(id) {
        await taskService.deleteTask(id)
        tasks.value = tasks.value.filter(t => t.id !== id)
    }

    return {
        tasks,
        task,
        getTasks,
        getTask,
        createTask,
        updateTask,
        deleteTask
    }
})