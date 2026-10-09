import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/mural',
    },
    {
      path: '/mural',
      name: 'mural',
      component: () => import('@/views/BoardView.vue'),
    },
    {
      path: '/cronograma',
      name: 'cronograma',
      component: () => import('@/views/GeneralScheduleView.vue'),
    },
    {
      path: '/delegacao/:rest(.*)*',
      redirect: '/em-construcao',
    },
    {
      path: '/em-construcao',
      name: 'em-construcao',
      alias: ['/login', '/cadastro', '/bem-vindo', '/chat', '/historia'],
      component: () =>
        import('@/views/UnderConstructionView.vue'),
    },
  ],
})

export default router
