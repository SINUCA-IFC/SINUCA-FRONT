<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPushTarget } from '@/services/pushNotificationPayload'
import { useUserStore } from '@/stores/userStore'
import { authError, exchangeGoogleSession, googleCallbackError } from '@/services/authService'
import { getAuthProfile } from '@/services/authProfiles'
import AuthShell from '@/components/forms/AuthShell.vue'
import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/forms/AppButton.vue'
import GoogleLoginButton from '@/components/forms/GoogleLoginButton.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const profile = computed(() => getAuthProfile(route.query.id))
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const googleBusy = ref(false)
const completingGoogle = ref(route.query.google === 'return')
const errorMessage = ref('')
const registrationPending = ref(false)

onMounted(async () => {
  if (!completingGoogle.value) return
  let stage = 'session'
  try {
    if (Object.hasOwn(route.query, 'error')) {
      errorMessage.value =
        route.query.error === 'google_account_confirmation_required'
          ? 'Este e-mail já tem cadastro no SINUCA. Entre com e-mail e senha para concluir qualquer confirmação pendente ou use outra conta Google.'
          : 'Não foi possível concluir o acesso com o Google. Tente novamente.'
      return
    }
    const tokens = await exchangeGoogleSession()
    stage = 'profile'
    await userStore.completeLogin(tokens)
    await router.replace('/')
  } catch (failure) {
    errorMessage.value = googleCallbackError(failure, stage)
  } finally {
    completingGoogle.value = false
    if (route.name === 'login')
      await router.replace({
        name: 'login',
        query: { id: route.query.id || sessionStorage.getItem('sinuca_auth_profile') || '2' },
      })
  }
})

async function login() {
  if (loading.value || googleBusy.value) return
  loading.value = true
  errorMessage.value = ''
  registrationPending.value = false
  try {
    if (await userStore.login(email.value.trim(), password.value, profile.value?.role)) {
      await router.push(getPushTarget({ data: { url: route.query.redirect } }))
    } else {
      registrationPending.value = true
      errorMessage.value = 'Confirme seu e-mail para concluir o cadastro e entrar.'
    }
    password.value = ''
  } catch (error) {
    errorMessage.value = authError(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell title="Entrar" login-layout>
    <p v-if="completingGoogle" role="status">Concluindo seu acesso…</p>
    <template v-else>
      <form class="auth-form" @submit.prevent="login">
        <AppInput
          v-model="email"
          label="E-mail"
          type="email"
          placeholder="exemplo@gmail.com"
          required
          autocomplete="email"
        />
        <div class="password-input">
          <AppInput
            v-model="password"
            label="Senha"
            placeholder="Digite sua senha"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
          />
          <button
            class="toggle-password"
            type="button"
            :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            @click="showPassword = !showPassword"
          >
            <span
              :class="showPassword ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"
              aria-hidden="true"
            ></span>
          </button>
        </div>
        <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
        <RouterLink
          v-if="registrationPending"
          class="auth-link"
          :to="{ name: 'cadastro', query: { id: profile?.id, etapa: 'email' } }"
          >Concluir cadastro</RouterLink
        >
        <AppButton type="submit" :disabled="loading || googleBusy">{{
          loading ? 'Entrando…' : 'Entrar'
        }}</AppButton>
        <GoogleLoginButton :role="profile?.role" :disabled="loading" @busy="googleBusy = $event" />
      </form>
      <RouterLink class="auth-link" :to="{ name: 'cadastro', query: route.query }"
        >Novo no SINUCA? Clique aqui.</RouterLink
      >
    </template>
  </AuthShell>
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
  bottom: 0.5rem;
  width: 2rem;
  height: 2rem;
  border: 0;
  background: transparent;
  color: #01295f;
  cursor: pointer;
}
</style>
