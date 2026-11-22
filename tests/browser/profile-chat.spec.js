import { test, expect } from '@playwright/test'

for (const width of [320, 768, 1440]) {
  test(`profile notifications and chat flags fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.addInitScript(() => localStorage.setItem('access_token', 'test-access'))
    let unread = 2
    await page.route('**/api/**', async route => {
      const path = new URL(route.request().url()).pathname
      let data = { results: [], total_pages: 1 }
      if (path === '/api/usuarios/me/') data = {
        id: 7, name: 'Organizador', role: 'organizer', country: null,
        email: 'organizador@example.com',
      }
      if (path === '/api/mensagens/conversas/') data.results = [
        { id: 1, name: 'Brasil', unread_count: unread, flag: { url: '/logo-azul.svg' } },
        { id: 2, name: 'Portugal', unread_count: 0, flag: { url: '/logo-azul.svg' } },
      ]
      await route.fulfill({ json: data })
    })
    await page.goto('/perfil')
    await expect(page.getByText('Você tem 1 conversa com mensagens não lidas.')).toBeVisible()
    await expect(page.getByText('Você ainda está sem delegação')).toHaveCount(0)
    await page.getByRole('link', { name: 'Abrir chat' }).click()
    await expect(page.locator('.delegation-card')).toHaveCount(2)
    for (const card of await page.locator('.delegation-card').all()) {
      const info = await card.locator('.delegation-info').boundingBox()
      const flag = await card.locator('.delegation-flag').boundingBox()
      expect(Math.abs((info.y + info.height / 2) - (flag.y + flag.height / 2))).toBeLessThan(2)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    unread = 0
    await page.goto('/perfil')
    await expect(page.getByText('Sem notificações de conversas. Suas mensagens estão em dia.')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('profile selection offers a way out on a short mobile screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 480 })
  await page.route('**/api/**', route => route.fulfill({ json: { results: [] } }))
  await page.goto('/login')
  await page.getByRole('link', { name: 'Voltar ao mural' }).click()
  await expect(page).toHaveURL(/\/mural$/)
})
