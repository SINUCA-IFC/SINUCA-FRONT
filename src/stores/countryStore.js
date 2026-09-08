import { ref } from "vue";
import { defineStore } from "pinia";
import CountryService from "@/services/countryService";

const countryService = new CountryService();

export const useCountryStore = defineStore('country', () => {
    const countrys = ref([]);
    const country = ref();

        //     {
        //     "id": 1,
        //     "name": "Brasil",
        //     "political_name": "República Federativa do Brasil",
        //     "flag": {
        //         "url": "",
        //         "description": "Bandeira do Brasil",
        //         "uploaded_on": "2026-06-09T12:23:10.372821-03:00"
        //     }
        // },

    async function getCountrys() {
        const data = await countryService.getAllCountrys();
        countrys.value = data.results;
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