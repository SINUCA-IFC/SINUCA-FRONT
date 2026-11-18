<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import NotificationPrompt from '@/components/NotificationPrompt.vue'
import { useUserStore } from '@/stores/userStore'
import { useChatStore } from '@/stores/chatStore'
import { usePostStore } from '@/stores/postStore'
import { useTaskStore } from '@/stores/taskStore'
import {
  handlePushNotificationClick,
  refreshPushResource,
} from '@/services/pushNotificationPayload'

const auth = useUserStore()
const chat = useChatStore()
const posts = usePostStore()
const tasks = useTaskStore()
const router = useRouter()
let timer

const actions = {
  refreshPosts: () => posts.getPosts(),
  refreshTasks: () => (auth.loggedIn ? tasks.getTasks() : undefined),
  refreshChat: async () => {
    await chat.refresh({ force: true })
    window.dispatchEvent(new Event('sinuca:chat-message'))
  },
  navigate: (target) => router.push(target),
}

function refreshVisibleConversations() {
  if (document.visibilityState === 'visible') chat.refresh()
}

async function onWorkerMessage(event) {
  const message = event.data
  if (message?.type === 'PUSH_NOTIFICATION_CLICKED') {
    await handlePushNotificationClick(message, actions)
  } else if (message?.type === 'PUSH_RECEIVED') {
    await refreshPushResource(message.payload || {}, actions)
  }
}

watch(
  () => [auth.loggedIn, auth.user.id, auth.user.role, auth.user.country?.id],
  refreshVisibleConversations,
  { immediate: true },
)

onMounted(() => {
  timer = setInterval(refreshVisibleConversations, 10000)
  document.addEventListener('visibilitychange', refreshVisibleConversations)
  navigator.serviceWorker?.addEventListener('message', onWorkerMessage)
})
onUnmounted(() => {
  clearInterval(timer)
  document.removeEventListener('visibilitychange', refreshVisibleConversations)
  navigator.serviceWorker?.removeEventListener('message', onWorkerMessage)
})
</script>
<template>
  <RouterView />
  <NotificationPrompt />
</template>
