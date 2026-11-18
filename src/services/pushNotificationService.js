import axios from 'axios'

export const PUSH_ENDPOINT_STORAGE_KEY = 'push_endpoint'
let generation = 0
let registrationRequest = null

// Sem SW registrado, `ready` nunca resolve. Não prender a autenticação nesse caso.
async function withTimeout(promise, milliseconds = 5000) {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Push indisponível')), milliseconds)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

export function isPushSupported() {
  return (
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof PushManager !== 'undefined' &&
    typeof Notification !== 'undefined'
  )
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)))
}

export async function subscribeToPush() {
  if (!isPushSupported() || Notification.permission !== 'granted') return null

  const currentGeneration = generation
  const registration = await withTimeout(navigator.serviceWorker.ready)
  const { data } = await axios.get('/vapid-public-key/', { timeout: 5000 })
  if (!data.publicKey || currentGeneration !== generation) return null
  const applicationServerKey = urlBase64ToUint8Array(data.publicKey)
  let subscription = await registration.pushManager.getSubscription()
  if (currentGeneration !== generation) return null

  // Uma inscrição antiga pode existir e ainda assim ser rejeitada pelo Push Service.
  if (subscription) {
    const previousKey = new Uint8Array(subscription.options?.applicationServerKey || [])
    const sameKey =
      previousKey.length === applicationServerKey.length &&
      previousKey.every((value, index) => value === applicationServerKey[index])
    if (!sameKey) {
      await withTimeout(subscription.unsubscribe())
      if (currentGeneration !== generation) return null
      localStorage.removeItem(PUSH_ENDPOINT_STORAGE_KEY)
      subscription = null
    }
  }
  if (!subscription) {
    subscription = await withTimeout(
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      }),
    )
  }
  if (currentGeneration !== generation) return null
  const request = axios.post('/push-subscriptions/', subscription.toJSON(), { timeout: 5000 })
  registrationRequest = request
  try {
    await request
  } finally {
    if (registrationRequest === request) registrationRequest = null
  }
  if (currentGeneration !== generation) return null
  localStorage.setItem(PUSH_ENDPOINT_STORAGE_KEY, subscription.endpoint)
  return subscription
}

export async function unsubscribeFromPush() {
  generation += 1
  const storedEndpoint = localStorage.getItem(PUSH_ENDPOINT_STORAGE_KEY)
  localStorage.removeItem(PUSH_ENDPOINT_STORAGE_KEY)
  let subscription
  try {
    if (registrationRequest) await registrationRequest
  } catch {
    // A remoção deve ocorrer depois de um POST já iniciado, mesmo que ele falhe.
  }
  try {
    if (isPushSupported()) {
      const registration = await withTimeout(navigator.serviceWorker.ready)
      subscription = await registration.pushManager.getSubscription()
      const notifications = await registration.getNotifications?.()
      for (const notification of notifications || []) notification.close()
    }
  } catch {
    // O endpoint local ainda permite remover a inscrição mesmo sem SW.
  }
  try {
    const endpoint = subscription?.endpoint || storedEndpoint
    if (endpoint) await axios.delete('/push-subscriptions/', { data: { endpoint }, timeout: 5000 })
  } catch {
    // A remoção local precisa funcionar também com a API indisponível.
  } finally {
    try {
      if (subscription) await withTimeout(subscription.unsubscribe())
    } catch {
      // A saída da conta não depende do Push Service.
    } finally {
      localStorage.removeItem(PUSH_ENDPOINT_STORAGE_KEY)
    }
  }
  return true
}

export async function syncPushSubscription() {
  if (!isPushSupported() || Notification.permission !== 'granted') return null
  try {
    return await subscribeToPush()
  } catch {
    return null
  }
}

export async function requestPushPermission() {
  if (!isPushSupported() || Notification.permission === 'denied') return false
  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
  if (permission !== 'granted') return false
  return Boolean(await syncPushSubscription())
}
