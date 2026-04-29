import axios from 'axios';

export default class UserService {
  async login(email, password) {
    const response = await axios.post('/token/', { email, password });
    return response.data;
  }

  async refreshToken(refresh) {
    const response = await axios.post('/token/refresh/', { refresh });
    return response.data;
  }

  async register(email, name, password) {
    const response = await axios.post('/registro/', { email, name, password });
    return response.data;
  }

  async getUser() {
    const response = await axios.get('/usuarios/me/');
    return response.data;
  }

  async getUsers() {
    const {data} = await axios.get('/usuarios/');
    return data;
  }
}