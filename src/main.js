import './assets/css/base.css'
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { onAuthExpired } from './plugins/axios'
import { useUserStore } from './stores/userStore'

// Remove registrations left by earlier development builds of the PWA.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) =>
      Promise.all(registrations.map((registration) => registration.unregister())),
    )
    .catch((error) =>
      console.warn('Não foi possível remover o service worker de desenvolvimento.', error),
    )
}

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
