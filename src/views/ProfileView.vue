<script setup>
import BackButton from '@/components/layout/BackButton.vue'
import { computed, onMounted, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import BannerComponent from '@/components/layout/BannerComponent.vue'
import ProfileActivities from '@/components/profile/ProfileActivities.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import ProfileName from '@/components/profile/ProfileName.vue'
import EditProfileModal from '@/components/profile/EditProfileModal.vue'
import { useUserStore } from '@/stores/userStore'
import { useDelegationTabs } from '@/composables/useDelegationTabs'
import { useToastStore } from '@/stores/toastStore'
import { useChatStore } from '@/stores/chatStore'
const userStore = useUserStore()
const chatStore = useChatStore()
const isOrganizer = computed(() => userStore.user.role === 'organizer')
onMounted(() => {
  if (isOrganizer.value) chatStore.refresh()
})
const { setTab } = useDelegationTabs()
const editing = ref(false)
const success = ref('')
const role = computed(
  () =>
    ({ student: 'Aluno', evaluator: 'Avaliador', organizer: 'Organizador' })[userStore.user.role] ||
    'Participante',
)

function startEditing() {
  success.value = ''
  editing.value = true
}
function profileSaved() {
  editing.value = false
  success.value = 'Perfil atualizado com sucesso!'
  useToastStore().show(success.value)
}
</script>
<template>
  <AppLayout title="Meu perfil" show-corner-ods>
    <main class="profile-page">
      <header class="page-heading">
        <BackButton
          :to="isOrganizer ? '/organizador' : '/delegacao'"
          :label="isOrganizer ? 'Voltar ao painel' : 'Voltar ao Kanban'"
          @click="!isOrganizer && setTab(0)"
        />
        <BannerComponent
          class="profile-banner"
          :title="userStore.user.name || 'Usuário SINUCA'"
          :subtitle="userStore.user.email"
        >
          <template #avatar>
            <UserAvatar
              class="profile-avatar"
              :src="userStore.user.foto?.url"
              alt="Foto de perfil"
            />
          </template>
          <template #title>
            <ProfileName :name="userStore.user.name || 'Usuário SINUCA'" />
          </template>
          <template #title-action>
            <button
              type="button"
              class="edit-profile"
              aria-label="Editar perfil"
              title="Editar perfil"
              @click="startEditing"
            >
              <span class="mdi mdi-pencil-outline" aria-hidden="true"></span>
            </button>
          </template>
        </BannerComponent>
      </header>
      <div class="profile-toolbar">
        <div class="profile-meta">
          <span class="role-badge">{{ role }}</span>
          <span v-if="!isOrganizer"
            ><span class="mdi mdi-earth" aria-hidden="true"></span>
            {{ userStore.user.country?.name || 'Delegação ainda não vinculada' }}</span
          >
        </div>
      </div>
      <p v-if="success" class="success" role="status">{{ success }}</p>
      <section v-if="isOrganizer" class="delegation-notice" aria-labelledby="profile-chat-title">
        <span class="notice-icon mdi mdi-forum-outline" aria-hidden="true"></span>
        <div>
          <h2 id="profile-chat-title">Suas conversas</h2>
          <p v-if="chatStore.error" role="alert">{{ chatStore.error }}</p>
          <p v-else-if="chatStore.loading" role="status">
            Atualizando notificações de conversas...
          </p>
          <p v-else-if="chatStore.unreadCount" role="status">
            Você tem {{ chatStore.unreadCount }}
            {{
              chatStore.unreadCount === 1
                ? 'conversa com mensagens não lidas.'
                : 'conversas com mensagens não lidas.'
            }}
          </p>
          <p v-else role="status">Sem notificações de conversas. Suas mensagens estão em dia.</p>
          <RouterLink to="/chat" class="notice-link">Abrir chat</RouterLink>
        </div>
      </section>
      <ProfileActivities v-else-if="userStore.user.country?.id" />
      <section v-else class="delegation-notice" aria-labelledby="delegation-notice-title">
        <span class="notice-icon mdi mdi-earth" aria-hidden="true"></span>
        <div>
          <h2 id="delegation-notice-title">Você ainda está sem delegação</h2>
          <p>
            Assim que a organização vincular seu perfil a uma delegação, você poderá acompanhar por
            aqui as tarefas atribuídas a você.
          </p>
          <RouterLink to="/delegacao" class="notice-link">
            Consultar situação da delegação
            <span class="mdi mdi-arrow-right" aria-hidden="true"></span>
          </RouterLink>
        </div>
      </section>
      <EditProfileModal v-if="editing" @close="editing = false" @saved="profileSaved" />
    </main>
  </AppLayout>
</template>
<style scoped>
@media (max-width: 1023px) {
  .page-heading {
    flex-direction: column;
    align-items: stretch;
  }
  .page-heading > .app-back {
    align-self: flex-start;
    margin-top: 0;
  }
  .page-heading > .banner {
    width: 100%;
    flex: auto;
  }
}
.page-heading {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}
.page-heading .profile-banner {
  flex: 1;
  min-width: 0;
}
@media (max-width: 479px) {
  .page-heading {
    align-items: flex-start;
    gap: 0.5rem;
  }
  .page-heading > .app-back {
    align-self: flex-start;
    margin-top: 1rem;
  }
  .profile-banner :deep(.title-row) {
    flex-wrap: wrap;
  }
}
.profile-banner {
  --profile-photo-size: clamp(64px, 10vw, 100px);
}

.profile-banner .profile-avatar {
  width: var(--profile-photo-size);
  height: var(--profile-photo-size);
}

.profile-banner :deep(.info-banner) {
  flex: 1;
}

.profile-banner :deep(.ods-shape) {
  display: none;
}

.profile-banner :deep(.subtitle) {
  font-size: clamp(0.85rem, 1.3vw, 1.1rem);
}

.edit-profile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #01295f;
  font-size: 1.4rem;
  cursor: pointer;
}

.edit-profile:hover {
  background: #e9eef6;
}

.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  line-height: 1.5;
}
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid #93b6e3;
  outline-offset: 3px;
}
.profile-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  color: #687487;
  font-size: 0.85rem;
}
.role-badge {
  font-weight: 500;
  color: #01295f;
}
.profile-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.delegation-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: safe center;
  min-height: min(40dvh, 22rem);
  text-align: center;
  gap: 1rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid #d6e2ef;
  border-radius: 1rem;
  background: linear-gradient(115deg, #edf4fb, #fff 75%);
  color: #01295f;
}

.notice-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #01295f;
  color: white;
  font-size: 1.5rem;
}

.delegation-notice h2 {
  margin: 0;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  font-weight: 600;
}

.delegation-notice p {
  max-width: 58ch;
  margin: 0.5rem 0 1rem;
  color: #43566c;
}

.notice-link {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  color: #154b78;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.success {
  margin-right: auto;
  color: #37672c;
  font-size: 0.85rem;
}
@media (min-width: 1024px) {
  .profile-page {
    padding: 0;
    max-width: 1080px;
    margin: auto;
  }
}
</style>
