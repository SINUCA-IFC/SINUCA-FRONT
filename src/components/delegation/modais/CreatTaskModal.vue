<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
defineProps({ taskId: [String, Number], readOnly: Boolean })
import AppModal from '@/components/layout/AppModal.vue'
import TaskDetails from '@/components/tasks/TaskDetails.vue'
const emit = defineEmits(['close'])
</script>

<template>
  <AppModal @close="emit('close')">
    <TaskDetails
      :key="taskId || route.params.id || 'new'"
      :task-id="taskId || route.params.id"
      :read-only="readOnly"
      @close="emit('close')"
    />
  </AppModal>
</template>
