import { test, expect } from '@playwright/test'
test.use({ timezoneId: 'America/Sao_Paulo' })

async function setup(
  page,
  { category = 2, role = 'organizer', multiDay = false, scheduleOverrides = {} } = {},
) {
  await page.addInitScript(() => localStorage.setItem('access_token', 'test'))
  const countries = [
    { id: 1, name: 'Brasil' },
    { id: 2, name: 'Chile' },
  ]
  const docs = [
    {
      id: 9,
      name: 'Guia compartilhado',
      url: 'https://example.com/guia',
      country: [1, 2],
      categories: [2, 3],
    },
  ]
  let schedule = {
    id: 10,
    title: 'Atividade existente',
    description: 'Descrição existente',
    category,
    startDate: '2026-12-01T13:15:30Z',
    endDate: multiDay ? '2026-12-03T15:45:30Z' : '2026-12-01T15:45:30Z',
    location: 'Auditório',
    tipo: category === 4 ? 2 : null,
    country: category === 2 ? [2, 1] : [1],
    docs: [9],
    ...scheduleOverrides,
  }
  const state = {
    patches: [],
    deletions: [],
    failDelete: false,
    failPatch: false,
    failDetail: false,
  }
  await page.route('**/api/**', async (route) => {
    const request = route.request(),
      path = new URL(request.url()).pathname,
      method = request.method()
    let data = { results: [], total_pages: 1 }
    if (path === '/api/usuarios/me/') data = { id: 7, name: 'Teste', role, country: countries[0] }
    if (/^\/api\/paises\/\d+\/?$/.test(path)) data = countries[Number(path.match(/\d+/)[0]) - 1]
    if (path === '/api/paises/') data.results = countries
    if (path === '/api/docs/') data.results = docs
    if (path === '/api/docs/9/') data = docs[0]
    if (path === '/api/cronogramas/') data.results = schedule ? [schedule] : []
    if (path === '/api/cronogramas/10/') {
      if (method === 'GET' && state.failDetail) return route.fulfill({ status: 500, json: {} })
      if (method === 'PATCH') {
        state.patches.push(request.postDataJSON())
        if (state.failPatch) return route.fulfill({ status: 500, json: {} })
        schedule = { ...schedule, ...request.postDataJSON() }
      }
      data = schedule
    }
    if (method === 'DELETE') {
      state.deletions.push(path)
      if (state.failDelete) return route.fulfill({ status: 500, json: {} })
      if (path === '/api/cronogramas/10/') schedule = null
      if (path === '/api/docs/9/') docs.splice(0)
      return route.fulfill({ status: 204 })
    }
    await route.fulfill({ json: data })
  })
  await page.goto(role === 'organizer' ? '/organizador/delegacoes/1' : '/delegacao')
  return state
}

for (const width of [390, 1440]) {
  test(`edits a prefilled schedule and updates the list at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const state = await setup(page)
    await page.getByRole('button', { name: 'Cronograma', exact: true }).click()
    await page.getByRole('button', { name: 'Editar cronograma Atividade existente' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Editar cronograma' })).toBeVisible()
    await expect(page.getByRole('dialog').getByLabel('Tema')).toHaveValue('Atividade existente')
    await expect(page.getByLabel(/Descrição/)).toHaveValue('Descrição existente')
    await expect(page.getByLabel('Segundo país')).toHaveValue('2')
    await expect(page.getByLabel('Horário inicial')).toHaveValue('10:15')
    await expect(page.getByLabel('Horário final')).toHaveValue('12:45')
    await expect(page.getByLabel('Data', { exact: false })).toHaveValue('2026-12-01')
    await expect(page.getByLabel('Local')).toHaveValue('Auditório')
    await expect(page.getByLabel('Guia compartilhado')).toBeChecked()
    await page.getByRole('dialog').getByLabel('Tema').fill('Tema atualizado')
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
    await page.getByRole('button', { name: 'Cancelar confirmação' }).click()
    await expect(page.getByRole('dialog').getByLabel('Tema')).toHaveValue('Tema atualizado')
    expect(state.patches).toHaveLength(0)
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
    await page.getByRole('button', { name: 'Confirmar alterações' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Tema atualizado' })).toBeVisible()
    expect(state.patches).toEqual([
      {
        title: 'Tema atualizado',
        description: 'Descrição existente',
        category: 2,
        startDate: '2026-12-01T13:15:30Z',
        endDate: '2026-12-01T15:45:30Z',
        location: 'Auditório',
        tipo: null,
        country: [2, 1],
        docs: [9],
      },
    ])
    await page.getByRole('button', { name: 'Editar cronograma Tema atualizado' }).click()
    await page.getByRole('dialog').getByLabel('Tema').fill('Descartar')
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
    expect(state.patches).toHaveLength(1)
    await expect(page.getByRole('heading', { name: 'Tema atualizado' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })

  for (const kind of ['cronograma', 'documento']) {
    test(`confirms ${kind} deletion, retains it on error and allows retry at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      const state = await setup(page)
      await page
        .getByRole('button', {
          name: kind === 'cronograma' ? 'Cronograma' : 'Documentos',
          exact: true,
        })
        .click()
      const name = kind === 'cronograma' ? 'Atividade existente' : 'Guia compartilhado'
      const remove = page
        .getByRole('button', { name: `Remover ${kind} ${name}`, exact: true })
        .first()
      await remove.click()
      await expect(page.getByRole('dialog')).toContainText('todas as delegações')
      await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
      expect(state.deletions).toHaveLength(0)
      await remove.click()
      state.failDelete = true
      await page.getByRole('button', { name: 'Confirmar remoção' }).click()
      await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible()
      await expect(remove).toBeAttached()
      state.failDelete = false
      await page.getByRole('button', { name: 'Confirmar remoção' }).click()
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await expect(remove).toHaveCount(0)
      expect(state.deletions).toEqual(
        Array(2).fill(kind === 'cronograma' ? '/api/cronogramas/10/' : '/api/docs/9/'),
      )
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    })
  }
}

for (const category of [1, 3, 4]) {
  test(`preserves dates, category and presentation type when editing category ${category}`, async ({
    page,
  }) => {
    const state = await setup(page, { category, multiDay: true })
    await page.getByRole('button', { name: 'Cronograma', exact: true }).click()
    await page.getByRole('button', { name: 'Editar cronograma Atividade existente' }).click()
    await expect(page.getByLabel('Data final')).toHaveValue('2026-12-03')
    if (category === 4) await expect(page.getByLabel('Categoria de apresentação')).toHaveValue('2')
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
    await page.getByRole('button', { name: 'Confirmar alterações' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    expect(state.patches[0]).toMatchObject({
      category,
      startDate: '2026-12-01T13:15:30Z',
      endDate: '2026-12-03T15:45:30Z',
      tipo: category === 4 ? 2 : null,
      docs: [9],
    })
  })
}

test('failed loading prevents editing; failed saving retains the draft', async ({ page }) => {
  const state = await setup(page)
  state.failDetail = true
  await page.getByRole('button', { name: 'Cronograma', exact: true }).click()
  await page.getByRole('button', { name: 'Editar cronograma Atividade existente' }).click()
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible()
  await expect(page.getByRole('dialog').getByLabel('Tema')).toHaveCount(0)
  state.failDetail = false
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click()
  await page.getByRole('dialog').getByLabel('Tema').fill('Rascunho')
  await page.getByLabel('Horário final').fill('09:00')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('posterior')
  expect(state.patches).toHaveLength(0)
  await page.getByLabel('Horário final').fill('14:00')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  state.failPatch = true
  await page.getByRole('button', { name: 'Confirmar alterações' }).click()
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar confirmação' }).click()
  await expect(page.getByRole('dialog').getByLabel('Tema')).toHaveValue('Rascunho')
  state.failPatch = false
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await page.getByRole('button', { name: 'Confirmar alterações' }).click()
  await expect(page.getByRole('heading', { name: 'Rascunho' })).toBeVisible()
})

test('students can read resources without management actions', async ({ page }) => {
  await setup(page, { role: 'student' })
  await page.getByRole('button', { name: 'Cronograma', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Atividade existente' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Editar cronograma|Remover cronograma/ }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Documentos', exact: true }).click()
  await expect(page.getByRole('link', { name: /Guia compartilhado/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /Remover documento/ })).toHaveCount(0)
})

for (const [category, tipo] of [
  [1, 2],
  [3, 2],
  [4, null],
]) {
  test(`editing category ${category} preserves hidden or unset fields`, async ({ page }) => {
    const state = await setup(page, { category, scheduleOverrides: { tipo } })
    await page.getByRole('button', { name: 'Cronograma', exact: true }).click()
    await page.getByRole('button', { name: 'Editar cronograma Atividade existente' }).click()
    await page.getByRole('dialog').getByLabel('Tema').fill('Apenas título')
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
    await page.getByRole('button', { name: 'Confirmar alterações' }).click()
    await expect(page.getByRole('heading', { name: 'Apenas título' })).toBeVisible()
    expect(state.patches[0]).toMatchObject({ location: 'Auditório', tipo })
  })
}

test('editing a debate with one country saves the selected opponent', async ({ page }) => {
  const state = await setup(page, { scheduleOverrides: { country: [1] } })
  await page.getByRole('button', { name: 'Cronograma', exact: true }).click()
  await page.getByRole('button', { name: 'Editar cronograma Atividade existente' }).click()
  await page.getByLabel('Segundo país').selectOption('2')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  await page.getByRole('button', { name: 'Confirmar alterações' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(state.patches[0].country).toEqual([1, 2])
})
