import assert from 'node:assert/strict'
import { beforeEach, afterEach, test } from 'node:test'
import axios from '../src/plugins/axios.js'
import { onAuthExpired } from '../src/plugins/axios.js'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from '../src/stores/userStore.js'
import {
  readPending,
  savePending,
  confirmEmail,
  resendCode,
  authError,
  googleCallbackError,
  startGoogle,
  exchangeGoogleSession,
  logoutSession,
} from '../src/services/authService.js'

test('Google callback distinguishes absent session, CSRF and profile errors', () => {
  const missing = {
    response: {
      status: 403,
      data: { detail: 'As credenciais de autenticação não foram fornecidas.' },
    },
  }
  assert.match(googleCallbackError(missing, 'session'), /sessão Google não chegou/)
  assert.match(googleCallbackError(missing, 'profile'), /não foi possível carregar seu perfil/)
  assert.doesNotMatch(googleCallbackError(missing, 'profile'), /vinculada/)
  const csrf = { response: { status: 403, data: { detail: 'CSRF Failed: token mismatch' } } }
  assert.match(googleCallbackError(csrf, 'session'), /validação de segurança/)
})

const storage = () => {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}
const respond = (config, data) => ({ config, data, status: 200, headers: {} })
const reject = (config, status, data = {}) => {
  throw new axios.AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    data,
    headers: {},
  })
}
const originalAdapter = axios.defaults.adapter
beforeEach(() => {
  globalThis.localStorage = storage()
  globalThis.sessionStorage = storage()
  setActivePinia(createPinia())
  onAuthExpired(() => useUserStore().clearLocal())
})
afterEach(() => {
  axios.defaults.adapter = originalAdapter
  delete globalThis.document
})

test('registration, persisted pending step, six digits, JWT and Bearer profile', async () => {
  const requests = []
  axios.defaults.adapter = async (config) => {
    requests.push(config.url)
    if (config.url === '/registro/') {
      assert.deepEqual(JSON.parse(config.data), {
        email: 'a@example.com',
        name: 'Ana',
        password: 'test-password',
        gang: 4,
        foto: 8,
        matriculation: '123',
      })
      assert.equal(config.headers.Authorization, undefined)
      return respond(config, { email_verification_required: true, session_token: 'pending' })
    }
    if (config.url === '/registro/confirmar-email/') {
      assert.deepEqual(JSON.parse(config.data), { key: '012345' })
      assert.equal(config.headers['X-Session-Token'], 'pending')
      return respond(config, { access: 'access', refresh: 'refresh' })
    }
    assert.equal(config.url, '/usuarios/me/')
    assert.equal(config.headers.Authorization, 'Bearer access')
    return respond(config, { id: 1, role: 'student', name: 'Ana' })
  }
  let store = useUserStore()
  await store.register('a@example.com', 'Ana', 'test-password', 4, '123', 8)
  assert.equal(store.loggedIn, false)
  assert.equal(localStorage.getItem('access_token'), null)
  assert.deepEqual(readPending(), { email: 'a@example.com', session_token: 'pending' })
  setActivePinia(createPinia()) // Reloaded store resumes only sessionStorage, not the password.
  store = useUserStore()
  await store.checkAuth()
  await store.completeLogin(await confirmEmail('012345'))
  assert.equal(store.loggedIn, true)
  assert.equal(store.user.name, 'Ana')
  assert.equal(readPending(), null)
  assert.equal(localStorage.getItem('refresh_token'), 'refresh')
  assert.deepEqual(requests, ['/registro/', '/registro/confirmar-email/', '/usuarios/me/'])
})

test('registration omits invalid optional IDs and never sends privilege fields', async () => {
  axios.defaults.adapter = async (config) => {
    assert.deepEqual(JSON.parse(config.data), {
      email: 'a@b.com',
      name: 'Ana',
      password: 'password',
    })
    return respond(config, { email_verification_required: true, session_token: 'pending' })
  }
  await useUserStore().register('a@b.com', 'Ana', 'password', 0, '', null)
})

test('pending login 401 never refreshes or authenticates even with old JWTs', async () => {
  localStorage.setItem('access_token', 'old')
  localStorage.setItem('refresh_token', 'old-refresh')
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, '/token/')
    assert.equal(config.headers.Authorization, undefined)
    reject(config, 401, { email_verification_required: true, session_token: 'new-pending' })
  }
  assert.equal(await useUserStore().login('a@b.com', 'password'), false)
  assert.equal(readPending().session_token, 'new-pending')
  assert.equal(localStorage.getItem('refresh_token'), null)
})

test('verified login loads profile and clears pending confirmation', async () => {
  savePending('a@b.com', 'pending')
  axios.defaults.adapter = async (config) =>
    respond(config, config.url === '/token/' ? { access: 'a', refresh: 'r' } : { id: 3 })
  assert.equal(await useUserStore().login('a@b.com', 'password'), true)
  assert.equal(useUserStore().user.id, 3)
  assert.equal(readPending(), null)
})

test('resend rotates session token without requesting JWT', async () => {
  savePending('a@b.com', 'before')
  axios.defaults.adapter = async (config) => {
    assert.equal(config.url, '/registro/reenviar-codigo/')
    assert.equal(config.headers['X-Session-Token'], 'before')
    return respond(config, { meta: { session_token: 'after' } })
  }
  await resendCode()
  assert.equal(readPending().session_token, 'after')
  assert.equal(localStorage.getItem('access_token'), null)
})

for (const status of [400, 401, 409, 410, 429, 500]) {
  test(`confirmation error ${status} is propagated without refresh or retry`, async () => {
    savePending('a@b.com', 'pending')
    localStorage.setItem('refresh_token', 'old')
    let count = 0
    axios.defaults.adapter = async (config) => {
      count++
      reject(config, status)
    }
    await assert.rejects(confirmEmail('000000'))
    assert.equal(count, 1)
  })
}

test('concurrent protected requests share one refresh and retry with Bearer', async () => {
  localStorage.setItem('access_token', 'expired')
  localStorage.setItem('refresh_token', 'refresh')
  let refreshCount = 0
  axios.defaults.adapter = async (config) => {
    if (config.url === '/token/refresh/') {
      refreshCount++
      assert.deepEqual(JSON.parse(config.data), { refresh: 'refresh' })
      assert.equal(config.headers.Authorization, undefined)
      await new Promise((resolve) => setTimeout(resolve, 15))
      return respond(config, { access: 'new' })
    }
    if (!config._retry) reject(config, 401)
    assert.equal(config.headers.Authorization, 'Bearer new')
    return respond(config, {})
  }
  await Promise.all([axios.get('/usuarios/me/'), axios.get('/tarefas/')])
  assert.equal(refreshCount, 1)
})

test('refresh rejection terminates the session without recursion', async () => {
  localStorage.setItem('access_token', 'expired')
  localStorage.setItem('refresh_token', 'expired')
  let count = 0
  axios.defaults.adapter = async (config) => {
    count++
    reject(config, 401)
  }
  await assert.rejects(axios.get('/usuarios/me/'))
  assert.equal(count, 2)
  assert.equal(localStorage.getItem('access_token'), null)
})

test('Google submits a full navigation POST, exchanges once with fresh CSRF and no Bearer', async () => {
  const elements = []
  let submitted = false
  globalThis.document = {
    createElement: (tag) => {
      const element = {
        tag,
        children: [],
        appendChild(child) {
          this.children.push(child)
        },
        submit() {
          submitted = true
        },
        remove() {},
      }
      elements.push(element)
      return element
    },
    body: { appendChild() {} },
  }
  localStorage.setItem('access_token', 'old')
  let csrfCount = 0
  let exchangeCount = 0
  axios.defaults.adapter = async (config) => {
    assert.equal(config.withCredentials, true)
    assert.equal(config.headers.Authorization, undefined)
    if (config.url === '/auth/csrf/') return respond(config, { csrfToken: `csrf-${++csrfCount}` })
    assert.equal(config.url, '/token/session/')
    assert.equal(config.headers['X-CSRFToken'], 'csrf-2')
    exchangeCount++
    return respond(config, { access: 'google-access', refresh: 'google-refresh' })
  }
  await startGoogle()
  assert.equal(submitted, true)
  assert.equal(elements[0].method, 'POST')
  assert.equal(elements[0].action, 'https://sinuca-backend.class.fabricadesoftware.ifc.edu.br/api/auth/google/')
  assert.equal(elements[1].name, 'csrfmiddlewaretoken')
  assert.equal(elements[1].value, 'csrf-1')
  const [first, second] = await Promise.all([exchangeGoogleSession(), exchangeGoogleSession()])
  assert.deepEqual(first, second)
  await exchangeGoogleSession()
  assert.equal(exchangeCount, 1)
})

test('Google session 403 propagates without attempting refresh', async () => {
  axios.defaults.adapter = async (config) => respond(config, { csrfToken: 'csrf' })
  await logoutSession() // Reset callback lifecycle.
  let count = 0
  axios.defaults.adapter = async (config) => {
    count++
    if (config.url === '/auth/csrf/') return respond(config, { csrfToken: 'csrf' })
    reject(config, 403)
  }
  await assert.rejects(exchangeGoogleSession(), (error) => error.response.status === 403)
  assert.equal(count, 2)
})

test('logout immediately clears local state and ends the cookie session with CSRF', async () => {
  const store = useUserStore()
  store.loggedIn = true
  savePending('a@b.com', 'pending')
  localStorage.setItem('access_token', 'a')
  localStorage.setItem('refresh_token', 'r')
  const calls = []
  axios.defaults.adapter = async (config) => {
    calls.push(config.url)
    assert.equal(config.withCredentials, true)
    assert.equal(config.headers.Authorization, undefined)
    if (config.url === '/auth/logout/') assert.equal(config.headers['X-CSRFToken'], 'csrf')
    return respond(config, { csrfToken: 'csrf' })
  }
  const promise = store.logout()
  assert.equal(store.loggedIn, false)
  assert.equal(readPending(), null)
  assert.equal(localStorage.getItem('refresh_token'), null)
  await promise
  assert.deepEqual(calls, ['/auth/csrf/', '/auth/logout/'])
})

test('offline logout and late refresh cannot restore cleared tokens', async () => {
  localStorage.setItem('access_token', 'a')
  localStorage.setItem('refresh_token', 'r')
  let release
  const waiting = new Promise((resolve) => {
    release = resolve
  })
  axios.defaults.adapter = async (config) => {
    if (config.url === '/token/refresh/') {
      await waiting
      return respond(config, { access: 'late' })
    }
    if (config.url === '/auth/csrf/') throw new Error('offline')
    reject(config, 401)
  }
  const request = axios.get('/usuarios/me/')
  const rejected = assert.rejects(request)
  await new Promise((resolve) => setTimeout(resolve, 10))
  await useUserStore().logout()
  release()
  await rejected
  assert.equal(localStorage.getItem('access_token'), null)
})

test('DRF, allauth, throttling, server and network errors yield safe text', () => {
  assert.equal(
    authError({ response: { data: { email: ['E-mail já cadastrado.'] } } }),
    'E-mail já cadastrado.',
  )
  assert.equal(
    authError({ response: { data: { errors: [{ message: 'Código inválido.' }] } } }),
    'Código inválido.',
  )
  assert.match(authError({ response: { status: 429 } }), /Aguarde/)
  assert.match(
    authError({ response: { status: 500, data: '<html>secret</html>' } }),
    /indisponível/,
  )
  assert.match(authError(new Error('network')), /conexão/)
  assert.doesNotMatch(
    authError({ response: { data: { detail: '<html>secret</html>' } } }),
    /html|secret/,
  )
})
