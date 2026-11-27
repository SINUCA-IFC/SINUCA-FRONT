import axios from "axios";

export default class CategoryService{
    async getAllCategorys(page = 1) {
        const { data } = await axios.get('/categorias/', { params: { page } })
        return data;
    }
}
