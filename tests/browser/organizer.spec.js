import { test, expect } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`organizer manages delegations with confirmations at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'test-access')
      localStorage.setItem('refresh_token', 'test-refresh')
    })
    let countries = [{ id: 1, name: 'Brasil', political_name: 'República Federativa do Brasil' }]
    let deletions = 0
    await page.route('https://flagcdn.com/**', (route) =>
      route.fulfill({
        contentType: 'image/png',
        body: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuoAAAAASUVORK5CYII=',
          'base64',
        ),
      }),
    )
    await page.route('**/api/**', async (route) => {
      const req = route.request()
      const path = new URL(req.url()).pathname
      let data = { results: [], total_pages: 1 }
      if (path === '/api/usuarios/me/')
        data = { id: 7, name: 'Organizador', role: 'organizer', country: null }
      if (path === '/api/paises/') {
        if (req.method() === 'POST') {
          expect(req.postDataJSON().flag_attachment_key).toBe('flag-key')
          data = { ...req.postDataJSON(), id: 2 }
          countries.push(data)
        } else data = { results: countries, total_pages: 1 }
      }
      if (path === '/api/media/images/') data = { attachment_key: 'flag-key' }
      if (req.method() === 'DELETE') {
        deletions++
        countries = countries.filter((c) => c.id !== 2)
        return route.fulfill({ status: 204 })
      }
      await route.fulfill({ json: data })
    })
    await page.goto('/delegacao')
    await expect(page).toHaveURL(/\/organizador$/)
    await expect(
      page.getByRole('main').getByRole('heading', { name: 'Painel do Organizador' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Adicionar delegação' }).click()
    await page.getByLabel('Pesquisar país').fill('brasil')
    await expect(page.getByText('Nenhum país disponível para essa pesquisa.')).toBeVisible()
    await page.getByLabel('Pesquisar país').fill('republica portuguesa')
    await page.getByRole('button', { name: 'Portugal República Portuguesa' }).click()
    await expect(page.getByText(/Tem certeza que deseja adicionar/)).toBeVisible()
    await page.getByRole('button', { name: 'Confirmar cadastro' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Portugal', exact: true })).toBeVisible()
    await page.screenshot({ path: `test-results/organizer-${width}.png`, fullPage: true })
    await page.getByRole('button', { name: 'Excluir delegação Portugal' }).click()
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
    expect(deletions).toBe(0)
    await page.getByRole('button', { name: 'Excluir delegação Portugal' }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Excluir delegação', exact: true })
      .click()
    await expect(page.getByRole('heading', { name: 'Portugal', exact: true })).toHaveCount(0)
    expect(deletions).toBe(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
