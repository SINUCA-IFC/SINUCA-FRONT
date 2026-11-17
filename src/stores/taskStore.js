import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import TaskService from '@/services/taskService'
import { getAllPages } from '@/services/pagination'
import { useUserStore } from '@/stores/userStore'

const taskService = new TaskService()

const getDefaultTaskState = () => ({
  title: '',
  description: '',
  endDate: '',
  postDate: '',
  startDate: '',
  status: 1,
  notification: false,
  category: [],
  user: [],
})

export const useTaskStore = defineStore('task', () => {
  const auth = useUserStore()
  let generation = 0
  const tasks = ref([])
  const task = ref(getDefaultTaskState())
  const carregando = ref(false)

  function resetTask() {
    task.value = getDefaultTaskState()
  }

  async function getTasks() {
    const current = generation
    carregando.value = true
    try {
      const result = await getAllPages((page) => taskService.getTasks(page))
      if (current === generation) tasks.value = result
    } finally {
      if (current === generation) carregando.value = false
    }
  }

  async function getTask(id) {
    const current = generation
    const result = await taskService.getTask(id)
    if (current === generation) task.value = result
  }

  async function createTask(newTask) {
    const current = generation
    const createdTask = await taskService.createTask(newTask)
    if (current === generation) tasks.value.push(createdTask)
  }

  async function updateTask(id, updatedTask) {
    const current = generation
    const updated = await taskService.updateTask(id, updatedTask)
    if (current !== generation) return
    const index = tasks.value.findIndex((t) => String(t.id) === String(id))
    if (index !== -1) {
      tasks.value[index] = updated
    }
  }

  async function deleteTask(id) {
    const current = generation
    await taskService.deleteTask(id)
    if (current !== generation) return
    tasks.value = tasks.value.filter((t) => String(t.id) !== String(id))
  }

  watch(
    () => [auth.loggedIn, auth.user.id],
    () => {
      generation++
      tasks.value = []
      resetTask()
      carregando.value = false
    },
    { flush: 'sync' },
  )

  return {
    tasks,
    task,
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    resetTask,
  }
})
