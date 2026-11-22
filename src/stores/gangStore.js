import { ref } from 'vue';
import {defineStore} from 'pinia';

import GangService from '@/services/gangService'
import { getAllPages } from '@/services/pagination'

const gangService = new GangService()

export const useGangStore = defineStore('gang', () => {
    const gangs = ref([]);

    async function getGangs() {
        gangs.value = await getAllPages(page => gangService.getGangs(page));
    }

    async function getGang(id) {
        return await gangService.getGang(id);
    }

    return {
        gangs,
        getGangs,
        getGang
    }
});
