import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import vm from 'node:vm'
import { getPushPresentation, getPushTarget } from '../src/services/pushNotificationPayload.js'

const source = (await readFile(new URL('../src/sw.js', import.meta.url), 'utf8')).replace(
  /^import[\s\S]*?from ['"][^'"]+['"];?$/gm,
  '',
)

function worker(clients = []) {
  const listeners = {}
  const shown = []
  const opened = []
  const self = {
    __WB_MANIFEST: [],
    location: { origin: 'https://sinuca.test' },
    addEventListener: (type, handler) => {
      listeners[type] = handler
    },
    skipWaiting() {},
    registration: {
      showNotification: async (title, options) => {
        shown.push({ title, options })
      },
    },
    clients: {
      claim: async () => {},
      matchAll: async () => clients,
      openWindow: async (path) => {
        opened.push(path)
      },
    },
  }
  vm.runInNewContext(source, {
    self,
    URL,
    getPushPresentation,
    getPushTarget,
    precacheAndRoute() {},
    cleanupOutdatedCaches() {},
    registerRoute() {},
    createHandlerBoundToURL() {},
    NavigationRoute: class {},
  })
  return {
    shown,
    opened,
    async dispatch(type, data) {
      let pending
      listeners[type]({
        ...data,
        waitUntil: (promise) => {
          pending = promise
        },
      })
      await pending
    },
  }
}

test('worker displays push and informs open tabs without fetching private API data', async () => {
  const messages = []
  const sw = worker([{ postMessage: (message) => messages.push(message) }])
  const payload = { event: 'message_created', title: 'Mensagem', data: { url: '/chat/7' } }
  await sw.dispatch('push', { data: { json: () => payload } })
  assert.equal(sw.shown[0].title, 'Mensagem')
  assert.equal(messages[0].type, 'PUSH_RECEIVED')
  assert.equal(messages[0].payload, payload)
})

test('worker clicks focus an existing window and navigate to the actual resource', async () => {
  const actions = []
  const sw = worker([
    {
      url: 'https://sinuca.test/mural',
      navigate: async (path) => {
        actions.push(path)
      },
      postMessage: (message) => {
        actions.push(message.type)
      },
      focus: async () => {
        actions.push('focus')
      },
    },
  ])
  await sw.dispatch('notificationclick', {
    notification: { data: { event: 'message_created', data: { url: '/chat/7' } }, close() {} },
  })
  assert.deepEqual(actions, ['/chat/7', 'PUSH_NOTIFICATION_CLICKED', 'focus'])
})

test('worker opens a resource when no window exists and handles invalid push JSON', async () => {
  const sw = worker()
  await sw.dispatch('notificationclick', {
    notification: { data: { event: 'task_overdue', data: { task_id: 4 } }, close() {} },
  })
  assert.deepEqual(sw.opened, ['/delegacao?task=4'])
  await sw.dispatch('push', {
    data: {
      json: () => {
        throw new Error('invalid')
      },
    },
  })
  assert.equal(sw.shown[0].title, 'SINUCA')
  await sw.dispatch('push', { data: { json: () => null } })
  assert.equal(sw.shown[1].title, 'SINUCA')
})
