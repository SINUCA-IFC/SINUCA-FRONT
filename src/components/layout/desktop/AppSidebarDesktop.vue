<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogoSinuca from '/logo-sinuca.svg'
import { useUserStore } from '../../../stores/userStore'
import { useDelegationTabs } from '../../../composables/useDelegationTabs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { tabs, activeTab, setTab } = useDelegationTabs()


const historyLinks = [
  { name: 'Sobre nós', path: '/historia' },
  //{ name: 'Origem', path: '/historia/origem' },
  //{ name: 'Edições Anteriores', path: '/historia/edicoes-anteriores' },
]

const mainLinks = [
  //{ name: 'Como Funciona', icon: 'mdi mdi-help-circle', path: '/como-funciona' },
  { name: 'Chat', icon: 'mdi mdi-chat', path: '/chat' },
  { name: 'Mural', icon: 'mdi mdi-bulletin-board', path: '/mural' },
  { name: 'Cronograma geral', icon: 'mdi mdi-calendar-month-outline', path: '/cronograma' },
]

/* ------------------------------------------------------------------ */

const isDelegation = computed(() => route.path.startsWith('/delegacao'))

// Perfil > Kanban / Cronograma / Documentos / Notas
const isTabActive = (tab) => isDelegation.value && activeTab.value === tab.id

function openTab(tab) {
  setTab(tab.id)
  // Se estiver com um modal aberto (/delegacao/nova-tarefa etc.) ou em outra
  // página, volta para a delegação.
  if (route.path !== '/delegacao') router.push('/delegacao')
}

const isActivePath = (path) => route.path === path

function logout() {
  // TODO: troque pela sua ação real de logout.
  if (typeof userStore.logout === 'function') userStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <RouterLink to="/delegacao" class="logo-link" aria-label="Início">
      <img :src="LogoSinuca" alt="SINUCA" class="logo" />
    </RouterLink>

    <hr class="divider" />

    <!-- PERFIL -->
    <nav aria-label="Perfil">
      <p class="group-title">
        <span class="mdi mdi-account-circle"></span>
        Perfil
      </p>
      <ul class="sub-list">
        <li v-for="tab in tabs" :key="tab.id">
          <button
            type="button"
            class="sub-item"
            :class="{ active: isTabActive(tab) }"
            @click="openTab(tab)"
          >
            <span :class="tab.icon"></span>
            {{ tab.name }}
          </button>
        </li>
      </ul>
    </nav>

    <hr class="divider" />

    <!-- HISTÓRIA -->
    <nav aria-label="História">
      <p class="group-title">
        <span class="mdi mdi-book-open-page-variant"></span>
        História
      </p>
      <ul class="sub-list sub-list--plain">
        <li v-for="link in historyLinks" :key="link.path">
          <RouterLink
            :to="link.path"
            class="sub-item"
            :class="{ active: isActivePath(link.path) }"
          >
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <hr class="divider" />

    <!-- LINKS PRINCIPAIS -->
    <nav aria-label="Principal">
      <ul class="main-list">
        <li v-for="link in mainLinks" :key="link.path">
          <RouterLink
            :to="link.path"
            class="main-item"
            :class="{ active: isActivePath(link.path) }"
          >
            <span :class="link.icon"></span>
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </nav>

    <button type="button" class="logout" @click="logout">
      <span class="mdi mdi-logout"></span>
      Sair
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  width: var(--sidebar-width, 277px);
  display: flex;
  flex-direction: column;
  padding: 2.2rem 2.2rem 2rem;
  background-color: #01295f;
  color: #fff;
  overflow-y: auto;
}

.logo-link {
  display: block;
  align-self: center;
}

.logo {
  display: block;
  height: 4.8rem;
  width: auto;
}

.divider {
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.35);
  margin: 1.8rem 0;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  font-weight: 700;
}


.group-title .mdi {
  font-size: 1.3rem;
}

/* ---------- sub-itens (Kanban, Cronograma, Sobre nós...) ---------- */
.sub-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: max-content;
  min-width: 7rem;
  margin: 1.2rem 0 0 1.2rem;
}

.sub-list--plain {
  margin-left: 1.2rem;
}

.sub-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0 0 0.25rem;
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, opacity 0.2s;
}

.sub-item:hover {
  opacity: 0.8;
}

.sub-item.active {
  border-bottom-color: #fff;
}

/* ---------- Chat / Mural / Como Funciona ---------- */
.main-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: max-content;
  padding-bottom: 0.2rem;
  border-bottom: 2px solid transparent;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  transition: opacity 0.2s;
}

.main-item .mdi {
  font-size: 1.3rem;
}

.main-item:hover {
  opacity: 0.8;
}

.main-item.active {
  border-bottom-color: #fff;
}

/* ---------- Sair ---------- */
.logout {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: auto;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;
  font: inherit;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
}

.logout .mdi {
  font-size: 1.3rem;
}

.logout:hover {
  opacity: 0.8;
}

.sidebar a:focus-visible,
.sidebar button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
  border-radius: 4px;
}
</style>
