import axios from 'axios';

export default class GangService{
    async getGangs(page = 1){
        const {data} = await axios.get('/turmas/', { params: { page } });
        return data;
    }
}
