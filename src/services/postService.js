import axios from "axios";

export default class PostService {
    async getPosts(page = 1) {
        const { data } = await axios.get('/postagens/', { params: { page } });
        return data;
    }
    async getPost(id) {
        const { data } = await axios.get(`/postagens/${id}/`);
        return data;
    }
    async createPost(post) {
        const { data } = await axios.post('/postagens/', post);
        return data;
    }
    async updatePost(id, post) {
        const { data } = await axios.patch(`/postagens/${id}/`, post);
        return data;
    }
    async deletePost(id) {
        await axios.delete(`/postagens/${id}/`);
    }
}
