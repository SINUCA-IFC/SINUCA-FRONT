import { test, expect } from '@playwright/test'

const pending = { email_verification_required: true, session_token: 'pending' }
const jwt = { access: 'test-access', refresh: 'test-refresh' }
async function mockApi(page, handler = () => null) {
  await page.route('http://localhost:8000/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const custom = await handler(path, request)
    const body =
      path === '/api/usuarios/me/'
        ? { id: 1, name: 'Ana', role: 'student', country: null }
        : { results: [], total_pages: 1 }
    await route.fulfill({ status: custom?.status || 200, json: custom?.body || body })
  })
}

test('registration validates passwords, resumes after reload, resends, confirms and enters', async ({
  page,
}) => {
  await mockApi(page, (path, request) => {
    if (path === '/api/registro/') {
      expect(request.postDataJSON()).toEqual({
        email: 'ana@example.com',
        name: 'Ana',
        password: 'Password123!',
        role: 'organizer',
      })
      return { status: 201, body: pending }
    }
    if (path === '/api/registro/reenviar-codigo/')
      return { body: { meta: { session_token: 'rotated' } } }
    if (path === '/api/registro/confirmar-email/') {
      expect(request.postDataJSON()).toEqual({ key: '012345' })
      expect(request.headers()['x-session-token']).toBe('rotated')
      return { body: jwt }
    }
  })
  await page.goto('/cadastro?id=1')
  await page.getByLabel('E-mail', { exact: false }).fill('ana@example.com')
  await page.getByLabel('Senha', { exact: false }).first().fill('Password123!')
  await page.getByLabel('Confirme sua senha').fill('different')
  await expect(page.getByRole('button', { name: 'CONTINUAR', exact: true })).toBeDisabled()
  await page.getByLabel('Confirme sua senha').fill('Password123!')
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click()
  await page.getByLabel('Nome Completo').fill('Ana')
  await page.getByRole('button', { name: 'CADASTRAR', exact: true }).click()
  await expect(page).toHaveURL(/cadastro\?.*etapa=email/)
  await page.reload()
  await expect(page.getByText(/ana@example.com/)).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('access_token'))).toBeNull()
  await page.getByRole('button', { name: 'REENVIAR CÓDIGO' }).click()
  await expect(page.getByRole('status').first()).toContainText('novo código')
  await expect(page.getByRole('button', { name: /REENVIAR EM/ })).toBeDisabled()
  const code = page.getByLabel('Dígito 1 de 6', { exact: true })
  await expect(code).toHaveAttribute('inputmode', 'numeric')
  await expect(code).toHaveAttribute('autocomplete', 'one-time-code')
  await code.fill('012345')
  await page.getByRole('button', { name: 'CONFIRMAR E-MAIL' }).click()
  await expect(page).toHaveURL(/delegacao/)
  expect(await page.evaluate(() => localStorage.getItem('refresh_token'))).toBe('test-refresh')
})

test('pending login never refreshes, closed verification offers login', async ({ page }) => {
  let refreshes = 0
  await mockApi(page, (path) => {
    if (path === '/api/token/refresh/') refreshes++
    if (path === '/api/token/') return { status: 401, body: pending }
    if (path === '/api/registro/confirmar-email/') return { status: 410, body: {} }
  })
  await page.goto('/login?id=2')
  await page.getByLabel('E-mail').fill('ana@example.com')
  await page.getByLabel(/^Senha/).fill('Password123!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/login(?:\?id=2)?$/)
  await expect(page.getByRole('alert')).toContainText('Confirme seu e-mail')
  await expect(page.getByLabel('Código de seis dígitos')).toHaveCount(0)
  await page.getByRole('link', { name: 'Clique aqui para digitar o código' }).click()
  await expect(page).toHaveURL(/cadastro\?.*etapa=email/)
  await page.getByLabel('Dígito 1 de 6', { exact: true }).fill('000000')
  await page.getByRole('button', { name: 'CONFIRMAR E-MAIL' }).click()
  await expect(page.getByRole('alert')).toContainText('encerrada')
  await expect(
    page.getByRole('link', { name: 'Voltar ao login', exact: true }).last(),
  ).toBeVisible()
  expect(refreshes).toBe(0)
})

test('verified password login enters directly without requesting confirmation', async ({
  page,
}) => {
  const confirmationRequests = []
  await mockApi(page, (path) => {
    if (path.includes('/registro/')) confirmationRequests.push(path)
    if (path === '/api/token/') return { body: jwt }
  })
  await page.goto('/login?id=2')
  await page.getByLabel('E-mail').fill('ana@example.com')
  await page.getByLabel(/^Senha/).fill('Password123!')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/delegacao/)
  expect(confirmationRequests).toEqual([])
  await expect(page.getByLabel('Código de seis dígitos')).toHaveCount(0)
})

test('callback cancellation never exchanges and 403 offers email login', async ({ page }) => {
  let exchanges = 0
  await mockApi(page, (path) => {
    if (path === '/api/auth/csrf/') return { body: { csrfToken: 'csrf' } }
    if (path === '/api/token/session/') {
      exchanges++
      return { status: 403, body: {} }
    }
  })
  await page.goto('/auth/callback?error=cancelled')
  await expect(page.getByRole('alert')).toContainText(
    'Não foi possível concluir o acesso com o Google',
  )
  expect(exchanges).toBe(0)
  await page.goto('/auth/callback')
  await expect(page.getByRole('alert')).toContainText('sessão Google não chegou')
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continuar com Google' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
  expect(exchanges).toBe(1)
})

test('profile failure after Google exchange does not claim a missing Google session', async ({
  page,
}) => {
  await mockApi(page, (path) => {
    if (path === '/api/auth/csrf/') return { body: { csrfToken: 'csrf' } }
    if (path === '/api/token/session/') return { body: jwt }
    if (path === '/api/usuarios/me/') return { status: 403, body: { detail: 'Acesso recusado.' } }
  })
  await page.goto('/auth/callback')
  await expect(page.getByRole('alert')).toContainText('não foi possível carregar seu perfil')
  expect(await page.evaluate(() => localStorage.getItem('access_token'))).toBeNull()
})

test('Google callback exchanges cookies for JWT once and logout clears tokens', async ({
  page,
}) => {
  let exchanges = 0
  let logouts = 0
  await mockApi(page, (path, request) => {
    if (path === '/api/auth/csrf/') return { body: { csrfToken: 'fresh-csrf' } }
    if (path === '/api/token/session/') {
      exchanges++
      expect(request.headers()['authorization']).toBeUndefined()
      expect(request.headers()['x-csrftoken']).toBe('fresh-csrf')
      return { body: jwt }
    }
    if (path === '/api/auth/logout/') {
      logouts++
      return { body: {} }
    }
  })
  await page.goto('/auth/callback')
  await expect(page).toHaveURL(/delegacao/)
  expect(exchanges).toBe(1)
  await page.getByRole('button', { name: /sair/i }).first().click()
  await expect(page).toHaveURL(/login/)
  await expect.poll(() => logouts).toBe(1)
  expect(await page.evaluate(() => localStorage.getItem('access_token'))).toBeNull()
})

test('mobile login and missing verification remain usable without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto('/login?id=2')
  await expect(page.getByRole('button', { name: 'Continuar com Google' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.goto('/verificar-email')
  await expect(
    page.getByText('Não há uma confirmação disponível. Volte ao login para continuar.'),
  ).toBeVisible()
})

test('login and registration use the same Google button and no separate link form', async ({
  page,
}) => {
  for (const path of ['/login', '/cadastro']) {
    await page.goto(path + '?id=2')
    await expect(page.locator('.auth-brand')).toHaveText('Discente')
    await expect(page.locator('.auth-brand img')).toHaveCount(0)
    const google = page.getByRole('button', { name: 'Continuar com Google' })
    await expect(google).toBeVisible()
    await expect(google).toHaveCSS('background-color', 'rgb(17, 17, 17)')
    await expect(page.getByRole('link', { name: /vincular/i })).toHaveCount(0)
  }
  await page.goto('/auth/vincular-google')
  await expect(page).toHaveURL(/\/login(?:\?id=2)?$/)
  await expect(page.getByRole('heading', { name: 'Bem-vindo' })).toBeVisible()
})

test('profile selection preserves the current form and evaluator stays under construction', async ({
  page,
}) => {
  await page.goto('/login?redirect=/perfil')
  await page.getByRole('button', { name: 'Organizador', exact: true }).click()
  await expect(page.locator('.auth-brand')).toHaveText('Organizador')
  await expect(page).toHaveURL(/id=1/)
  await page.getByRole('link', { name: 'Novo no SINUCA? Clique aqui.' }).click()
  await expect(page.locator('.auth-brand')).toHaveText('Organizador')
  await page.reload()
  await expect(page.locator('.auth-brand')).toHaveText('Organizador')
  await page.setViewportSize({ width: 360, height: 740 })
  await page.getByRole('button', { name: 'Voltar', exact: true }).click()
  await page.getByRole('button', { name: 'Avaliador', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Área do avaliador em construção' })).toBeVisible()
  await expect(page.getByText(/obrigatoriamente um e-mail @ifc.edu.br/)).toBeVisible()
  await expect(page.getByLabel('E-mail')).toHaveCount(0)
  await expect(page.getByText(/continuar como convidado/i)).toHaveCount(0)
  await page.setViewportSize({ width: 360, height: 740 })
  await page.screenshot({ path: 'test-results/evaluator-mobile.png' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
