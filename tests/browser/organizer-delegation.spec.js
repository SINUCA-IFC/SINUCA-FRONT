import { test, expect } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`delegation participants and resources at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => localStorage.setItem('access_token', 'test'))
    const countries = [
      { id: 1, name: 'Brasil', political_name: 'República Federativa do Brasil' },
      { id: 2, name: 'Chile' },
    ]
    const student = { id: 8, name: 'Ana', email: 'ana@example.com', role: 'student', country: null }
    const docs = [],
      schedules = []
    await page.route('**/api/**', async (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname
      let data = { results: [], total_pages: 1 }
      if (path === '/api/usuarios/me/') data = { id: 7, name: 'Organizador', role: 'organizer' }
      if (path === '/api/paises/1') data = countries[0]
      if (path === '/api/paises/') data.results = countries
      if (path === '/api/usuarios/') data.results = [student]
      if (path === '/api/usuarios/pendentes/') data.results = student.country ? [] : [student]
      if (path === '/api/usuarios/8/aprovar/') {
        expect(request.postDataJSON()).toEqual({ country: 1 })
        student.country = countries[0]
        data = student
      }
      if (path === '/api/docs/') {
        if (request.method() === 'POST') {
          data = { ...request.postDataJSON(), id: 9, categories: [] }
          docs.push(data)
        } else data.results = docs
      }
      if (path === '/api/cronogramas/') {
        if (request.method() === 'POST') {
          data = { ...request.postDataJSON(), id: 10 }
          schedules.push(data)
        } else data.results = schedules
      }
      await route.fulfill({ json: data })
    })
    await page.goto('/organizador/delegacoes/1')
    await page.getByRole('button', { name: 'Adicionar participante +' }).click()
    await page.getByRole('button', { name: /Ana.*ana@example.com/ }).click()
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Ana', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Documentos', exact: true }).click()
    await page.getByRole('button', { name: 'Adicionar documento +' }).click()
    await page.getByLabel('Nome', { exact: false }).fill('Guia do debate')
    await page.getByLabel('Link do documento').fill('https://example.com/guia.pdf')
    await page.getByRole('button', { name: 'Adicionar', exact: true }).click()
    await page.getByRole('button', { name: 'Confirmar cadastro' }).click()
    await expect(page.getByRole('link', { name: 'Guia do debate' })).toBeVisible()
    await page.getByRole('button', { name: 'Cronograma', exact: true }).click()
    await page.getByRole('button', { name: 'Adicionar cronograma +' }).click()
    await page.getByLabel('Tema').fill('Publicação da delegação')
    await page.getByLabel(/Descri/).fill('Publicar relatorio')
    await page.getByRole('button', { name: 'Postagem', exact: true }).click()
    await page.getByLabel('Data', { exact: false }).fill('2026-12-01')
    await page.getByRole('button', { name: 'Adicionar', exact: true }).click()
    await page.getByRole('button', { name: 'Confirmar cadastro' }).click()
    await expect(page.getByRole('heading', { name: 'Publicação da delegação' })).toBeVisible()
    expect(schedules[0].country).toEqual([1])
    await page.getByRole('button', { name: 'Notas', exact: true }).click()
    await expect(page.getByRole('heading', { name: /Notas em constru/ })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
