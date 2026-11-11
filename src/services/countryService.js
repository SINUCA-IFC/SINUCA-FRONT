import axios from 'axios'

export default class CountryService{
    async getAllCountrys(page = 1){
        const {data} = await axios.get('/paises/', { params: { page } });
        return data;
    }
    async getCountry(id){
        const {data} = await axios.get(`/paises/${id}`)
        return data
    }
}
