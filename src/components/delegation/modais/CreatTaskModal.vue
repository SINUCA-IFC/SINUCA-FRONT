<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppModal from '@/components/layout/AppModal.vue'
import TaskDetails from '@/components/tasks/TaskDetails.vue'

const route = useRoute()
const emit = defineEmits(['close'])
const initialStatus = computed(() => {
  const status = route.query.status
  return ['1', '2', '3'].includes(status) ? Number(status) : undefined
})
</script>

<template>
  <AppModal @close="emit('close')">
    <TaskDetails
      :key="route.params.id || `new-${initialStatus ?? 'default'}`"
      :task-id="route.params.id"
      :initial-status="initialStatus"
      @close="emit('close')"
    />
  </AppModal>
</template>
