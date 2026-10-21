import { defineStore } from 'pinia';
import { ref } from 'vue';

import MessageService from '../services/messageService'
import { useUserStore } from './userStore'

const messageService = new MessageService()

export const useMessageStore = defineStore('message', () => {
    const userStore = useUserStore();

    const messages = ref([]);
    const loading = ref(false);
    const sending = ref(false);

    /*
        message: {
            country: 0,
            text: ""
        }
    */

    // country: id do país (só o organizador precisa informar)
    async function getMessages(country = null, { silent = false } = {}) {
        if (!silent) loading.value = true;
        try {
            const params = userStore.isOrganizer && country ? { country } : {};
            const data = await messageService.getMessages(params);
            // a API devolve da mais nova para a mais antiga; invertemos para exibir
            messages.value = [...data.results].reverse();
        } finally {
            if (!silent) loading.value = false;
        }
    }

    async function sendMessage(text, country = null) {
        sending.value = true;
        try {
            const payload = { text };
            if (userStore.isOrganizer) payload.country = country;
            const created = await messageService.createMessage(payload);
            messages.value.push(created);
            return created;
        } finally {
            sending.value = false;
        }
    }

    function clearMessages() {
        messages.value = [];
    }

    return {
        messages,
        loading,
        sending,
        getMessages,
        sendMessage,
        clearMessages
    }
})