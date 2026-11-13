import axios from 'axios'

export default class UserService {
  async login(email, password) {
    const response = await axios.post('/token/', { email, password })
    return response.data
  }

  async refreshToken(refresh) {
    const response = await axios.post('/token/refresh/', { refresh })
    return response.data
  }

  async register(email, name, password, gang, matriculation, foto) {
    const response = await axios.post('/registro/', {
      email,
      name,
      password,
      gang,
      matriculation,
      foto,
    })
    return response.data
  }

  async getUser() {
    const response = await axios.get('/usuarios/me/')
    return response.data
  }

  async updateProfile(id, changes) {
    const { data } = await axios.patch(`/usuarios/${id}/`, changes)
    return data
  }

  async getUsers() {
    const { data } = await axios.get('/usuarios/')
    return data
  }

  async getPendingUsers(page = 1) {
    const { data } = await axios.get('/usuarios/pendentes/', { params: { page } })
    return data
  }

  async approveUser(id, countryId) {
    const { data } = await axios.post(`/usuarios/${id}/aprovar/`, { country: countryId })
    return data
  }
}
