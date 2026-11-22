import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { getPushTarget } from '@/services/pushNotificationPayload'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/organizador/delegacoes/:id',
      component: () => import('../views/OrganizerDelegationView.vue'),
      meta: { requiresAuth: true, requiresOrganizer: true },
    },
    {
      path: '/organizador',
      name: 'Organizador',
      component: () => import('../views/OrganizerView.vue'),
      meta: { requiresAuth: true, requiresOrganizer: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('../views/BoardView.vue'),
    },
    {
      path: '/delegacao',
      name: 'Delegacao',
      component: () => import('../views/DelegationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/delegacao/nova-tarefa',
      name: 'nova-tarefa',
      component: () => import('../views/DelegationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/delegacao/tarefas/:id/editar',
      component: () => import('../views/DelegationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/delegacao/schedule/:id',
      component: () => import('../views/DelegationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/bem-vindo',
      name: 'bem-vindo',
      component: () => import('../views/WelcomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/verificar-email',
      redirect: { name: 'cadastro', query: { etapa: 'email' } },
    },
    {
      path: '/auth/vincular-google',
      redirect: { name: 'login' },
    },
    {
      path: '/auth/callback',
      redirect: (to) => ({
        name: 'login',
        query: {
          google: 'return',
          ...(Object.hasOwn(to.query, 'error') ? { error: to.query.error } : {}),
        },
      }),
    },
    {
      path: '/chat/:countryId(\\d+)?',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/historia',
      name: 'histora',
      component: () => import('../views/HistoryView.vue'),
    },
    {
      path: '/mural',
      name: 'mural',
      component: () => import('../views/BoardView.vue'),
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useUserStore()

  if (!authStore.loggedIn && !['login', 'cadastro'].includes(to.name)) {
    await authStore.checkAuth()
  }

  if (to.name === 'home') {
    if (authStore.loggedIn) {
      return { name: authStore.user.role === 'organizer' ? 'Organizador' : 'Delegacao' }
    } else {
      return { name: 'mural' }
    }
  }

  if (
    authStore.loggedIn &&
    ((to.name === 'login' && to.query.google !== 'return') || to.name === 'bem-vindo')
  ) {
    if (to.query.redirect) return getPushTarget({ data: { url: to.query.redirect } })
    return { name: 'home' }
  }

  if (to.meta.requiresAuth && !authStore.loggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresOrganizer && authStore.user.role !== 'organizer') {
    return { name: 'Delegacao' }
  }
  if (to.path === '/delegacao' && authStore.user.role === 'organizer') {
    return { name: 'Organizador' }
  }
})

export default router
