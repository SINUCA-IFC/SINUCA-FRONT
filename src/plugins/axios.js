import axios from 'axios'
import { apiOrigin } from '@/services/authService'

axios.defaults.baseURL = import.meta.env?.DEV ? '/api' : apiOrigin + '/api'
axios.defaults.timeout = 15000
let refreshPromise
let onExpired = () => {}
export function onAuthExpired(handler) {
  onExpired = handler
}
const isPublic = (config) =>
  config.skipAuth || /(?:^|\/)(token|registro|auth)(?:\/|$)/.test(config.url || '')
axios.interceptors.request.use((config) => {
  if (isPublic(config)) {
    delete config.headers.Authorization
  } else {
    const token = localStorage.getItem('access_token')
    if (token && !config.headers.Authorization) config.headers.Authorization = 'Bearer ' + token
    const pushEndpoint = localStorage.getItem('push_endpoint')
    if (pushEndpoint) config.headers['X-Push-Endpoint'] = pushEndpoint
  }
  return config
})
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (!config || error.response?.status !== 401 || isPublic(config) || config._retry) throw error
    config._retry = true
    const refresh = localStorage.getItem('refresh_token')
    if (!refresh) {
      onExpired()
      throw error
    }
    if (!refreshPromise) {
      refreshPromise = axios
        .post('/token/refresh/', { refresh })
        .then(({ data }) => {
          if (localStorage.getItem('refresh_token') !== refresh) throw new Error('Sessão alterada')
          localStorage.setItem('access_token', data.access)
          return data.access
        })
        .catch((failure) => {
          if (localStorage.getItem('refresh_token') === refresh) onExpired()
          throw failure
        })
        .finally(() => {
          refreshPromise = undefined
        })
    }
    const token = await refreshPromise
    config.headers.Authorization = 'Bearer ' + token
    return axios(config)
  },
)
export default axios
