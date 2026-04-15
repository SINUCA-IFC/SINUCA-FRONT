import axios from 'axios';

export default class TaskService{


    async getTasks(){
        const {data} = await axios.get('/tarefas');
        return data;
    }
    async getTask(id) {
        const {data} = await axios.get(`/tarefas/${id}`);
        return data;
    }
    async createTask(task) {
        const {data} = await axios.post('/tarefas', task);
        return data;
    }
    async updateTask(id, task) {
        const {data} = await axios.put(`/tarefas/${id}`, task);
        return data;
    }
    async deleteTask(id) {
        await axios.delete(`/tarefas/${id}`);
    }

}