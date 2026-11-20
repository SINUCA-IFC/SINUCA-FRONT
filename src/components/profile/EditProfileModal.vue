<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import AppModal from '@/components/layout/AppModal.vue'
import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/forms/AppButton.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
const emit = defineEmits(['close', 'saved'])
const userStore = useUserStore()
const dialog = ref(null)
const name = ref(userStore.user.name || '')
const file = ref(null)
const preview = ref('')
const photoInput = ref(null)
const saving = ref(false)
const error = ref('')
const removePhoto = ref(false)
const validName = computed(() => Boolean(name.value.trim()) && name.value.trim().length <= 255)
const photo = computed(() => preview.value || (removePhoto.value ? undefined : userStore.user.foto?.url))

const changed = computed(
  () => name.value.trim() !== (userStore.user.name || '') || Boolean(file.value) || removePhoto.value,
)

function removeCurrentPhoto() {
  clearPreview()
  removePhoto.value = Boolean(userStore.user.foto)
  error.value = ''
}

function clearPreview() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = ''
  file.value = null
}

function canClose() {
  return !saving.value && (!changed.value || window.confirm('Descartar as alterações do perfil?'))
}
function requestClose() {
  if (canClose()) emit('close')
}
function selectPhoto(event) {
  const selected = event.target.files?.[0]
  event.target.value = ''
  if (!selected) return
  error.value = ''
  if (!['image/jpeg', 'image/png'].includes(selected.type)) {
    error.value = 'Escolha uma imagem JPG ou PNG.'
    return
  }
  if (selected.size > 5 * 1024 * 1024) {
    error.value = 'A foto deve ter no máximo 5 MB.'
    return
  }
  clearPreview()
  removePhoto.value = false
  file.value = selected
  preview.value = URL.createObjectURL(selected)
}
async function saveProfile() {
  if (saving.value || !changed.value) return
  error.value = ''
  if (name.value.trim().length > 255) {
    error.value = 'O nome deve ter no máximo 255 caracteres.'
    return
  }
  if (!name.value.trim()) {
    error.value = 'Informe seu nome.'
    return
  }
  saving.value = true
  try {
    const changes = { name: name.value.trim() }
    if (file.value) {
      const { data } = await userStore.uploadImage(file.value, 'Foto de perfil')
      if (!data.attachment_key) throw new Error('Upload sem chave de imagem')
      changes.foto_attachment_key = data.attachment_key
    } else if (removePhoto.value) {
      changes.foto_attachment_key = null
    }
    await userStore.updateProfile(changes)
    emit('saved')
  } catch (err) {
    error.value =
      err.response?.status === 404
        ? 'Seu perfil ainda não está disponível para edição. Verifique sua vinculação à delegação.'
        : 'Não foi possível salvar o perfil. Verifique sua conexão e tente novamente.'
  } finally {
    saving.value = false
  }
}

let previousFocus
onMounted(() => {
  previousFocus = document.activeElement
  dialog.value.focus()
})
onBeforeUnmount(() => {
  clearPreview()
  previousFocus?.focus()
})
function handleKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    requestClose()
  }
  if (event.key !== 'Tab') return
  const controls = [
    ...dialog.value.querySelectorAll('button:not(:disabled), input:not(:disabled)'),
  ].filter((control) => !control.matches(':disabled') && !control.hidden)
  const first = controls[0]
  const last = controls.at(-1)
  if (!first) {
    event.preventDefault()
    return
  }
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === dialog.value)
  ) {
    event.preventDefault()
    last.focus()
  } else if (
    !event.shiftKey &&
    (document.activeElement === last || document.activeElement === dialog.value)
  ) {
    event.preventDefault()
    first.focus()
  }
}
onBeforeRouteLeave(canClose)
</script>
<template>
  <AppModal @close="requestClose">
    <section
      ref="dialog"
      class="profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      :aria-busy="saving"
      tabindex="-1"
      @keydown="handleKeydown"
    >
      <div class="header-section">
        <h2 id="edit-profile-title">Editar perfil</h2>
        <button
          type="button"
          class="close-button"
          aria-label="Fechar edição do perfil"
          :disabled="saving"
          @click="requestClose"
        >
          <span class="mdi mdi-close" aria-hidden="true"></span>
        </button>
      </div>
      <form @submit.prevent="saveProfile">
        <fieldset :disabled="saving">
          <button type="button" class="avatar" aria-label="Alterar foto do perfil" aria-describedby="photo-help" @click="photoInput?.click()">
            <UserAvatar :src="photo" alt="Prévia da foto de perfil" />
            <span class="photo-edit mdi mdi-pencil-outline" aria-hidden="true"></span>
          </button>
          <button v-if="photo" type="button" class="remove-photo" @click="removeCurrentPhoto">
            <span class="mdi mdi-trash-can-outline" aria-hidden="true"></span>
            Remover foto
          </button>
          <input
            ref="photoInput"
            hidden
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png"
            aria-describedby="photo-help"
            @change="selectPhoto"
          />
          <p id="photo-help">JPG ou PNG. Até 5 MB.</p>
          <AppInput v-model="name" label="Nome completo" type="text" required />
          <p v-if="!name.trim()" class="error" role="status">Informe seu nome. O campo não pode ficar vazio.</p>
          <p v-else-if="!validName" class="error" role="status">O nome deve ter no máximo 255 caracteres.</p>
          <p v-if="error" class="error" role="alert">{{ error }}</p>
          <div class="form-actions">
            <AppButton type="submit" :disabled="!changed || !validName || saving">{{
              saving ? 'Salvando...' : 'Salvar alterações'
            }}</AppButton>
            <AppButton variant="secondary" :disabled="saving" @click="requestClose"
              >Cancelar</AppButton
            >
          </div>
        </fieldset>
      </form>
    </section>
  </AppModal>
</template>
<style scoped>
.profile-modal {
  position: absolute;
  z-index: 20;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 85dvh;
  overflow-y: auto;
  padding: 1.5rem;
  background: white;
  border-radius: 15px 15px 0 0;
  line-height: 1.5;
}
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
h2 {
  font-size: 1.7rem;
  font-weight: bold;
}
.close-button {
  border: 0;
  background: none;
  color: #969696;
  font-size: 2rem;
  cursor: pointer;
}
.avatar {
  position: relative;
  border: 0;
  padding: 0;
  cursor: pointer;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 1.5rem auto;
  display: grid;
  place-items: center;
  background: #f1f1f1;
  color: #01295f;
  font-size: 2rem;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.6);
}
.photo-edit {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: white;
  font-size: 1.8rem;
  pointer-events: none;
}
.remove-photo {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 auto 0.75rem;
  padding: 0.5rem;
  border: 0;
  background: transparent;
  color: #b32c3d;
  font: inherit;
  cursor: pointer;
}
.remove-photo:focus-visible {
  outline: 3px solid #93b6e3;
  outline-offset: 3px;
}
.avatar:focus-visible {
  outline: 3px solid #93b6e3;
  outline-offset: 4px;
}
.avatar:hover img {
  filter: brightness(0.75);
}
#photo-help {
  text-align: center;
  color: #969696;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.form-actions > * {
  flex: 1;
}
.error {
  color: #fd151b;
}
@media (min-width: 1024px) {
  .profile-modal {
    bottom: auto;
    left: 50%;
    top: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    width: min(600px, 90%);
    padding: 2rem 3rem;
    border-radius: 15px;
  }
}
</style>
