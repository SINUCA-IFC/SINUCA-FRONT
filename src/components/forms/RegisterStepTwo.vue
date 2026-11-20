<script setup>
import { computed, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import {
  readPending,
  clearPending,
  confirmEmail,
  resendCode,
  authError,
} from '@/services/authService'
import AppInput from './AppInput.vue'
import AppButton from './AppButton.vue'
const router = useRouter()
const store = useUserStore()
const pending = ref(readPending())
const code = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')
const remaining = ref(0)
let deadline = 0
const timer = setInterval(() => {
  remaining.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}, 250)
onUnmounted(() => clearInterval(timer))
const validCode = computed(() => /^[0-9]{6}$/.test(code.value))
function cooldown(seconds = 15) {
  deadline = Date.now() + seconds * 1000
  remaining.value = seconds
}
function handleError(failure) {
  error.value = authError(failure)
  if ([409, 410].includes(failure.response?.status)) {
    clearPending()
    pending.value = null
  }
  if (failure.response?.status === 429) {
    const retry = Number(failure.response.headers?.['retry-after'])
    cooldown(Number.isFinite(retry) && retry > 15 ? retry : 15)
  }
}
async function confirm() {
  if (loading.value || !validCode.value || !pending.value) return
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    await store.completeLogin(await confirmEmail(code.value))
    code.value = ''
    await router.replace('/')
  } catch (failure) {
    handleError(failure)
    pending.value = readPending()
  } finally {
    loading.value = false
  }
}
async function resend() {
  if (loading.value || remaining.value || !pending.value) return
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    await resendCode()
    pending.value = readPending()
    code.value = ''
    message.value = 'Enviamos um novo código para seu e-mail.'
    cooldown()
  } catch (failure) {
    handleError(failure)
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <form v-if="pending" @submit.prevent="confirm" class="auth-form" :aria-busy="loading">
    <p>Digite o código enviado para {{ pending.email }}. Ele expira em dez minutos.</p>
    <AppInput
      v-model="code"
      label="Código de seis dígitos"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern="[0-9]{6}"
      maxlength="6"
      required
    />
    <AppButton type="submit" :disabled="loading || !validCode">{{
      loading ? 'AGUARDE...' : 'CONFIRMAR E-MAIL'
    }}</AppButton>
    <AppButton variant="secondary" :disabled="loading || remaining > 0" @click="resend">{{
      remaining > 0 ? 'REENVIAR EM ' + remaining + 's' : 'REENVIAR CÓDIGO'
    }}</AppButton>
  </form>
  <p v-else>Não há uma confirmação disponível. Volte ao login para continuar.</p>
  <p v-if="error" role="alert">{{ error }}</p>
  <p v-if="message" role="status">{{ message }}</p>
  <RouterLink class="auth-link" to="/login">Voltar ao login</RouterLink>
</template>
