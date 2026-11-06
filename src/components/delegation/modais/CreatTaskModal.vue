<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
import AppModal from '@/components/layout/AppModal.vue'
import TaskDetails from '@/components/tasks/TaskDetails.vue'
const emit = defineEmits(['close'])
</script>

<template>
  <AppModal @close="emit('close')">
    <TaskDetails
      :key="route.params.id || 'new'"
      :task-id="route.params.id"
      @close="emit('close')"
    />
  </AppModal>
</template>
