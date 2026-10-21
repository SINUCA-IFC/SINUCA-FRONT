import axios from 'axios';

export default class MessageService {
    // parametro é a delegação (só organizadores utilizam)
    async getMessages(params = {}) {
        const { data } = await axios.get('/mensagens/', { params });
        return data;
    }
    async getMessage(id) {
        const { data } = await axios.get(`/mensagens/${id}/`);
        return data;
    }
    // a message para o organizador é: { delegation, text }
    async createMessage(message) {
        const { data } = await axios.post('/mensagens/', message);
        return data;
    }
}