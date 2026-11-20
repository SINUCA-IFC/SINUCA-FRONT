<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import BannerComponent from '@/components/layout/BannerComponent.vue'
import ProfileActivities from '@/components/profile/ProfileActivities.vue'
import ProfileName from '@/components/profile/ProfileName.vue'
import EditProfileModal from '@/components/profile/EditProfileModal.vue'
import { useUserStore } from '@/stores/userStore'
import { useDelegationTabs } from '@/composables/useDelegationTabs'
const userStore = useUserStore()
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
}
</script>
<template>
  <AppLayout title="Meu perfil">
    <main class="profile-page">
      <RouterLink
        to="/delegacao"
        class="back-link"
        aria-label="Voltar ao Kanban"
        @click="setTab(0)"
      >
        <span class="mdi mdi-arrow-left" aria-hidden="true"></span>
      </RouterLink>
      <BannerComponent
        class="profile-banner"
        :title="userStore.user.name || 'Usuário SINUCA'"
        :subtitle="userStore.user.email"
        :UserImageUrl="userStore.user.foto?.url"
      >
        <template #title>
          <ProfileName :name="userStore.user.name || 'Usuário SINUCA'" />
        </template>
        <template #title-action>
          <button type="button" class="edit-profile" aria-label="Editar perfil" title="Editar perfil" @click="startEditing">
            <span class="mdi mdi-pencil-outline" aria-hidden="true"></span>
          </button>
        </template>
      </BannerComponent>
      <div class="profile-toolbar">
        <div class="profile-meta">
          <span class="role-badge">{{ role }}</span>
          <span
            ><span class="mdi mdi-earth" aria-hidden="true"></span>
            {{ userStore.user.country?.name || 'Delegação ainda não vinculada' }}</span
          >
        </div>
      </div>
      <p v-if="success" class="success" role="status">{{ success }}</p>
      <ProfileActivities />
      <EditProfileModal v-if="editing" @close="editing = false" @saved="profileSaved" />
    </main>
  </AppLayout>
</template>
<style scoped>
.profile-banner {
  --profile-photo-size: clamp(64px, 10vw, 100px);
}

.profile-banner :deep(.user-image-container) {
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
.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  width: 44px;
  height: 44px;
  color: #01295f;
  font-size: 1.6rem;
  border-radius: 8px;
}
.back-link:hover {
  background: #e9eef6;
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
