<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGangStore } from '@/stores/gangStore.js'
import { useUserStore } from '@/stores/userStore.js'
import AppButton from './AppButton.vue'
import AppInput from './AppInput.vue'
import { getAuthProfile } from '@/services/authProfiles'
import { authError } from '@/services/authService'
import { useToastStore } from '@/stores/toastStore'
const toasts = useToastStore()

const userStore = useUserStore()
const gangStore = useGangStore()

const loading = ref(false)
const errorMessage = ref('')
const focusMatriculation = ref(false)

const props = defineProps({
  draft: { type: Object, required: true },
  userId: String,
})

const emit = defineEmits(['back', 'registered'])
const previewUrl = ref(null)
const selectedFile = ref(null)

const requirements = computed(() => {
  const matriculation = props.draft.matriculation ?? ''
  return [
    {
      requirement: 'Digite uma matrícula válida',
      valid:
        matriculation.length < 10 || matriculation.length > 10 || !/^[0-9]+$/.test(matriculation),
    },
  ]
})

function handleImage(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    errorMessage.value = 'Escolha uma foto JPG ou PNG de até 5 MB.'
    event.target.value = ''
    return
  }
  errorMessage.value = ''

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function register() {
  if (loading.value) return
  if (props.userId === '2' && requirements.value[0].valid) {
    errorMessage.value = 'A matrícula deve ter 10 dígitos.'
    return
  }
  loading.value = true
  errorMessage.value = ''

  try {
    await userStore.register(
      props.draft.email,
      props.draft.name.trim(),
      props.draft.password,
      props.draft.gang,
      props.draft.matriculation,
      selectedFile.value,
      getAuthProfile(props.userId)?.role,
    )
    props.draft.password = ''
    toasts.show('Cadastro enviado. Confira o código no seu e-mail.')
    emit('registered')
  } catch (err) {
    errorMessage.value = authError(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  gangStore.getGangs().catch((error) => {
    errorMessage.value = authError(error)
  })
})
onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <form @submit.prevent="register" class="auth-form">
    <div class="image-section">
      <label class="avatar">
        <img v-if="previewUrl" :src="previewUrl" alt="foto do usuário" />

        <span v-else class="avatar-placeholder">
          <i class="mdi mdi-camera"></i>
        </span>

        <input
          type="file"
          aria-label="Escolher foto de perfil"
          accept="image/jpeg, image/png"
          @change="handleImage"
        />
      </label>
    </div>

    <AppInput
      v-model="props.draft.name"
      label="Nome Completo"
      type="text"
      placeholder="Digite seu nome."
      required
    />
    <AppInput
      v-if="userId === '2'"
      v-model="props.draft.matriculation"
      label="Matrícula"
      type="text"
      placeholder="Digite sua matrícula."
      inputmode="numeric"
      pattern="[0-9]{10}"
      maxlength="10"
      @focus="focusMatriculation = true"
      @blur="focusMatriculation = false"
      required
    />

    <span
      style="color: #fd151b; margin-bottom: 1rem"
      v-if="requirements[0].valid && focusMatriculation"
    >
      <span class="mdi mdi-alert-circle-outline" />
      {{ requirements[0].requirement }}</span
    >
    <div class="class-area">
      <label for="class" class="label-class">Turma</label>
      <select id="class" class="select-class" v-model="props.draft.gang">
        <option :value="null">Selecione uma turma (opcional)</option>
        <option
          v-for="c in gangStore.gangs"
          :key="c.id"
          :value="c.id"
          name="class"
          class="option-class"
        >
          {{ c.name }}
        </option>
      </select>
    </div>

    <p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <AppButton type="submit" :disabled="loading">{{
      loading ? 'CADASTRANDO...' : 'CADASTRAR'
    }}</AppButton>
    <AppButton variant="secondary" :disabled="loading" @click="$emit('back')">VOLTAR</AppButton>
  </form>
</template>

<style scoped>
.image-section {
  display: flex;
  justify-content: center;
}

.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: #f1f1f1;
  border: 2px dashed #ccc;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}

.avatar:hover {
  border-color: #666;
  background: #eaeaea;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.avatar:focus-within {
  outline: 3px solid #01295f;
  outline-offset: 3px;
}

.avatar-placeholder {
  color: #999;
  font-size: 2rem;
}

.label-class {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
}
.select-class {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 2px solid #d9d9d9;
  border-radius: 5px;
  outline: none;
}

.select-class::picker-icon {
  color: #9999;
  transition: 0.4s rotate;
}

.select-class:open::picker-icon {
  rotate: 180deg;
}

.select-class option {
  border: 1px solid #d7d7d7;
  padding: 6px;
  transition: 0.4s;
}
</style>
