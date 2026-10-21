import './assets/css/base.css'
import '@mdi/font/css/materialdesignicons.css'
import { registerSW } from 'virtual:pwa-register'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './plugins/axios'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update()
      }, 60 * 1000)
    }
  },
})