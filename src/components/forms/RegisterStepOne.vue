<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getAuthProfile } from '@/services/authProfiles'
const route = useRoute()
import GoogleLoginButton from './GoogleLoginButton.vue'
import AppInput from './AppInput.vue'
import AppButton from './AppButton.vue'

const confirmPassword = ref('')
const googleBusy = ref(false)

const props = defineProps({
  draft: { type: Object, required: true },
})

const showPassword = ref(false)
const focusPassword = ref(false)
const focusEmail = ref(false)

function tooglePassword() {
  showPassword.value = !showPassword.value
}

const requirements = computed(() => {
  return [
    { requirement: 'Mínimo de 8 caracteres', valid: props.draft.password.length >= 8 },
    { requirement: 'Insira um email válido', valid: props.draft.email.includes('@') },
  ]
})

const isDisabled = computed(() => {
  return (
    !requirements.value[0].valid ||
    !requirements.value[1].valid ||
    confirmPassword.value !== props.draft.password ||
    googleBusy.value
  )
})

const emit = defineEmits(['nextStep'])

function nextStep() {
  if (!isDisabled.value) {
    emit('nextStep')
  }
}
</script>

<template>
  <form @submit.prevent="nextStep" class="auth-form">
    <AppInput
      @focus="focusEmail = true"
      @blur="focusEmail = false"
      label="E-mail"
      placeholder="Digite seu email"
      type="email"
      autocomplete="email"
      v-model="props.draft.email"
      required
    />
    <span v-if="focusEmail" :style="requirements[1].valid ? 'color: #849324;' : 'color: #FD151B;'">
      <span
        :class="
          requirements[1].valid ? 'mdi mdi-check-circle-outline' : 'mdi mdi-alert-circle-outline'
        "
      />
      {{ requirements[1].requirement }}</span
    >
    <div class="password-input">
      <AppInput
        @focus="focusPassword = true"
        @blur="focusPassword = false"
        label="Senha"
        placeholder="Digite sua senha"
        :type="showPassword ? 'text' : 'password'"
        v-model="props.draft.password"
        autocomplete="new-password"
        required
      />
      <button
        class="toggle-password"
        type="button"
        :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
        @click="tooglePassword"
      >
        <span :class="showPassword ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"></span>
      </button>
    </div>
    <span
      v-if="focusPassword"
      :style="requirements[0].valid ? 'color: #849324;' : 'color: #FD151B;'"
    >
      <span
        :class="
          requirements[0].valid ? 'mdi mdi-check-circle-outline' : 'mdi mdi-alert-circle-outline'
        "
      />
      {{ requirements[0].requirement }}</span
    >
    <AppInput
      label="Confirme sua senha"
      type="password"
      v-model="confirmPassword"
      autocomplete="new-password"
      required
    />
    <p v-if="confirmPassword && confirmPassword !== props.draft.password" role="alert">
      As senhas não coincidem.
    </p>
    <AppButton type="submit" :disabled="isDisabled">CONTINUAR</AppButton>
    <GoogleLoginButton :role="getAuthProfile(route.query.id)?.role" @busy="googleBusy = $event" />
  </form>
  <RouterLink class="auth-link" :to="{ name: 'login', query: route.query }"
    >Já tem uma conta? Clique aqui.</RouterLink
  >
</template>

<style scoped>
.password-input {
  position: relative;
}
.password-input :deep(input) {
  padding-right: 3rem;
}
.toggle-password {
  position: absolute;
  right: 0.45rem;
  bottom: 0.18rem;
  width: 2rem;
  height: 2rem;
  border: 0;
  background: transparent;
  color: #01295f;
  cursor: pointer;
}
</style>
