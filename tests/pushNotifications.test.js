import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import axios from 'axios'
import { createPinia, setActivePinia } from 'pinia'

let pushService
let pushPayload
try {
  pushService = await import('../src/services/pushNotificationService.js')
} catch {
  pushService = null
}
try {
  pushPayload = await import('../src/services/pushNotificationPayload.js')
} catch {
  pushPayload = null
}

test('push notification service exposes the browser subscription contract', () => {
  assert.equal(typeof pushService?.urlBase64ToUint8Array, 'function')
  assert.equal(typeof pushService?.subscribeToPush, 'function')
  assert.equal(typeof pushService?.unsubscribeFromPush, 'function')
  assert.equal(typeof pushService?.syncPushSubscription, 'function')
  assert.equal(typeof pushService?.requestPushPermission, 'function')
})

test('push payload service exposes presentation and navigation helpers', () => {
  assert.equal(typeof pushPayload?.getPushPresentation, 'function')
  assert.equal(typeof pushPayload?.getPushTarget, 'function')
  assert.equal(typeof pushPayload?.shouldShowPushPrompt, 'function')
  assert.equal(typeof pushPayload?.handlePushNotificationClick, 'function')
})

test('post push payload becomes a mural notification', () => {
  const payload = {
    event: 'post_created',
    title: 'Nova postagem no mural',
    body: 'Mudança de horário',
    data: { post_id: 12, url: '/mural' },
  }

  assert.deepEqual(pushPayload.getPushPresentation(payload), {
    title: 'Nova postagem no mural',
    options: {
      body: 'Mudança de horário',
      icon: '/logo-sinuca.svg',
      badge: '/logo-sinuca.svg',
      data: payload,
    },
  })
  assert.equal(pushPayload.getPushTarget(payload), '/mural')
})

test('permission prompt appears only for an authenticated undecided supported browser', () => {
  assert.equal(pushPayload.shouldShowPushPrompt({
    loggedIn: true,
    supported: true,
    permission: 'default',
    dismissed: false,
  }), true)
  for (const hiddenState of [
    { loggedIn: false, supported: true, permission: 'default', dismissed: false },
    { loggedIn: true, supported: false, permission: 'default', dismissed: false },
    { loggedIn: true, supported: true, permission: 'granted', dismissed: false },
    { loggedIn: true, supported: true, permission: 'default', dismissed: true },
  ]) {
    assert.equal(pushPayload.shouldShowPushPrompt(hiddenState), false)
  }
})

test('post notification click refreshes posts and navigates to mural', async () => {
  const actions = []
  await pushPayload.handlePushNotificationClick(
    {
      type: 'PUSH_NOTIFICATION_CLICKED',
      payload: { event: 'post_created', data: { post_id: 12, url: '/mural' } },
    },
    {
      refreshPosts: async () => { actions.push('refresh') },
      navigate: async target => { actions.push(`navigate:${target}`) },
    },
  )

  assert.deepEqual(actions, ['refresh', 'navigate:/mural'])
})

const originalAdapter = axios.defaults.adapter
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
const originalNotification = Object.getOwnPropertyDescriptor(globalThis, 'Notification')
const originalPushManager = Object.getOwnPropertyDescriptor(globalThis, 'PushManager')
const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

function defineGlobal(name, value) {
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
}

function createLocalStorage() {
  const values = new Map()
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  }
}

function respond(config, data, status = 200) {
  return { config, data, status, statusText: 'OK', headers: {} }
}

function installPushBrowser({ permission = 'granted', endpoint = 'https://push.example.test/browser' } = {}) {
  let currentSubscription = null
  let subscribeOptions = null
  let unsubscribeCalls = 0
  const subscription = {
    endpoint,
    toJSON: () => ({
      endpoint,
      expirationTime: null,
      keys: { p256dh: 'browser-public-key', auth: 'browser-auth-secret' },
    }),
    unsubscribe: async () => {
      unsubscribeCalls += 1
      currentSubscription = null
      return true
    },
  }
  const pushManager = {
    getSubscription: async () => currentSubscription,
    subscribe: async options => {
      subscribeOptions = options
      currentSubscription = subscription
      return subscription
    },
  }
  defineGlobal('navigator', { serviceWorker: { ready: Promise.resolve({ pushManager }) } })
  defineGlobal('PushManager', class PushManager {})
  defineGlobal('Notification', {
    permission,
    requestPermission: async () => permission,
  })
  return {
    subscription,
    setCurrentSubscription: value => { currentSubscription = value },
    getSubscribeOptions: () => subscribeOptions,
    getUnsubscribeCalls: () => unsubscribeCalls,
  }
}

beforeEach(() => {
  defineGlobal('localStorage', createLocalStorage())
  setActivePinia(createPinia())
  axios.defaults.adapter = originalAdapter
})

afterEach(() => {
  axios.defaults.adapter = originalAdapter
  for (const [name, descriptor] of [
    ['navigator', originalNavigator],
    ['Notification', originalNotification],
    ['PushManager', originalPushManager],
    ['localStorage', originalLocalStorage],
  ]) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    else delete globalThis[name]
  }
})

test('unsupported browser skips subscription without calling the API', async () => {
  delete globalThis.navigator
  delete globalThis.Notification
  let apiCalls = 0
  axios.defaults.adapter = async config => {
    apiCalls += 1
    return respond(config, {})
  }

  const result = await pushService.subscribeToPush()

  assert.equal(result, null)
  assert.equal(apiCalls, 0)
})

test('denied permission does not create a browser subscription', async () => {
  const browser = installPushBrowser({ permission: 'denied' })

  const granted = await pushService.requestPushPermission()
  const subscription = await pushService.syncPushSubscription()

  assert.equal(granted, false)
  assert.equal(subscription, null)
  assert.equal(browser.getSubscribeOptions(), null)
})

test('VAPID base64url conversion produces the expected bytes', () => {
  const bytes = pushService.urlBase64ToUint8Array('AQIDBA')

  assert.deepEqual([...bytes], [1, 2, 3, 4])
})

test('granted browser subscription is registered in the authenticated API', async () => {
  const browser = installPushBrowser()
  const requests = []
  axios.defaults.adapter = async config => {
    requests.push(config)
    if (config.url === '/vapid-public-key/') return respond(config, { publicKey: 'AQIDBA' })
    return respond(config, { endpoint: browser.subscription.endpoint }, 201)
  }

  const subscription = await pushService.subscribeToPush()

  assert.equal(subscription.endpoint, browser.subscription.endpoint)
  assert.equal(localStorage.getItem('push_endpoint'), browser.subscription.endpoint)
  assert.deepEqual([...browser.getSubscribeOptions().applicationServerKey], [1, 2, 3, 4])
  assert.equal(browser.getSubscribeOptions().userVisibleOnly, true)
  assert.equal(requests[1].method, 'post')
  assert.equal(requests[1].url, '/push-subscriptions/')
  assert.deepEqual(JSON.parse(requests[1].data), browser.subscription.toJSON())
})

test('unsubscribe clears browser and local state when API removal fails', async () => {
  const browser = installPushBrowser()
  browser.setCurrentSubscription(browser.subscription)
  localStorage.setItem('push_endpoint', browser.subscription.endpoint)
  axios.defaults.adapter = async () => { throw new Error('API unavailable') }

  await pushService.unsubscribeFromPush()

  assert.equal(browser.getUnsubscribeCalls(), 1)
  assert.equal(localStorage.getItem('push_endpoint'), null)
})

test('login synchronizes a previously granted browser permission', async () => {
  const browser = installPushBrowser()
  const requests = []
  axios.defaults.adapter = async config => {
    requests.push(config.url)
    if (config.url === '/token/') return respond(config, { access: 'access', refresh: 'refresh' })
    if (config.url === '/usuarios/me/') return respond(config, { id: 7, email: 'user@example.test' })
    if (config.url === '/vapid-public-key/') return respond(config, { publicKey: 'AQIDBA' })
    return respond(config, { endpoint: browser.subscription.endpoint }, 201)
  }
  const { useUserStore } = await import('../src/stores/userStore.js')
  const store = useUserStore()

  await store.login('user@example.test', 'password')

  assert.equal(store.loggedIn, true)
  assert.equal(localStorage.getItem('push_endpoint'), browser.subscription.endpoint)
  assert.deepEqual(requests, ['/token/', '/usuarios/me/', '/vapid-public-key/', '/push-subscriptions/'])
})

test('logout clears the session even when push cleanup fails', async () => {
  const browser = installPushBrowser()
  browser.setCurrentSubscription(browser.subscription)
  localStorage.setItem('access_token', 'access')
  localStorage.setItem('refresh_token', 'refresh')
  localStorage.setItem('push_endpoint', browser.subscription.endpoint)
  axios.defaults.adapter = async () => { throw new Error('API unavailable') }
  const { useUserStore } = await import('../src/stores/userStore.js')
  const store = useUserStore()
  store.loggedIn = true

  await store.logout()

  assert.equal(store.loggedIn, false)
  assert.equal(localStorage.getItem('access_token'), null)
  assert.equal(localStorage.getItem('refresh_token'), null)
  assert.equal(localStorage.getItem('push_endpoint'), null)
  assert.equal(browser.getUnsubscribeCalls(), 1)
})

test('Axios sends the current push endpoint with API requests', async () => {
  installPushBrowser()
  localStorage.setItem('push_endpoint', 'https://push.example.test/current')
  await import('../src/plugins/axios.js')
  let requestHeaders
  axios.defaults.adapter = async config => {
    requestHeaders = config.headers
    return respond(config, {})
  }

  await axios.get('/postagens/')

  assert.equal(requestHeaders['X-Push-Endpoint'], 'https://push.example.test/current')
})
