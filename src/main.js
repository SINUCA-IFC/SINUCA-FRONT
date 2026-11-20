import './assets/css/base.css'
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { onAuthExpired } from './plugins/axios'
import { useUserStore } from './stores/userStore'

const app = createApp(App)

app.use(createPinia())
onAuthExpired(() => {
  useUserStore().clearLocal()
  router.push({ name: 'login' })
})
app.use(router)
useUserStore().$onAction(({ name }) => {
  if (name === 'logout') queueMicrotask(() => router.push({ name: 'login' }))
})

app.mount('#app')
