import axios from 'axios';

function taskPayload(task) {
    const payload = { ...task };
    for (const field of ['startDate', 'endDate']) {
        if (Object.hasOwn(payload, field)) payload[field] = payload[field] || null;
    }
    return payload;
}

export default class TaskService{
    async getTasks(page = 1){
        const {data} = await axios.get('/tarefas/', { params: { page } });
        return data;
    }
    async getTask(id) {
        const {data} = await axios.get(`/tarefas/${id}/`);
        return data;
    }
    async createTask(task) {
        const {data} = await axios.post('/tarefas/', taskPayload(task));
        return data;
    }
    async updateTask(id, task) {
        const {data} = await axios.patch(`/tarefas/${id}/`, taskPayload(task));
        return data;
    }
    async deleteTask(id) {
        await axios.delete(`/tarefas/${id}/`);
    }
}
