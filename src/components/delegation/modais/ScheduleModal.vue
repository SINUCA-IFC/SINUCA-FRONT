<script setup>
import AppModal from '@/components/layout/AppModal.vue'
import ScheduleDetails from '@/components/delegation/schedules/ScheduleDetails.vue'

const props = defineProps({
  scheduleId: String,
})
const emit = defineEmits(['close'])
</script>

<template>
  <AppModal @close="emit('close')">
    <ScheduleDetails :schedule-id="props.scheduleId" @close="emit('close')" />
  </AppModal>
</template>
