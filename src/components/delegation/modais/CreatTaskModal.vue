<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppModal from '@/components/layout/AppModal.vue'
import TaskDetails from '@/components/tasks/TaskDetails.vue'

defineProps({ taskId: [String, Number], readOnly: Boolean })
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
      :key="taskId || route.params.id || `new-${initialStatus ?? 'default'}`"
      :task-id="taskId || route.params.id"
      :initial-status="initialStatus"
      :read-only="readOnly"
      @close="emit('close')"
    />
  </AppModal>
</template>
