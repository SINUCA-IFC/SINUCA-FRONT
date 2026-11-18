import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { getPushPresentation, getPushTarget } from './services/pushNotificationPayload.js'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
// Apenas o shell público. Respostas da API nunca entram no cache.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), { denylist: [/^\/api\//] }),
)

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = {}
  }
  if (!payload || typeof payload !== 'object') payload = {}
  const { title, options } = getPushPresentation(payload)
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        for (const client of clients) client.postMessage({ type: 'PUSH_RECEIVED', payload })
      }),
    ]),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const payload = event.notification.data || {}
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const client = clients.find((window) => new URL(window.url).origin === self.location.origin)
      const target = getPushTarget(payload)
      if (client) {
        // Navegar também funciona com uma aba ainda sem listener ou com sessão expirada.
        await client.navigate(target)
        client.postMessage({ type: 'PUSH_NOTIFICATION_CLICKED', payload })
        await client.focus()
      } else {
        await self.clients.openWindow(target)
      }
    })(),
  )
})
