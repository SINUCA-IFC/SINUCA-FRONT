import axios from 'axios'
import { apiOrigin } from '@/services/authService'

function resolveFlag(country) {
  const url = country.flag?.url
  if (!url || !url.startsWith('/') || url.startsWith('//')) return country
  return { ...country, flag: { ...country.flag, url: new URL(url, apiOrigin).href } }
}

export default class CountryService {
  async createCountry(country) {
    const { data } = await axios.post('/paises/', country)
    return resolveFlag(data)
  }
  async deleteCountry(id) {
    await axios.delete(`/paises/${id}/`)
  }
  async getAllCountrys(page = 1) {
    const { data } = await axios.get('/paises/', { params: { page } })
    return { ...data, results: data.results.map(resolveFlag) }
  }
  async getCountry(id) {
    const { data } = await axios.get(`/paises/${id}`)
    return resolveFlag(data)
  }
}
