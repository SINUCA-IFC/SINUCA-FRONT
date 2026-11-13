export function getPushPresentation(payload = {}) {
  return {
    title: payload.title || 'SINUCA',
    options: {
      body: payload.body || 'Há uma nova atualização.',
      icon: '/logo-sinuca.svg',
      badge: '/logo-sinuca.svg',
      data: payload,
    },
  }
}

export function getPushTarget(payload = {}) {
  if (payload.data?.url) return payload.data.url
  if (payload.event === 'post_created') return '/mural'
  return '/'
}

export function shouldShowPushPrompt({ loggedIn, supported, permission, dismissed }) {
  return loggedIn && supported && permission === 'default' && !dismissed
}

export async function handlePushNotificationClick(message, { refreshPosts, navigate }) {
  if (message?.type !== 'PUSH_NOTIFICATION_CLICKED') return false
  const payload = message.payload || {}
  if (payload.event === 'post_created') await refreshPosts()
  await navigate(getPushTarget(payload))
  return true
}
