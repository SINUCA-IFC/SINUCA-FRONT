import { defineStore } from 'pinia'
import { ref } from 'vue'

import ScheduleService from '../services/scheduleService'
import { getAllPages } from '@/services/pagination'

const scheduleService = new ScheduleService()

export const useScheduleStore = defineStore('schedule', () => {
  const schedules = ref([])
  const loading = ref(false)

  async function getSchedules() {
    loading.value = true
    try {
      schedules.value = await getAllPages((page) => scheduleService.getSchedules(page))
    } finally {
      loading.value = false
    }
  }

  async function createSchedule(newSchedule) {
    const createdSchedule = await scheduleService.createSchedule(newSchedule)
    schedules.value.push(createdSchedule)
  }

  async function updateSchedule(id, updatedSchedule) {
    const updated = await scheduleService.updateSchedule(id, updatedSchedule)
    const index = schedules.value.findIndex((t) => String(t.id) === String(id))
    if (index !== -1) {
      schedules.value[index] = updated
    }
  }

  async function deleteSchedule(id) {
    await scheduleService.deleteSchedule(id)
    schedules.value = schedules.value.filter((t) => String(t.id) !== String(id))
  }

  return {
    loading,
    schedules,
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
})
