import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import { useUserStore } from '@/stores/userStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
      component: () => import('../views/WelcomeView.vue')
    },
    {
      path: "/mural",
      name: "mural", 
      component: () => import('../views/BoardView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/chat',
      name: 'chat',
    },
    {
      path: '/historia',
      name: 'histora',
    },
    {
      path: '/mural',
      name: 'mural',
      component: () => import('../views/BoardView.vue')
    },
    {
      path: '/p',
      name: 'playground',
      component: () => import('../views/playground.vue'),
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useUserStore();
  
  if(!authStore.loggedIn) {
    await authStore.checkAuth();
  };

  if(authStore.loggedIn && (to.name === "login" || to.name === "bem-vindo")) {
    return { name: "home" };
  };

  if(to.name === "login") {
    const { title, icon, color } = to.query;
    if(!title, !icon, !color) {
      return { name: 'bem-vindo' };
    }
  }

  if (to.meta.requiresAuth && !authStore.loggedIn) {
    return { name: 'bem-vindo'}
  }

});

export default router
