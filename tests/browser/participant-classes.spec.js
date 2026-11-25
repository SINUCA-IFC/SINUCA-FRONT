import { test, expect } from '@playwright/test'

async function mockClasses(page, { failClasses = false, emptyClasses = false } = {}) {
  await page.addInitScript(() => localStorage.setItem('access_token', 'test'))
  const students = [
    { id: 8, name: 'Ana', email: 'ana@example.com', gang: { id: 4, name: '1INFO' } },
    { id: 9, name: 'Bruno', email: 'bruno@example.com', gang: '5' },
  ]
  const approvals = []
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    let data = { results: [], total_pages: 1 }
    if (url.pathname === '/api/usuarios/me/')
      data = { id: 1, name: 'Organizador', role: 'organizer' }
    if (url.pathname === '/api/paises/1') data = { id: 1, name: 'Brasil' }
    if (url.pathname === '/api/turmas/') {
      if (failClasses) {
        failClasses = false
        return route.fulfill({ status: 503, json: {} })
      }
      if (!emptyClasses) {
        data = {
          total_pages: 2,
          results:
            url.searchParams.get('page') === '2'
              ? [
                  { id: 5, name: '2INFO' },
                  { id: 6, name: '3INFO' },
                ]
              : [{ id: 4, name: '1INFO' }],
        }
      }
    }
    if (url.pathname === '/api/usuarios/pendentes/' && !emptyClasses) {
      data = {
        total_pages: 2,
        results: url.searchParams.get('page') === '2' ? students.slice(1) : students.slice(0, 1),
      }
    }
    if (/\/usuarios\/\d+\/aprovar\/$/.test(url.pathname)) {
      const id = Number(url.pathname.split('/')[3])
      expect(request.postDataJSON()).toEqual({ country: 1 })
      approvals.push(id)
      data = { ...students.find((student) => student.id === id), role: 'student', country: 1 }
    }
    await route.fulfill({ json: data })
  })
  await page.goto('/organizador/delegacoes/1')
  await page.getByRole('button', { name: 'Adicionar participante +' }).click()
  return { dialog: page.getByRole('dialog'), approvals }
}

for (const width of [320, 1440]) {
  test(`class selection filters students and preserves choices across classes at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    const { dialog, approvals } = await mockClasses(page)
    await expect(dialog.getByRole('heading', { name: 'Selecionar turma' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /ana@example.com/ })).toHaveCount(0)
    await dialog.getByLabel('Pesquisar turma').fill('2info')
    await expect(dialog.getByRole('button', { name: '1INFO', exact: true })).toHaveCount(0)
    await dialog.getByRole('button', { name: '2INFO', exact: true }).click()
    await expect(dialog.getByRole('heading', { name: 'Alunos de 2INFO' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: /ana@example.com/ })).toHaveCount(0)
    await dialog.getByRole('button', { name: /bruno@example.com/ }).click()
    await dialog.getByLabel('Pesquisar discente').fill('bruno')
    const back = dialog.getByRole('button', { name: 'Voltar às turmas' })
    await expect(back.locator('.mdi-arrow-left')).toHaveCount(1)
    await expect(back).toHaveText('')
    await back.click()
    await expect(dialog.getByLabel('Pesquisar turma')).toHaveValue('')
    await dialog.getByRole('button', { name: '3INFO', exact: true }).click()
    await expect(dialog.getByText('Nenhum discente disponível nesta turma.')).toBeVisible()
    await dialog.getByRole('button', { name: 'Voltar às turmas' }).click()
    await dialog.getByRole('button', { name: '1INFO', exact: true }).click()
    await expect(dialog.getByLabel('Pesquisar discente')).toHaveValue('')
    await dialog.getByRole('button', { name: /ana@example.com/ }).click()
    await dialog.getByRole('button', { name: 'Continuar (2)' }).click()
    await expect(dialog.locator('.selected-participants li')).toHaveCount(2)
    await dialog.getByRole('button', { name: 'Revisar seleção' }).click()
    await expect(dialog.getByRole('button', { name: /ana@example.com/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await dialog.getByRole('button', { name: 'Continuar (2)' }).click()
    await dialog.getByRole('button', { name: 'Confirmar', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    expect(approvals).toEqual([8, 9])
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('reopening resets the class and student selection', async ({ page }) => {
  const { dialog } = await mockClasses(page)
  await dialog.getByRole('button', { name: '1INFO', exact: true }).click()
  await dialog.getByRole('button', { name: /ana@example.com/ }).click()
  await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await page.getByRole('button', { name: 'Adicionar participante +' }).click()
  await expect(dialog.getByRole('heading', { name: 'Selecionar turma' })).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Continuar (0)' })).toBeDisabled()
})

test('class request failures can be retried without leaving the modal', async ({ page }) => {
  const { dialog } = await mockClasses(page, { failClasses: true })
  await expect(dialog.getByRole('alert')).toContainText('Não foi possível carregar')
  await dialog.getByRole('button', { name: 'Tentar novamente' }).click()
  await dialog.getByRole('button', { name: '1INFO', exact: true }).click()
  await expect(dialog.getByRole('button', { name: /ana@example.com/ })).toBeVisible()
})

test('no classes available shows an empty state', async ({ page }) => {
  const { dialog } = await mockClasses(page, { emptyClasses: true })
  await expect(dialog.getByText('Nenhuma turma disponível.')).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Continuar (0)' })).toBeDisabled()
})
