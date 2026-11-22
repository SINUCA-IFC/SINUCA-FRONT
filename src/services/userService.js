import { validateProfileEmail } from './authProfiles'
import axios from 'axios'

export default class UserService {
  async login(email, password, role) {
    validateProfileEmail(email, role)
    const response = await axios.post('/token/', { email, password, ...(role ? { role } : {}) })
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

  async register(email, name, password, gang, matriculation, foto, role) {
    validateProfileEmail(email, role)
    const payload = { email, name, password, ...(role ? { role } : {}) }
    for (const [field, value] of Object.entries({ gang, foto })) {
      if (Number.isInteger(Number(value)) && Number(value) > 0) payload[field] = Number(value)
    }
    if (matriculation) payload.matriculation = matriculation
    let body = payload
    const hasPhoto = typeof File !== 'undefined' && foto instanceof File
    if (hasPhoto) {
      body = new FormData()
      for (const [field, value] of Object.entries(payload)) body.append(field, value)
      body.set('foto', foto)
    }
    const response = await axios.post('/registro/', body, {
      skipAuth: true,
      ...(hasPhoto ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
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
