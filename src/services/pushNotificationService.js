import axios from 'axios'

export const PUSH_ENDPOINT_STORAGE_KEY = 'push_endpoint'

export function isPushSupported() {
  return typeof navigator !== 'undefined'
    && 'serviceWorker' in navigator
    && typeof PushManager !== 'undefined'
    && typeof Notification !== 'undefined'
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(character => character.charCodeAt(0)))
}

export async function subscribeToPush() {
  if (!isPushSupported() || Notification.permission !== 'granted') return null

  const registration = await navigator.serviceWorker.ready
  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    const { data } = await axios.get('/vapid-public-key/')
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    })
  }
  await axios.post('/push-subscriptions/', subscription.toJSON())
  localStorage.setItem(PUSH_ENDPOINT_STORAGE_KEY, subscription.endpoint)
  return subscription
}

export async function unsubscribeFromPush() {
  const storedEndpoint = localStorage.getItem(PUSH_ENDPOINT_STORAGE_KEY)
  if (!isPushSupported()) {
    localStorage.removeItem(PUSH_ENDPOINT_STORAGE_KEY)
    return false
  }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  const endpoint = subscription?.endpoint || storedEndpoint
  try {
    if (endpoint) await axios.delete('/push-subscriptions/', { data: { endpoint } })
  } catch (error) {
    console.warn('Could not remove the Web Push subscription from the API.', error)
  } finally {
    try {
      if (subscription) await subscription.unsubscribe()
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
  } catch (error) {
    console.warn('Could not synchronize the Web Push subscription.', error)
    return null
  }
}

export async function requestPushPermission() {
  if (!isPushSupported() || Notification.permission === 'denied') return false
  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission()
  if (permission !== 'granted') return false
  return Boolean(await syncPushSubscription())
}
