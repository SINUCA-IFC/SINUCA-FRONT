<script setup>
import { computed, ref } from 'vue'
import AppModal from '@/components/layout/AppModal.vue'
import ModalActions from '@/components/layout/ModalActions.vue'
import AppButton from '@/components/forms/AppButton.vue'
import { useScheduleStore } from '@/stores/scheduleStore'
import { useLinkStore } from '@/stores/linkStore'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps({ kind: String, resource: { type: Object, required: true } })
const emit = defineEmits(['close'])
const schedules = useScheduleStore()
const links = useLinkStore()
const toasts = useToastStore()
const saving = ref(false)
const error = ref('')
const label = computed(() => (props.kind === 'schedule' ? 'cronograma' : 'documento'))

function close() {
  if (!saving.value) emit('close')
}
async function remove() {
  if (saving.value) return
  saving.value = true
  error.value = ''
  try {
    if (props.kind === 'schedule') await schedules.deleteSchedule(props.resource.id)
    else await links.deleteLink(props.resource.id)
    toasts.show(
      props.kind === 'schedule' ? 'Cronograma removido.' : 'Documento removido.',
      'success',
    )
    emit('close')
  } catch {
    error.value = `Não foi possível remover o ${label.value}. Tente novamente.`
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppModal centered @close="close">
    <section
      class="modal-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-resource-title"
      :aria-busy="saving"
    >
      <h2 id="remove-resource-title">Remover {{ label }}?</h2>
      <p>
        Remover <strong>{{ resource.title || resource.name || resource.url }}</strong
        >?
      </p>
      <p v-if="kind === 'schedule'">
        O cronograma será removido de todas as delegações vinculadas.
      </p>
      <p v-else>O documento será removido de todas as delegações e dos cronogramas relacionados.</p>
      <p v-if="error" role="alert" class="error">{{ error }}</p>
      <ModalActions>
        <AppButton variant="secondary" :disabled="saving" @click="close">Cancelar</AppButton>
        <AppButton variant="danger" :disabled="saving" @click="remove">{{
          saving ? 'Removendo...' : 'Confirmar remoção'
        }}</AppButton>
      </ModalActions>
    </section>
  </AppModal>
</template>

<style scoped>
h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
p {
  line-height: 1.5;
  margin-top: 0.75rem;
  overflow-wrap: anywhere;
}
.error {
  color: #b00020;
}
</style>
