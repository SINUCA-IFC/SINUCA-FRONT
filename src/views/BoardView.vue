<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import AppModal from '@/components/layout/AppModal.vue'
import PostEditorModal from '@/components/posts/PostEditorModal.vue'
import AppButton from '@/components/forms/AppButton.vue'
import { usePostStore } from '@/stores/postStore'
import AppLayout from '@/components/layout/AppLayout.vue'
import BannerComponent from '@/components/layout/BannerComponent.vue'
import CardPostComponent from '@/components/posts/CardPostComponent.vue'

const postStore = usePostStore()
const user = useUserStore()
const toast = useToastStore()
const isOrganizer = computed(() => user.loggedIn && user.user.role === 'organizer')
const editorOpen = ref(false)
const editingPost = ref(null)
const deletingPost = ref(null)
const deleting = ref(false)
const deleteError = ref('')

function editPost(post = null) {
  if (!isOrganizer.value) return
  editingPost.value = post
  editorOpen.value = true
}
function saved() {
  editorOpen.value = false
  toast.show(editingPost.value ? 'Postagem atualizada.' : 'Postagem publicada.')
}
function confirmDelete(post) {
  deleteError.value = ''
  deletingPost.value = post
}
async function deletePost() {
  if (deleting.value || !isOrganizer.value || !deletingPost.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await postStore.deletePost(deletingPost.value.id)
    deletingPost.value = null
    toast.show('Postagem excluída.')
  } catch {
    deleteError.value = 'Não foi possível excluir a postagem. Tente novamente.'
  } finally {
    deleting.value = false
  }
}
const error = ref('')
const loading = ref(false)

const formatDate = (data) => {
  if (!data) return ''
  const date = new Date(data)

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    day: '2-digit',
  }).format(date)
}

async function loadPosts() {
  error.value = ''
  loading.value = true
  try {
    await postStore.getPosts()
  } catch {
    error.value = 'Não foi possível carregar o mural. Tente novamente.'
  } finally {
    loading.value = false
  }
}
onMounted(loadPosts)
</script>

<template>
  <AppLayout title="Mural" show-corner-ods>
    <main>
      <BannerComponent
        title="Mural"
        subtitle="Notícias Atualizadas sobre o SINUCA"
        icon="mdi mdi-bulletin-board"
      />

      <AppButton v-if="isOrganizer" class="new-post" @click="editPost()">Nova postagem</AppButton>
      <section class="post-list">
        <p v-if="loading" role="status">Carregando mural...</p>
        <div v-else-if="error">
          <p role="alert">{{ error }}</p>
          <AppButton @click="loadPosts">Tentar novamente</AppButton>
        </div>
        <p v-else-if="!postStore.posts.length">Nenhuma notícia publicada por enquanto.</p>
        <CardPostComponent
          v-for="post in postStore.posts"
          :key="post.id"
          :title="post.title"
          :date="formatDate(post.created_at)"
          :description="post.content"
          :image-url="post.foto?.url"
          :can-manage="isOrganizer"
          @edit="editPost(post)"
          @delete="confirmDelete(post)"
        />
      </section>
      <PostEditorModal
        v-if="editorOpen && isOrganizer"
        :post="editingPost"
        @close="editorOpen = false"
        @saved="saved"
      />
      <AppModal
        v-if="deletingPost && isOrganizer"
        centered
        @close="!deleting && (deletingPost = null)"
      >
        <section
          class="modal-panel delete-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-post-title"
        >
          <h2 id="delete-post-title">Excluir postagem?</h2>
          <p>
            A postagem “{{ deletingPost.title }}” será excluída. Esta ação não pode ser desfeita.
          </p>
          <p v-if="deleteError" role="alert">{{ deleteError }}</p>
          <footer>
            <AppButton variant="secondary" :disabled="deleting" @click="deletingPost = null"
              >Cancelar</AppButton
            >
            <AppButton variant="danger" :disabled="deleting" @click="deletePost">{{
              deleting ? 'Excluindo...' : 'Excluir postagem'
            }}</AppButton>
          </footer>
        </section>
      </AppModal>
    </main>
  </AppLayout>
</template>

<style scoped>
.new-post {
  align-self: flex-start;
  margin: 0;
}
.delete-panel {
  line-height: 1.6;
}
.delete-panel h2 {
  font-size: 1.4rem;
  margin-bottom: 1rem;
}
.delete-panel footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}
.delete-panel [role='alert'] {
  color: #a11a20;
}
main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

@media (min-width: 1024px) {
  main {
    width: 100%;
    max-width: 58rem;
    margin-inline: auto;
    padding: 0;
    gap: 2.5rem;
  }

  .post-list {
    width: 100%;
    margin: 2rem 0 0;
    gap: 1.5rem;
  }
}
</style>
