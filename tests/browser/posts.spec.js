import { test, expect } from '@playwright/test'

async function setup(page, role = 'organizer') {
  await page.addInitScript(() => localStorage.setItem('access_token', 'test-access'))
  const state = { posts: [], uploads: 0, deletes: 0, fail: false, payload: null }
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    let data = { results: [], total_pages: 1 }
    if (path === '/api/usuarios/me/') data = { id: 7, name: 'Teste', role, country: null }
    if (path === '/api/media/images/') {
      state.uploads++
      data = { attachment_key: 'photo-key' }
    }
    if (path.startsWith('/api/postagens/')) {
      if (request.method() === 'POST' || request.method() === 'PATCH') {
        state.payload = request.postDataJSON()
        if (state.fail) return route.fulfill({ status: 500, json: {} })
        data = { ...state.posts[0], ...state.payload, id: 1, created_at: '2026-11-22T12:00:00Z' }
        if (state.payload.foto_attachment_key) data.foto = { url: '/logo-azul.svg' }
        state.posts = [data]
      } else if (request.method() === 'DELETE') {
        state.deletes++
        state.posts = []
        return route.fulfill({ status: 204 })
      } else data.results = state.posts
    }
    await route.fulfill({ json: data })
  })
  return state
}

for (const width of [320, 1440]) {
  test(`organizer creates, edits and deletes mural posts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    const state = await setup(page)
    await page.goto('/mural')
    await page.getByRole('button', { name: 'Nova postagem' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('.mdi-image-plus')).toBeVisible()
    const chooser = page.waitForEvent('filechooser')
    await dialog.getByRole('button', { name: /Adicionar imagem/ }).click()
    await chooser
    await page.getByLabel('Título', { exact: true }).fill('Aviso importante')
    await page.getByLabel('Descrição', { exact: true }).fill('Descrição da postagem')
    await page.getByLabel('Imagem (opcional)').setInputFiles({
      name: 'foto.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuoAAAAASUVORK5CYII=',
        'base64',
      ),
    })
    await expect(page.getByAltText('Prévia da imagem da postagem')).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Trocar imagem/ })).toContainText('foto.png')
    await page.screenshot({ path: `test-results/post-image-picker-${width}.png` })
    expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
    await page.getByRole('button', { name: 'Publicar', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    expect(state.payload.foto_attachment_key).toBe('photo-key')
    expect(state.uploads).toBe(1)
    await expect(page.getByRole('heading', { name: 'Aviso importante' })).toBeVisible()
    await page.getByLabel('Opções da postagem Aviso importante').click()
    await page.getByRole('button', { name: 'Editar postagem', exact: true }).click()
    await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Aviso importante')
    await page.getByLabel('Título', { exact: true }).fill('Aviso atualizado')
    state.fail = true
    await page.getByRole('button', { name: 'Salvar alterações' }).click()
    await expect(dialog.getByRole('alert')).toContainText('Não foi possível salvar')
    await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Aviso atualizado')
    state.fail = false
    await page.getByRole('button', { name: 'Salvar alterações' }).click()
    await expect(dialog).toHaveCount(0)
    expect(state.payload).toEqual({ title: 'Aviso atualizado', content: 'Descrição da postagem' })
    await page.getByLabel('Opções da postagem Aviso atualizado').click()
    await page.getByRole('button', { name: 'Excluir postagem', exact: true }).click()
    await dialog.getByRole('button', { name: 'Cancelar' }).click()
    expect(state.deletes).toBe(0)
    await page.getByLabel('Opções da postagem Aviso atualizado').click()
    await page.getByRole('button', { name: 'Excluir postagem', exact: true }).click()
    await dialog.getByRole('button', { name: 'Excluir postagem', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Aviso atualizado' })).toHaveCount(0)
    expect(state.deletes).toBe(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('student sees posts without publishing or management controls', async ({ page }) => {
  const state = await setup(page, 'student')
  state.posts = [{ id: 1, title: 'Notícia', content: 'Conteúdo' }]
  await page.goto('/mural')
  await expect(page.getByRole('heading', { name: 'Notícia' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nova postagem' })).toHaveCount(0)
  await expect(page.locator('.post-actions')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Ver mais' })).toHaveCount(0)
})

for (const width of [320, 1440]) {
  test(`post descriptions expand only above 300 characters at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    const state = await setup(page, 'student')
    const boundary = 'Texto '.repeat(50).trim() + '!'
    const long = 'Uma descrição longa da postagem. '.repeat(40)
    state.posts = [
      { id: 1, title: 'Curta', content: 'Olá' },
      { id: 2, title: 'Limite', content: boundary },
      { id: 3, title: 'Longa', content: long },
    ]
    await page.goto('/mural')
    const shortCard = page
      .locator('.card')
      .filter({ has: page.getByRole('heading', { name: 'Curta', exact: true }) })
    const boundaryCard = page
      .locator('.card')
      .filter({ has: page.getByRole('heading', { name: 'Limite', exact: true }) })
    const longCard = page
      .locator('.card')
      .filter({ has: page.getByRole('heading', { name: 'Longa', exact: true }) })
    await expect(shortCard.locator('.toggle-btn')).toHaveCount(0)
    await expect(boundaryCard.locator('.toggle-btn')).toHaveCount(0)
    await expect(boundaryCard.locator('.post-desc')).toHaveText(boundary)
    await longCard.getByRole('button', { name: 'Ver mais' }).click()
    await expect(longCard.locator('.post-desc')).toHaveText(long.trim())
    await expect(longCard.getByRole('button', { name: 'Ver menos' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await longCard.getByRole('button', { name: 'Ver menos' }).click()
    expect((await longCard.locator('.post-desc').textContent()).length).toBeLessThanOrEqual(301)
  })
}
