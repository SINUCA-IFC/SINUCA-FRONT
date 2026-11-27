import { test, expect } from '@playwright/test'

for (const width of [320, 1440]) {
  test(`bulk selection preserves search choices and retries only failures at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.addInitScript(() => localStorage.setItem('access_token', 'test'))
    const students = [
      { id: 8, name: 'Ana', email: 'ana@example.com', role: 'student', country: null, gang: 4 },
      { id: 9, name: 'Bruno', email: 'bruno@example.com', role: 'student', country: null, gang: 4 },
    ]
    const attempts = []
    let fail = true
    await page.route('**/api/**', async (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname
      let data = { results: [], total_pages: 1 }
      if (path === '/api/usuarios/me/') data = { id: 1, role: 'organizer', name: 'Organizador' }
      if (path === '/api/paises/1') data = { id: 1, name: 'Brasil' }
      if (path === '/api/turmas/') data.results = [{ id: 4, name: '1INFO' }]
      if (path === '/api/usuarios/') data.results = students
      if (path === '/api/usuarios/pendentes/') data.results = students.filter((s) => !s.country)
      if (/\/usuarios\/\d+\/aprovar\/$/.test(path)) {
        const id = Number(path.split('/')[3])
        attempts.push(id)
        expect(request.postDataJSON()).toEqual({ country: 1 })
        if (id === 9 && fail) return route.fulfill({ status: 500, json: {} })
        const student = students.find((s) => s.id === id)
        student.country = { id: 1, name: 'Brasil' }
        data = student
      }
      await route.fulfill({ json: data })
    })
    await page.goto('/organizador/delegacoes/1')
    await page.getByRole('button', { name: 'Adicionar participante +' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: '1INFO', exact: true }).click()
    await expect(dialog.getByRole('button', { name: 'Continuar (0)' })).toBeDisabled()
    await dialog.getByRole('button', { name: /Ana.*ana@example.com/ }).click()
    await dialog.getByLabel('Pesquisar discente').fill('Bruno')
    await dialog.getByRole('button', { name: /Bruno.*bruno@example.com/ }).click()
    await dialog.getByRole('button', { name: 'Continuar (2)' }).click()
    await expect(dialog.locator('.selected-participants li')).toHaveCount(2)
    await dialog.getByRole('button', { name: 'Revisar seleção' }).click()
    await dialog.getByLabel('Pesquisar discente').fill('')
    await expect(dialog.getByRole('button', { name: /Ana.*ana@example.com/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await dialog.getByRole('button', { name: 'Continuar (2)' }).click()
    await dialog.getByRole('button', { name: 'Confirmar', exact: true }).click()
    await expect(dialog.getByRole('alert')).toContainText('Bruno')
    await expect(dialog.locator('.selected-participants li')).toHaveCount(1)
    expect(attempts).toEqual([8, 9])
    fail = false
    await dialog.getByRole('button', { name: 'Confirmar', exact: true }).click()
    await expect(dialog).toHaveCount(0)
    expect(attempts).toEqual([8, 9, 9])
    await expect(page.getByRole('heading', { name: 'Participantes (2)' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
