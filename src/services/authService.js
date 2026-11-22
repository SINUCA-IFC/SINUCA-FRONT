import axios from 'axios'

export const apiOrigin = (import.meta.env?.VITE_API_BASE_URL || 'https://sinuca-backend.class.fabricadesoftware.ifc.edu.br')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '')
export const pendingKey = 'sinuca_pending_verification'
let callbackPromise
export function readPending() {
  try {
    const value = JSON.parse(sessionStorage.getItem(pendingKey))
    return value?.email && value?.session_token ? value : null
  } catch {
    return null
  }
}
export function clearPending() {
  sessionStorage.removeItem(pendingKey)
}
export function savePending(email, session_token) {
  if (!session_token) throw new Error('Confirmação indisponível')
  sessionStorage.setItem(pendingKey, JSON.stringify({ email, session_token }))
}
export function authError(error) {
  const status = error.response?.status
  if (status === 429) return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
  if (status >= 500) return 'O serviço está indisponível. Tente novamente em instantes.'
  if ([409, 410].includes(status))
    return 'Esta etapa de confirmação foi encerrada. Volte ao login para continuar.'
  const data = error.response?.data
  const messages =
    data?.errors?.map((item) => item.message) ||
    (typeof data?.detail === 'string'
      ? [data.detail]
      : data && typeof data === 'object'
        ? Object.values(data)
            .flat()
            .filter((item) => typeof item === 'string')
        : [])
  const safe = messages.filter((message) => typeof message === 'string' && !/[<>]/.test(message))
  if (safe.length) return safe.join(' ')
  return error.response
    ? 'Não foi possível concluir. Confira os dados e tente novamente.'
    : 'Não foi possível conectar. Verifique sua conexão e tente novamente.'
}

export function googleCallbackError(error, stage) {
  if (stage === 'profile') {
    return 'O Google foi autenticado, mas não foi possível carregar seu perfil no SINUCA. Tente entrar novamente.'
  }
  if (error.response?.status === 403) {
    const detail = error.response.data?.detail
    if (typeof detail === 'string' && /csrf/i.test(detail)) {
      return 'A validação de segurança da sessão falhou. Inicie novamente pelo botão Google.'
    }
    return 'Sua sessão Google não chegou ao SINUCA. Volte ao início do fluxo com “Continuar com Google”.'
  }
  return authError(error)
}
async function csrf() {
  const { data } = await axios.get('/auth/csrf/', { skipAuth: true, withCredentials: true })
  if (!data.csrfToken) throw new Error('CSRF indisponível')
  return data.csrfToken
}
export async function startGoogle(role) {
  callbackPromise = undefined
  const token = await csrf()
  submitGoogleForm('/api/auth/google/', token, role)
}
function submitGoogleForm(path, token, role) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = apiOrigin + path
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = 'csrfmiddlewaretoken'
  input.value = token
  form.appendChild(input)
  if (role) {
    const profile = document.createElement('input')
    profile.type = 'hidden'
    profile.name = 'role'
    profile.value = role
    form.appendChild(profile)
  }
  document.body.appendChild(form)
  form.submit()
  form.remove()
}
export function exchangeGoogleSession() {
  callbackPromise ??= csrf()
    .then((token) =>
      axios.post(
        '/token/session/',
        {},
        {
          skipAuth: true,
          withCredentials: true,
          headers: { 'X-CSRFToken': token },
        },
      ),
    )
    .then((response) => response.data)
  return callbackPromise
}
export async function logoutSession() {
  callbackPromise = undefined
  const token = await csrf()
  await axios.post(
    '/auth/logout/',
    {},
    {
      skipAuth: true,
      withCredentials: true,
      headers: { 'X-CSRFToken': token },
    },
  )
}
export async function confirmEmail(key) {
  const pending = readPending()
  if (!pending) throw new Error('Confirmação indisponível')
  const { data } = await axios.post(
    '/registro/confirmar-email/',
    { key },
    {
      skipAuth: true,
      headers: { 'X-Session-Token': pending.session_token },
    },
  )
  return data
}
export async function resendCode() {
  const pending = readPending()
  if (!pending) throw new Error('Confirmação indisponível')
  const { data } = await axios.post(
    '/registro/reenviar-codigo/',
    {},
    {
      skipAuth: true,
      headers: { 'X-Session-Token': pending.session_token },
    },
  )
  if (data.meta?.session_token) savePending(pending.email, data.meta.session_token)
  return data
}
