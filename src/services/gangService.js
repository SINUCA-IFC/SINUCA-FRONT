import axios from 'axios';

export default class GangService{
    async getGangs(page = 1){
        const {data} = await axios.get('/turmas/', { params: { page } });
        return data;
    }
    async getGang(id){
        const {data} = await axios.get(`turmas/${id}`);
        return data;
    }
}
