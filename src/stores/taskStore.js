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

  async function moveTask(id, status, nextTaskId, previousTaskId) {
    const current = generation
    const movingTask = tasks.value.find((task) => task.id === id)
    if (!movingTask) return

    if (movingTask.status !== status) {
      await updateTask(id, { status })
    }
    if (current !== generation) return

    const index = tasks.value.findIndex((task) => task.id === id)
    if (index === -1) return

    const [moved] = tasks.value.splice(index, 1)
    const nextIndex = tasks.value.findIndex((task) => task.id === nextTaskId)
    const previousIndex = tasks.value.findIndex((task) => task.id === previousTaskId)
    const destination = nextIndex !== -1 ? nextIndex : previousIndex + 1
    tasks.value.splice(destination, 0, moved)
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
    loading: carregando,
    tasks,
    task,
    getTasks,
    getTask,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    resetTask,
  }
})
