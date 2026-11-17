import { ref } from 'vue'
import { defineStore } from 'pinia'
import TaskService from '@/services/taskService'
import { getAllPages } from '@/services/pagination'

const taskService = new TaskService()

const getDefaultTaskState = () => ({
    title: "",
    description: "",
    endDate: "",
    postDate: "",
    startDate: "",
    status: 1,
    notification: false,
    category: [],
    user: []
})

export const useTaskStore = defineStore('task', () => {
    const tasks = ref([])
    const task = ref(getDefaultTaskState())
    const carregando = ref(false)

    function resetTask() {
        task.value = getDefaultTaskState()
    }

    async function getTasks() {
        carregando.value = true;
        try {
            tasks.value = await getAllPages(page => taskService.getTasks(page))
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
        const index = tasks.value.findIndex(t => String(t.id) === String(id))
        if (index !== -1) {
            tasks.value[index] = updated
        }
    }

    async function deleteTask(id) {
        await taskService.deleteTask(id)
        tasks.value = tasks.value.filter(t => String(t.id) !== String(id))
    }

    return {
        tasks,
        task,
        getTasks,
        getTask,
        createTask,
        updateTask,
        deleteTask,
        resetTask
    }
})
