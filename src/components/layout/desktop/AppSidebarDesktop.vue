<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogoSinuca from '/logo-sinuca.svg'
import { useUserStore } from '../../../stores/userStore'
import { useDelegationTabs } from '../../../composables/useDelegationTabs'
import { organizerTabs } from '@/composables/useOrganizerTabs'
import UserAvatar from '../UserAvatar.vue'
import { useChatStore } from '@/stores/chatStore'
import UnreadBadge from '@/components/chat/UnreadBadge.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()
const { tabs: delegationTabs, activeTab, setTab } = useDelegationTabs()
const isOrganizer = computed(() => userStore.user.role === 'organizer')
const tabs = computed(() => (isOrganizer.value ? organizerTabs : delegationTabs))
const panelPath = computed(() => (isOrganizer.value ? '/organizador' : '/delegacao'))
const panelName = computed(() => (isOrganizer.value ? 'Organizador' : 'Delegação'))

const mainLinks = [
  { name: 'História', icon: 'mdi mdi-book-open-page-variant-outline', path: '/historia' },
  { name: 'Chat', icon: 'mdi mdi-chat-outline', path: '/chat' },
  { name: 'Mural', icon: 'mdi mdi-bulletin-board', path: '/mural' },
]

const isActivePath = (path) => route.path === path || route.path.startsWith(`${path}/`)
const isDelegation = computed(() => isActivePath(panelPath.value))
const profileName = computed(() => userStore.user.name || 'Meu perfil')

function openTab(tab) {
  if (isOrganizer.value) {
    router.push('/organizador')
    return
  }
  setTab(tab.id)
  if (route.path !== '/delegacao') router.push('/delegacao')
}

async function logout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <RouterLink :to="panelPath" class="logo-link" aria-label="Início">
      <img :src="LogoSinuca" alt="" class="logo" />
      <span class="sidebar-label brand-name">SINUCA</span>
    </RouterLink>

    <hr class="divider" />

    <nav aria-label="Navegação principal">
      <ul class="main-list">
        <li>
          <RouterLink :to="panelPath" class="sidebar-item delegation-link" :aria-label="panelName">
            <span
              class="item-icon mdi"
              :class="['evaluator', 'organizer'].includes(userStore.user.role) ? 'mdi-crown-outline' : 'mdi-earth'"
              aria-hidden="true"
            ></span>
            <span class="sidebar-label">{{ panelName }}</span>
          </RouterLink>
          <div class="submenu">
            <ul class="sub-list">
              <li v-for="tab in tabs" :key="tab.id">
                <button
                  type="button"
                  class="sidebar-item sub-item"
                  :class="{ active: isDelegation && (isOrganizer || activeTab === tab.id) }"
                  :aria-current="
                    isDelegation && (isOrganizer || activeTab === tab.id) ? 'true' : undefined
                  "
                  @click="openTab(tab)"
                >
                  <span :class="tab.icon" aria-hidden="true"></span>
                  {{ tab.name }}
                </button>
              </li>
            </ul>
          </div>
        </li>
        <li v-for="link in mainLinks" :key="link.path">
          <RouterLink
            :to="link.path"
            class="sidebar-item"
            :class="{ active: isActivePath(link.path) }"
            :aria-label="link.name"
          >
            <span class="item-icon">
              <span :class="link.icon" aria-hidden="true"></span>
              <UnreadBadge
                v-if="link.path === '/chat'"
                class="chat-badge"
                :count="chatStore.unreadCount"
                :label="
                  userStore.user.role === 'organizer'
                    ? 'países com mensagens não lidas'
                    : 'mensagens não lidas'
                "
              />
            </span>
            <span class="sidebar-label">{{ link.name }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <ul class="user-area">
      <li v-if="userStore.loggedIn">
        <RouterLink
          to="/perfil"
          class="sidebar-item"
          :class="{ active: isActivePath('/perfil') }"
          :aria-label="profileName"
        >
          <span class="item-icon">
            <UserAvatar :src="userStore.user.foto?.url" alt="" class="sidebar-avatar" />
          </span>
          <span class="sidebar-label user-name">{{ profileName }}</span>
        </RouterLink>
      </li>
      <li>
        <button
          v-if="userStore.loggedIn"
          type="button"
          class="sidebar-item logout"
          aria-label="Sair"
          @click="logout"
        >
          <span class="item-icon mdi mdi-logout" aria-hidden="true"></span>
          <span class="sidebar-label">Sair</span>
        </button>
        <RouterLink v-else to="/login" class="sidebar-item" aria-label="Entrar">
          <span class="item-icon mdi mdi-login" aria-hidden="true"></span>
          <span class="sidebar-label">Entrar</span>
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.sidebar {
  --sidebar-bg: #01295f;
  --sidebar-accent: #80ade6;
  --sidebar-highlight: rgb(40 99 180 / 24%);
  --sidebar-inset: 0.625rem;
  position: fixed;
  inset: var(--sidebar-inset) auto var(--sidebar-inset) var(--sidebar-inset);
  z-index: 30;
  width: var(--sidebar-compact-width);
  display: flex;
  flex-direction: column;
  padding: 2rem 0.625rem 1.25rem;
  border-radius: 0.75rem;
  background: var(--sidebar-bg);
  color: #fff;
  box-shadow: 0 4px 16px rgb(1 41 95 / 18%);
  overflow: hidden auto;
  scrollbar-width: thin;
  transition:
    width 200ms ease,
    inset 200ms ease,
    border-radius 200ms ease,
    padding 200ms ease;
}

.sidebar:is(:hover, :has(:focus-visible)) {
  inset: 0 auto 0 0;
  width: var(--sidebar-expanded-width);
  padding-inline: 1.25rem;
  border-radius: 0;
}

.logo-link,
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  min-height: 2.75rem;
  border: 0;
  border-radius: 0.5rem;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  text-decoration: none;
}

.logo-link {
  justify-content: flex-start;
  padding-left: 0.375rem;
}

.logo {
  width: 2.75rem;
  height: auto;
  flex-shrink: 0;
}

.brand-name {
  font-size: 1.45rem;
  font-weight: 700;
}

.divider {
  width: 1.75rem;
  flex-shrink: 0;
  margin: 0.75rem auto 1.5rem;
  border: 0;
  border-top: 1px solid rgb(255 255 255 / 40%);
  transition: width 200ms ease;
}

.sidebar:is(:hover, :has(:focus-visible)) .divider {
  width: 6rem;
}

.main-list,
.user-area {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-item {
  padding: 0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease;
}

.sidebar-item:not(.logout, .delegation-link):is(:hover, :focus-visible, .active) {
  background-color: var(--sidebar-highlight);
  color: var(--sidebar-accent);
}

.item-icon {
  position: relative;
  display: inline-grid;
  flex: 0 0 3.5rem;
  place-items: center;
  font-size: 1.25rem;
  line-height: 1;
}

.sidebar-label {
  line-height: 1.5;
  min-width: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: opacity 140ms ease;
}

.sidebar:is(:hover, :has(:focus-visible)) .sidebar-label {
  opacity: 1;
}

.submenu {
  display: grid;
  grid-template-rows: 0fr;
  visibility: hidden;
  transition:
    grid-template-rows 200ms ease,
    visibility 200ms;
}

.sidebar:is(:hover, :has(:focus-visible)) .submenu {
  grid-template-rows: 1fr;
  visibility: visible;
}

.sub-list {
  min-height: 0;
  overflow: hidden;
  padding-inline: 1.625rem 0;
}

.sub-item {
  min-height: 2rem;
  padding-inline: 0.625rem;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.main-list > li:first-child {
  transition: margin-bottom 200ms ease;
}

.sidebar:is(:hover, :has(:focus-visible)) .main-list > li:first-child {
  margin-bottom: 0.75rem;
}

.item-icon .chat-badge {
  position: absolute;
  top: -7px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: 2px solid var(--sidebar-bg);
  border-radius: 50%;
  background: #fd151b;
  font-size: 0.625rem;
  pointer-events: none;
}

.chat-badge :deep(img) {
  display: none;
}

.user-area {
  margin-top: auto;
  padding-top: 1.5rem;
}

.sidebar-avatar {
  width: 1.75rem;
  height: 1.75rem;
}

.user-name {
  padding-right: 0.5rem;
}

.logout {
  background: #d21e2d;
}

.logout:is(:hover, :focus-visible) {
  background: #ac1725;
  color: white;
}

.sidebar .logout:focus-visible {
  outline-color: white;
}

.sidebar :is(a, button):focus-visible {
  outline: 2px solid var(--sidebar-accent);
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .sidebar,
  .sidebar * {
    transition: none;
  }
}
</style>
