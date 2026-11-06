import { defineStore } from 'pinia';
import { ref } from 'vue';

import LinkService from '../services/linkService'

const linkService = new LinkService()

export const useLinkStore = defineStore('link', () => {
    
    const links = ref([]);
    const link = ref({
        name: '',
        url: '',
        country: 0,
        categories: []
    });
    
    const loading = ref(false);

    async function getLinks() {
        loading.value = true;
        try {
            const documents = [];
            let page = 1;
            let data;
            do {
                data = await linkService.getLinks(page);
                documents.push(...data.results);
                page += 1;
            } while (page <= data.total_pages);
            links.value = documents;
        } finally {
            loading.value = false;
        }
    }

    async function getLink(id) {
        link.value = await linkService.getLink(id);
    }

    async function createLink(newLink) {
        const createdLink = await linkService.createLink(newLink);
        links.value.push(createdLink);
    }

    async function updateLink(id, updatedLink) {
        const updated = await linkService.updateLink(id, updatedLink);
        const index = links.value.findIndex(t => t.id === id);
        if (index !== -1) {
            links.value[index] = updated;
        }
    }

    async function deleteLink(id) {
        await linkService.deleteLink(id);
        links.value = links.value.filter(t => t.id !== id);
    }

    return {
        links,
        link,
        loading,
        getLinks,
        getLink,
        createLink,
        updateLink,
        deleteLink
    }
})
