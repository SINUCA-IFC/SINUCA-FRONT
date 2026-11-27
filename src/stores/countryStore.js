import { ref } from "vue";
import { defineStore } from "pinia";
import CountryService from "@/services/countryService";
import { getAllPages } from '@/services/pagination';

const countryService = new CountryService();

export const useCountryStore = defineStore('country', () => {
    const countrys = ref([]);
    const country = ref();

    async function getCountrys() {
        countrys.value = await getAllPages(page => countryService.getAllCountrys(page));
    }

    async function getCountry(id) {
        const data = await countryService.getCountry(id);
        country.value = data
    }

    return {
        countrys,
        country,
        getCountrys,
        getCountry,
    }
});
