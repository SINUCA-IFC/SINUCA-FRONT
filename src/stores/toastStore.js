import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toasts', () => {
  const messages = ref([])
  let nextId = 0
  function dismiss(id) {
    messages.value = messages.value.filter((item) => item.id !== id)
  }
  function show(message, type = 'success') {
    const duplicate = messages.value.find((item) => item.message === message)
    if (duplicate) return duplicate.id
    const id = ++nextId
    messages.value = [...messages.value.slice(-3), { id, message, type }]
    return id
  }
  return { messages, show, dismiss }
})
