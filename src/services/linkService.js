import axios from 'axios';

export default class LinkService {
    async getLinks(page = 1) {
        const { data } = await axios.get('/docs/', { params: { page } });
        return data;
    }
    async getLink(id) {
        const { data } = await axios.get(`/docs/${id}/`);
        return data;
    }
    async createLink(link) {
        const { data } = await axios.post('/docs/', link);
        return data;
    }
    async updateLink(id, link) {
        const { data } = await axios.patch(`/docs/${id}/`, link);
        return data;
    }
    async deleteLink(id) {
        await axios.delete(`/docs/${id}/`);
    }
}
