import { defineStore } from 'pinia'
import { ref } from 'vue'

import LinkService from '../services/linkService'
import { getAllPages } from '@/services/pagination'

const linkService = new LinkService()

export const useLinkStore = defineStore('link', () => {
  const links = ref([])
  const loading = ref(false)

  async function getLinks() {
    loading.value = true
    try {
      links.value = await getAllPages((page) => linkService.getLinks(page))
    } finally {
      loading.value = false
    }
  }

  async function createLink(newLink) {
    const createdLink = await linkService.createLink(newLink)
    links.value.push(createdLink)
  }

  async function deleteLink(id) {
    await linkService.deleteLink(id)
    links.value = links.value.filter((t) => String(t.id) !== String(id))
  }

  return {
    links,
    loading,
    getLinks,
    createLink,
    deleteLink,
  }
})
