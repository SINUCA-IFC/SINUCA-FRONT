<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import AppInput from './AppInput.vue'
import AppButton from './AppButton.vue'

const userStore = useUserStore()

const props = defineProps({
  userType: String,
  userIcon: String,
  userColor: String,
})

const showPassword = ref(false)
const focusPassword = ref(false)
const focusEmail = ref(false)

function tooglePassword() {
  showPassword.value = !showPassword.value
}

const requirements = computed(() => {
  return [
    { requirement: 'Mínimo de 8 caracteres', valid: userStore.user.password.length >= 8 },
    { requirement: 'Insira um email válido', valid: userStore.user.email.includes('@') },
  ]
})

const isDisabled = computed(() => {
  return !requirements.value[0].valid || !requirements.value[1].valid
})

const emit = defineEmits(['nextStep'])

function nextStep() {
  if (userStore.user.email && userStore.user.password) {
    emit('nextStep')
  }
}
</script>

<template>
  <div class="container-component">
    <h1 class="step-title">CADASTRE-SE</h1>
    <h1 class="step-title2">REGISTRO</h1>

    <div class="forms-container">
      <div class="forms-header" :style="`color: ${props.userColor}`">
        <span :class="props.userIcon"></span>
        <h2>{{ props.userType }}</h2>
      </div>
      <form @submit.prevent="nextStep" class="forms">
        <AppInput
          @focus="focusEmail = true"
          @blur="focusEmail = false"
          label="Email"
          placeholder="Digite seu email"
          type="email"
          v-model="userStore.user.email"
          required
        />
        <span
          v-if="focusEmail"
          style="margin-bottom: 1rem"
          :style="requirements[1].valid ? 'color: #849324;' : 'color: #FD151B;'"
        >
          <span
            :class="
              requirements[1].valid
                ? 'mdi mdi-check-circle-outline'
                : 'mdi mdi-alert-circle-outline'
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
            v-model="userStore.user.password"
            required
          />
          <span class="toogle-password" @click="tooglePassword">
              <span :class="showPassword ? 'mdi mdi-eye' : 'mdi mdi-eye-off'"></span>
            </span>
        </div>
        <span
          v-if="focusPassword"
          :style="requirements[0].valid ? 'color: #849324;' : 'color: #FD151B;'"
        >
          <span
            :class="
              requirements[0].valid
                ? 'mdi mdi-check-circle-outline'
                : 'mdi mdi-alert-circle-outline'
            "
          />
          {{ requirements[0].requirement }}</span
        >
        <AppButton type="submit" :disabled="isDisabled">CONTINUAR</AppButton>
      </form>
    </div>

    <p class="step-subtitle">Email Institucional e senha</p>
  </div>
</template>

<style scoped>
.container-component {
  height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.step-title {
  text-align: center;
  order: 1;
  margin-bottom: 1rem;
}

.step-title2 {
  display: none;
}

.forms-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 2rem;
  order: 3;
}

.step-subtitle {
  text-align: center;
  color: #969696;
  margin-bottom: 2.5rem;
  order: 2;
}

.forms {
  display: flex;
  flex-direction: column;
}

.forms-header {
  text-align: center;
  margin-bottom: 1rem;

  & span {
    font-size: 3rem;
  }

  & h2 {
    font-weight: 600;
    font-size: 1.7rem;
    margin-top: 0.5rem;
  }
}

.password-input {
    position: relative;
}

.toogle-password {
    position: absolute;
    right: 20px;
    top: 45%;
    font-size: 1.2rem;
    color: #002453;
}

@media (min-width: 768px) {
  .container-component {
    height: auto;
    min-height: 80vh;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
  }

  .step-title {
    display: none;
  }

  .forms-container {
    width: 100%;
    max-width: 600px;
    padding: 3rem;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
    order: 2;
  }

  .step-subtitle {
    color: #fff;
    font-weight: 600;
    margin-top: 2rem;
    order: 3;
  }

  .step-title2 {
    text-align: left;
    color: #01295F;
    font-size: 2.5rem;
    max-width: 680px;
    width: 100%;
    margin: 0 0 1.5rem;
    order: 1;
    display: block;
  }
}
@media (max-width: 767px) {
  .container-component { height: auto; min-height: 0; padding: 1.5rem 0; }
  .forms-container { width: 100%; min-width: 0; padding: 1.25rem; }
  .step-title { font-size: clamp(1.5rem, 7vw, 2rem); line-height: 1.4; }
  .step-subtitle { line-height: 1.5; margin-bottom: 1.5rem; }
}
</style>
