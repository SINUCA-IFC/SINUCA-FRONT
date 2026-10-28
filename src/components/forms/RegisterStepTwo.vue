<script setup>
import { ref, computed } from 'vue';
import AppButton from './AppButton.vue';
import AppInput from './AppInput.vue';

const props = defineProps({
  userType: String,
  userIcon: String,
  userColor: String,
})

const token = ref('')

const isDisabled = computed(() => token.value === '')

const emit = defineEmits(['nextStep'])

function nextStep() {
  emit('nextStep')
}
</script>

<template>
  <div class="container-component">
    <h1 class="step-title">TOKEN DE VERIFICAÇÃO</h1>
    <h1 class="step-title2">REGISTRO</h1>

    <div class="forms-container">
      <div class="forms-header" :style="`color: ${props.userColor}`">
        <span :class="props.userIcon"></span>
        <h2>{{ props.userType }}</h2>
      </div>

      <form @submit.prevent="nextStep" class="forms">
        <AppInput 
            label="Token"
            type="text"
            v-model="token"
            required
        />

        <AppButton type="submit" :disabled="isDisabled">CONTINUAR</AppButton>
      </form>
    </div>

    <p class="step-subtitle">Digite o código enviado para o seu e-mail.</p>
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
