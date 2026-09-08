import { defineStore } from 'pinia'
import { ref } from 'vue'

import ScheduleService from '../services/scheduleService'

const scheduleService = new ScheduleService()

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref([])
  const schedule = ref({
    category: 1,
    title: 'string',
    startDate: '2026-08-12T18:49:50.611Z',
    endDate: '2026-08-12T18:49:50.611Z',
    location: 'string',
    description: 'string',
    tipo: 1,
    country: [0],
    docs: [0],
  })

  const loading = ref(false)

  async function getSchedules() {
    loading.value = true
    try {
      const data = await scheduleService.getSchedules()
      schedules.value = data.results
    } finally {
      loading.value = false
    }
  }

  async function getSchedule(id) {
    schedule.value = await scheduleService.getSchedule(id)
  }

  async function createSchedule(newSchedule) {
    const createdSchedule = await scheduleService.createSchedule(newSchedule)
    schedules.value.push(createdSchedule)
  }

  async function updateSchedule(id, updatedSchedule) {
    const updated = await scheduleService.updateSchedule(id, updatedSchedule)
    const index = schedules.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      schedules.value[index] = updated
    }
  }

  async function deleteSchedule(id) {
    await scheduleService.deleteSchedule(id)
    schedules.value = schedules.value.filter((t) => t.id !== id)
  }

  return {
    schedules,
    schedule,
    getSchedules,
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
})
