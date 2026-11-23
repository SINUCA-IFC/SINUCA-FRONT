<script setup>
import ModalActions from '@/components/layout/ModalActions.vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import AppModal from '@/components/layout/AppModal.vue'
import AppButton from '@/components/forms/AppButton.vue'
import { usePostStore } from '@/stores/postStore'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({ post: { type: Object, default: null } })
const emit = defineEmits(['close', 'saved'])
const posts = usePostStore()
const user = useUserStore()
const title = ref(props.post?.title || '')
const content = ref(props.post?.content || '')
const file = ref(null)
const preview = ref('')
const saving = ref(false)
const error = ref('')
const photo = computed(() => preview.value || props.post?.foto?.url)
const changed = computed(
  () =>
    title.value !== (props.post?.title || '') ||
    content.value !== (props.post?.content || '') ||
    file.value,
)

function close() {
  if (!saving.value && (!changed.value || window.confirm('Descartar as alterações da postagem?')))
    emit('close')
}
function clearPreview() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = ''
  file.value = null
}
function selectImage(event) {
  const selected = event.target.files?.[0]
  event.target.value = ''
  if (!selected) return
  error.value = ''
  if (!['image/jpeg', 'image/png'].includes(selected.type) || selected.size > 5 * 1024 * 1024) {
    error.value = 'Escolha uma imagem JPG ou PNG de até 5 MB.'
    return
  }
  clearPreview()
  file.value = selected
  preview.value = URL.createObjectURL(selected)
}
function removePhoto() {
  clearPreview()
}
async function save() {
  if (saving.value || user.user.role !== 'organizer') return
  error.value = ''
  if (!title.value.trim() || title.value.trim().length > 200 || !content.value.trim()) {
    error.value = 'Preencha o título (até 200 caracteres) e a descrição.'
    return
  }
  saving.value = true
  try {
    const payload = { title: title.value.trim(), content: content.value.trim() }
    if (file.value) {
      const { data } = await user.uploadImage(file.value, title.value.trim())
      if (!data.attachment_key) throw new Error('Imagem sem chave')
      payload.foto_attachment_key = data.attachment_key
    }
    if (props.post) await posts.updatePost(props.post.id, payload)
    else await posts.createPost(payload)
    emit('saved')
  } catch {
    error.value = 'Não foi possível salvar a postagem. Seus dados foram mantidos; tente novamente.'
  } finally {
    saving.value = false
  }
}
onBeforeUnmount(clearPreview)
</script>

<template>
  <AppModal centered @close="close">
    <section
      class="modal-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-editor-title"
      :aria-busy="saving"
    >
      <h2 id="post-editor-title">{{ post ? 'Editar postagem' : 'Nova postagem' }}</h2>
      <form @submit.prevent="save">
        <fieldset :disabled="saving">
          <label for="post-title">Título</label>
          <input id="post-title" v-model="title" maxlength="200" required />
          <label for="post-content">Descrição</label>
          <textarea id="post-content" v-model="content" rows="6" required></textarea>
          <label for="post-image">Imagem (opcional)</label>
          <input id="post-image" type="file" accept="image/jpeg,image/png" @change="selectImage" />
          <p class="hint">JPG ou PNG, até 5 MB.</p>
          <img v-if="photo" :src="photo" alt="Prévia da imagem da postagem" class="preview" />
          <AppButton v-if="file" variant="secondary" @click="removePhoto"
            >Cancelar seleção da imagem</AppButton
          >
        </fieldset>
        <p v-if="error" role="alert">{{ error }}</p>
        <ModalActions>
          <AppButton variant="danger" :disabled="saving" @click="close">Cancelar</AppButton>
          <AppButton type="submit" :disabled="saving">{{
            saving ? 'Salvando...' : post ? 'Salvar alterações' : 'Publicar'
          }}</AppButton>
        </ModalActions>
      </form>
    </section>
  </AppModal>
</template>

<style scoped>
h2 {
  font-size: 1.4rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}
fieldset {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.75rem;
}
input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #c5ceda;
  border-radius: 8px;
  font: inherit;
}
textarea {
  resize: vertical;
}
label {
  margin-top: 0.5rem;
  line-height: 1.5;
}
.hint {
  font-size: 0.85rem;
  color: #596575;
  line-height: 1.5;
}
.preview {
  max-height: 240px;
  object-fit: contain;
}
[role='alert'] {
  color: #a11a20;
  line-height: 1.5;
  margin-top: 1rem;
}
</style>
