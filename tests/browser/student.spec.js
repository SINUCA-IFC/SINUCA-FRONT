import { test, expect } from '@playwright/test'

const student = {
  id: 1,
  name: 'Ana',
  email: 'ana@example.com',
  role: 'student',
  country: { id: 1, name: 'Brasil' },
}
const schedule = {
  id: 7,
  title: 'Debate sobre energia',
  category: 2,
  startDate: '2026-11-21T14:00:00-03:00',
  endDate: '2026-11-21T15:00:00-03:00',
  country: [],
  docs: [],
  location: 'Sala 1',
  description: 'Debate',
}
const rows = (results = []) => ({ results, total_pages: 1 })
async function mockStudent(page, handler = () => null) {
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'test-access')
    localStorage.setItem('refresh_token', 'test-refresh')
  })
  await page.route('http://localhost:8000/api/**', async (route) => {
    const request = route.request(),
      path = new URL(request.url()).pathname
    const custom = await handler(path, request)
    const data = {
      '/api/usuarios/me/': student,
      '/api/usuarios/': rows([student]),
      '/api/paises/1': { id: 1, name: 'Brasil', political_name: 'República Federativa do Brasil' },
      '/api/categorias/': rows([{ id: 2, name: 'Debate' }]),
      '/api/cronogramas/': rows([schedule]),
      '/api/cronogramas/7/': schedule,
      '/api/mensagens/conversas/': rows([{ id: 1, name: 'Brasil', unread_count: 0 }]),
    }
    await route.fulfill({
      status: custom?.status || 200,
      json: custom?.body ?? data[path] ?? rows(),
    })
  })
}

test('six digits support typing, correction, paste, errors and successful confirmation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.addInitScript(() =>
    sessionStorage.setItem(
      'sinuca_pending_verification',
      JSON.stringify({ email: 'ana@example.com', session_token: 'pending' }),
    ),
  )
  let attempts = 0
  await page.route('http://localhost:8000/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/confirmar-email/')) {
      attempts++
      if (attempts === 1)
        return route.fulfill({ status: 400, json: { detail: 'Código inválido.' } })
      expect(route.request().postDataJSON()).toEqual({ key: '012345' })
      return route.fulfill({ json: { access: 'test', refresh: 'refresh' } })
    }
    await route.fulfill({ json: path.endsWith('/me/') ? { ...student, country: null } : rows() })
  })
  await page.goto('/cadastro?id=2&etapa=email')
  await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()
  const digits = page.locator('.digits input')
  await expect(digits).toHaveCount(6)
  await digits.first().pressSequentially('123456')
  await expect(digits.last()).toHaveValue('6')
  await digits.nth(2).fill('')
  await digits.nth(2).press('Backspace')
  await expect(digits.nth(1)).toBeFocused()
  await expect(digits.nth(1)).toHaveValue('')
  await expect(page.getByRole('button', { name: 'CONFIRMAR E-MAIL' })).toBeDisabled()
  await digits.first().fill('111111')
  await page.getByRole('button', { name: 'CONFIRMAR E-MAIL' }).click()
  await expect(page.getByRole('alert')).toContainText('Código inválido')
  await digits.first().evaluate((el) => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text/plain', '012345')
    el.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
    )
  })
  await expect(digits.first()).toHaveValue('0')
  await expect(digits.last()).toHaveValue('5')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/student-verification-mobile.png' })
  await page.getByRole('button', { name: 'CONFIRMAR E-MAIL' }).click()
  await expect(page).toHaveURL(/delegacao/)
  await expect(page.locator('.toast')).toContainText('E-mail confirmado')
  await page.getByRole('button', { name: 'Fechar notificação' }).click()
  await expect(page.locator('.toast')).toHaveCount(0)
})

test('student registration sends photo as multipart, preserves title and validates matriculation', async ({
  page,
}) => {
  let registrations = 0
  await page.route('http://localhost:8000/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/registro/') {
      registrations++
      expect(route.request().headers()['content-type']).toContain('multipart/form-data; boundary=')
      const body = route.request().postDataBuffer().toString()
      expect(body).toContain('filename="avatar.png"')
      expect(body).toContain('1234567890')
      expect(body).toContain('student')
      return route.fulfill({
        status: 201,
        json: { email_verification_required: true, session_token: 'pending' },
      })
    }
    expect(path).not.toContain('/media/images/')
    await route.fulfill({ json: rows() })
  })
  await page.goto('/cadastro?id=2')
  await page.getByLabel('E-mail').fill('ana@example.com')
  await page.getByLabel('Senha', { exact: false }).first().fill('Password123!')
  await page.getByLabel('Confirme sua senha').fill('Password123!')
  await page.getByRole('button', { name: 'CONTINUAR', exact: true }).click()
  await page.getByLabel('Nome Completo').fill('Ana')
  await page.getByLabel('Matrícula').fill('123')
  await page.getByRole('button', { name: 'CADASTRAR', exact: true }).click()
  expect(registrations).toBe(0)
  await page.getByLabel('Matrícula').fill('1234567890')
  await page
    .getByLabel('Escolher foto de perfil')
    .setInputFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aO1cAAAAASUVORK5CYII=',
        'base64',
      ),
    })
  await page.getByRole('button', { name: 'CADASTRAR', exact: true }).click()
  await expect(page).toHaveURL(/etapa=email/)
  await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible()
  await expect(page.locator('.digits input')).toHaveCount(6)
  expect(registrations).toBe(1)
})

test('mobile delegation tabs scroll with touch and documents recover from a failed request', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 360, height: 740 })
  let documents = 0
  await mockStudent(page, (path) => {
    if (path === '/api/docs/') {
      documents++
      return documents === 1
        ? { status: 503, body: {} }
        : {
            body: rows([
              { id: 1, name: 'Guia do debate', categories: [2], url: 'https://example.com/guia' },
            ]),
          }
    }
  })
  await page.goto('/delegacao')
  const nav = page.getByRole('navigation', { name: 'Navegação da delegação' })
  await expect(nav).toBeVisible()
  const strip = nav.locator('.tabs-navigation')
  await strip.scrollIntoViewIfNeeded()
  const bounds = await strip.boundingBox()
  const cdp = await context.newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: bounds.x + bounds.width - 10, y: bounds.y + 22 }],
  })
  for (let i = 1; i <= 8; i++)
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: bounds.x + bounds.width - 10 - i * 22, y: bounds.y + 22 }],
    })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  await nav.getByRole('button', { name: 'Documentos', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible()
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  const link = page.getByRole('link', { name: /Guia do debate/ })
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('href', 'https://example.com/guia')
  await nav.getByRole('button', { name: 'Cronograma', exact: true }).click()
  await page.getByRole('button', { name: /Debate sobre energia/ }).press('Enter')
  await expect(page.getByRole('dialog')).toContainText('Debate sobre energia')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/student-delegation-mobile.png' })
})

test('schedule deep link loads details after refresh', async ({ page }) => {
  await mockStudent(page)
  await page.goto('/delegacao/schedule/7')
  await expect(page.getByRole('dialog')).toContainText('Debate sobre energia')
  await page.reload()
  await expect(page.getByRole('dialog')).toContainText('Debate sobre energia')
})

test('student creates a task and receives a success toast', async ({ page }) => {
  let task
  await mockStudent(page, (path, request) => {
    if (path === '/api/tarefas/' && request.method() === 'POST') {
      task = { ...request.postDataJSON(), id: 5 }
      return { body: task }
    }
    if (path === '/api/tarefas/') return { body: rows(task ? [task] : []) }
  })
  await page.goto('/delegacao/nova-tarefa')
  const dialog = page.getByRole('dialog', { name: 'Nova tarefa' })
  await expect(dialog).toBeVisible()
  await dialog.getByLabel('Título', { exact: false }).fill('Preparar discurso')
  await dialog.getByRole('button', { name: /Debate/ }).click()
  await dialog.getByRole('button', { name: 'Ana', exact: true }).click()
  await dialog.getByRole('button', { name: 'Adicionar', exact: true }).click()
  await expect(page).toHaveURL(/\/delegacao$/)
  await expect(page.locator('.toast')).toContainText('Tarefa criada')
  expect(task.user).toEqual([1])
  await expect(page.getByText('Preparar discurso')).toBeVisible()
})

test('mobile chat keeps failed drafts and sends again without overflowing', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  let attempts = 0
  let message
  await mockStudent(page, (path, request) => {
    if (path !== '/api/mensagens/') return
    if (request.method() === 'POST') {
      attempts++
      if (attempts === 1) return { status: 503, body: {} }
      message = {
        id: 1,
        ...request.postDataJSON(),
        is_mine: true,
        created_at: '2026-11-21T12:00:00Z',
      }
      return { body: message }
    }
    return { body: rows(message ? [message] : []) }
  })
  await page.goto('/chat')
  const draft = page.getByRole('textbox', { name: 'Mensagem', exact: true })
  await expect(draft).toBeVisible()
  const panel = await page.locator('.chat-panel').boundingBox()
  expect(panel.width).toBeGreaterThan(300)
  await draft.fill('Podemos confirmar a sala?')
  await page.getByRole('button', { name: 'Enviar mensagem', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Seu texto foi mantido')
  await expect(draft).toHaveValue('Podemos confirmar a sala?')
  await page.getByRole('button', { name: 'Enviar mensagem', exact: true }).click()
  await expect(page.getByRole('log')).toContainText('Podemos confirmar a sala?')
  await expect(draft).toHaveValue('')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/student-chat-mobile.png' })
})

test('student edits profile and focus returns to edit button', async ({ page }) => {
  let profile = { ...student }
  await mockStudent(page, (path, request) => {
    if (path === '/api/usuarios/1/' && request.method() === 'PATCH') {
      profile = { ...profile, ...request.postDataJSON() }
      return { body: profile }
    }
    if (path === '/api/usuarios/me/') return { body: profile }
  })
  await page.goto('/perfil')
  const edit = page.getByRole('button', { name: 'Editar perfil' })
  await edit.click()
  const dialog = page.getByRole('dialog', { name: 'Editar perfil' })
  await dialog.getByLabel('Nome completo').fill('Ana Silva')
  await dialog.getByRole('button', { name: /Salvar altera/ }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('.toast')).toContainText('Perfil atualizado')
  await expect(page.getByRole('heading', { name: 'Ana Silva', exact: true })).toBeVisible()
  await expect(edit).toBeFocused()
})

test('mural retries after a server error', async ({ page }) => {
  let attempts = 0
  await mockStudent(page, (path) => {
    if (path === '/api/postagens/') {
      attempts++
      return attempts === 1
        ? { status: 503, body: {} }
        : {
            body: rows([
              {
                id: 1,
                title: 'Abertura do evento',
                content: 'Confira os detalhes.',
                created_at: '2026-11-21T12:00:00Z',
              },
            ]),
          }
    }
  })
  await page.goto('/mural')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByText('Abertura do evento')).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('student updates task status and deletes it on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  let task = {
    id: 5,
    title: 'Preparar discurso',
    description: '',
    status: 1,
    category: [{ id: 2, name: 'Debate' }],
    user: [student],
    startDate: '',
    endDate: '',
  }
  await mockStudent(page, (path, request) => {
    if (path === '/api/tarefas/5/') {
      if (request.method() === 'DELETE') {
        task = null
        return { body: {} }
      }
      if (request.method() === 'PATCH')
        task = {
          ...task,
          ...request.postDataJSON(),
          category: [{ id: 2, name: 'Debate' }],
          user: [student],
        }
      return { body: task }
    }
    if (path === '/api/tarefas/') return { body: rows(task ? [task] : []) }
  })
  await page.goto('/delegacao/tarefas/5/editar')
  let dialog = page.getByRole('dialog', { name: 'Editar tarefa' })
  await dialog.getByRole('button', { name: 'Em Andamento', exact: true }).click()
  await dialog.getByRole('button', { name: /Salvar Altera/ }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('list', { name: 'Em andamento', exact: true })).toContainText(
    'Preparar discurso',
  )
  expect(task.status).toBe(2)
  await page.getByRole('button', { name: /Preparar discurso/ }).click()
  dialog = page.getByRole('dialog', { name: 'Editar tarefa' })
  page.once('dialog', (prompt) => prompt.accept())
  await dialog.getByRole('button', { name: 'APAGAR' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.getByText('Preparar discurso')).toHaveCount(0)
  await expect(page.locator('.toast').last()).toContainText('Tarefa exclu')
  expect(task).toBeNull()
})
