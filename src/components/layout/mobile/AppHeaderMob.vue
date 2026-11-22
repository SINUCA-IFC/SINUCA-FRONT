<script setup>
import BackButton from '@/components/layout/BackButton.vue'
import LogoSinuca from '/logo-sinuca.svg'
import UserAvatar from '../UserAvatar.vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/userStore'
import { ref } from 'vue'

const userStore = useUserStore()
const router = useRouter()
const loggingOut = ref(false)

async function logout() {
  if (loggingOut.value) return
  loggingOut.value = true
  try {
    await userStore.logout()
    await router.push('/login')
  } finally {
    loggingOut.value = false
  }
}

defineProps({
  title: {
    type: String,
    default: 'SINUCA',
  },
  goBack: Boolean,
})
</script>

<template>
  <header class="header-class">
    <div class="title">
      <BackButton v-if="goBack" @click="router.back()" />
      <h3>{{ title }}</h3>
    </div>

    <div class="account-actions">
      <template v-if="userStore.loggedIn">
        <RouterLink to="/perfil" class="profile-link" aria-label="Abrir meu perfil">
          <UserAvatar
            :src="userStore.user.foto?.url"
            :alt="userStore.user.name || 'Foto de perfil'"
          />
        </RouterLink>
        <button
          type="button"
          class="logout-button"
          aria-label="Sair"
          :disabled="loggingOut"
          @click="logout"
        >
          <span class="mdi mdi-logout" aria-hidden="true"></span>
        </button>
      </template>
      <RouterLink v-else to="/login" class="login-link">Entrar</RouterLink>
    </div>
    <img :src="LogoSinuca" alt="logo" width="auto" height="45px" />
  </header>
</template>

<style scoped>
.header-class {
  gap: 1rem;
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  background-color: #01295f;
  align-items: center;
  padding: 1rem 1.5rem;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.title {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 1em;
}

.title h3 {
  font-size: clamp(1.1rem, 5vw, 1.5rem);
  line-height: 1.3;
}
.profile-link {
  display: flex;
  flex-shrink: 0;
  padding: 0.25rem;
  border-radius: 50%;
}
.account-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0.25rem;
  margin-left: auto;
}
.logout-button,
.login-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: white;
  font: inherit;
  cursor: pointer;
}
.logout-button {
  font-size: 1.5rem;
}
.login-link {
  padding-inline: 0.5rem;
  text-decoration: none;
}
.logout-button:hover,
.login-link:hover {
  background: rgb(255 255 255 / 12%);
}
.header-class :is(a, button):focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
@media (max-width: 420px) {
  .header-class {
    gap: 0.5rem;
    padding-inline: 0.75rem;
  }
  .title {
    gap: 0.5rem;
  }
  .title h3 {
    overflow-wrap: anywhere;
  }
  .header-class > img {
    width: 36px;
    height: 36px;
  }
}
.header-class > img {
  flex: 0 0 auto;
  width: 45px;
  height: 45px;
  object-fit: contain;
}
</style>
