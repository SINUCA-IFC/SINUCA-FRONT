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
  const url = payload.data?.url
  if (
    typeof url === 'string' &&
    /^(\/mural|\/chat(?:\/[1-9]\d*)?|\/delegacao(?:\?task=[1-9]\d*)?)$/.test(url)
  )
    return url
  if (payload.event === 'post_created') return '/mural'
  if (payload.event === 'task_assigned' || payload.event === 'task_overdue') {
    const taskId = Number(payload.data?.task_id)
    return Number.isSafeInteger(taskId) && taskId > 0 ? `/delegacao?task=${taskId}` : '/delegacao'
  }
  if (payload.event === 'message_created') return '/chat'
  return '/'
}

export function shouldShowPushPrompt({ loggedIn, supported, permission, dismissed }) {
  return loggedIn && supported && permission === 'default' && !dismissed
}

export async function refreshPushResource(payload, { refreshPosts, refreshTasks, refreshChat }) {
  try {
    if (payload.event === 'post_created') await refreshPosts?.()
    if (payload.event === 'task_assigned' || payload.event === 'task_overdue')
      await refreshTasks?.()
    if (payload.event === 'message_created') await refreshChat?.()
  } catch {
    // A conexão pode estar indisponível; o clique ainda deve abrir o destino.
  }
}

export async function handlePushNotificationClick(message, actions) {
  if (message?.type !== 'PUSH_NOTIFICATION_CLICKED') return false
  const payload = message.payload || {}
  await refreshPushResource(payload, actions)
  await actions.navigate(getPushTarget(payload))
  return true
}
