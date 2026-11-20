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

  async verifyToken(token) {
    const { data } = await axios.post('/token/verify/', { token }, { skipAuth: true })
    return data
  }

  async register(email, name, password, gang, matriculation, foto) {
    const payload = { email, name, password }
    for (const [field, value] of Object.entries({ gang, foto })) {
      if (Number.isInteger(Number(value)) && Number(value) > 0) payload[field] = Number(value)
    }
    if (matriculation) payload.matriculation = matriculation
    const response = await axios.post('/registro/', payload, { skipAuth: true })
    return response.data
  }

  async getUser() {
    const response = await axios.get('/usuarios/me/')
    return response.data
  }

  async getUsers(page = 1) {
    const { data } = await axios.get('/usuarios/', { params: { page } })
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
