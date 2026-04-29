import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
    },
    {
      path: '/delegacao/nova-tarefa',
      name: 'nova-tarefa',
      component: () => import('../views/DelegationView.vue'),
    },
    {
      path: '/p',
      name: 'playground',
      component: () => import('../views/playground.vue'),
    },
  ],
})

export default router
