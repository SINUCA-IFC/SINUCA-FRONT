import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import MessageService from '@/services/messageService'
import { useUserStore } from '@/stores/userStore'

const service = new MessageService()

export const useChatStore = defineStore('chat', () => {
  const auth = useUserStore()
  const conversations = ref([])
  const loading = ref(false)
  const error = ref('')
  let generation = 0
  let pending = null
  const canChat = computed(
    () =>
      auth.loggedIn &&
      (auth.user.role === 'organizer' || (auth.user.role === 'student' && !!auth.user.country?.id)),
  )
  const unreadCount = computed(() =>
    auth.user.role === 'organizer'
      ? conversations.value.filter((country) => country.unread_count > 0).length
      : conversations.value.find((country) => country.id === auth.user.country?.id)?.unread_count ||
        0,
  )

  function reset() {
    generation++
    conversations.value = []
    loading.value = false
    error.value = ''
    pending = null
  }

  function refresh({ force = false } = {}) {
    if (!canChat.value) {
      reset()
      return Promise.resolve()
    }
    if (pending) return force ? pending.then(() => refresh()) : pending
    const current = generation
    loading.value = true
    error.value = ''
    pending = service
      .getConversations()
      .then((rows) => {
        if (current === generation) conversations.value = rows
      })
      .catch(() => {
        if (current === generation) error.value = 'Não foi possível carregar as conversas.'
      })
      .finally(() => {
        if (current === generation) {
          loading.value = false
          pending = null
        }
      })
    return pending
  }

  watch(() => [auth.loggedIn, auth.user.id, auth.user.role, auth.user.country?.id], reset, {
    flush: 'sync',
  })
  return { conversations, loading, error, canChat, unreadCount, refresh, reset }
})
