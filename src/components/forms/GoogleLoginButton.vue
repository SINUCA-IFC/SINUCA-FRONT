<script setup>
import { ref } from 'vue'
import AppButton from './AppButton.vue'
import { startGoogle, authError } from '@/services/authService'
defineProps({ disabled: Boolean })
const emit = defineEmits(['busy'])
const busy = ref(false)
const error = ref('')
async function google() {
  if (busy.value) return
  busy.value = true
  emit('busy', true)
  error.value = ''
  try {
    await startGoogle()
  } catch (failure) {
    error.value = authError(failure)
    busy.value = false
    emit('busy', false)
  }
}
</script>
<template>
  <AppButton class="google-button" :disabled="disabled || busy" @click="google">
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.2 3.6l6.85-6.85C35.89 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.24 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.88 46.98 24.55z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59C10.05 27.14 9.78 25.6 9.78 24s.27-3.14.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.91 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
    {{ busy ? 'Conectando…' : 'Continuar com Google' }}
  </AppButton>
  <p v-if="error" role="alert">{{ error }}</p>
</template>

<style scoped>
.google-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #111;
  color: white;
}
.google-button:hover:not(:disabled) {
  background: #292929;
}
.google-button svg {
  flex: none;
  box-sizing: content-box;
  padding: 0.2rem;
  border-radius: 50%;
  background: white;
}
</style>
