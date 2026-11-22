import { test } from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import CountryService from '../src/services/countryService.js'
import { apiOrigin } from '../src/services/authService.js'

test('country flags use the API origin after creation, listing and detail', async (t) => {
  const country = { id: 1, name: 'Brasil', flag: { url: '/media/images/br.png', description: 'Brasil' } }
  t.mock.method(axios, 'post', async () => ({ data: country }))
  t.mock.method(axios, 'get', async url => ({ data: url === '/paises/' ? { results: [country], total_pages: 2 } : country }))
  const service = new CountryService()
  const created = await service.createCountry({ name: 'Brasil' })
  const listed = await service.getAllCountrys()
  const detail = await service.getCountry(1)
  for (const item of [created, listed.results[0], detail]) {
    assert.equal(item.flag.url, `${apiOrigin}/media/images/br.png`)
    assert.equal(item.flag.description, 'Brasil')
  }
  assert.equal(listed.total_pages, 2)
  assert.equal(country.flag.url, '/media/images/br.png')
})

test('preserves Cloudinary URLs and countries without a flag', async (t) => {
  const countries = [
    { id: 1, flag: { url: 'https://res.cloudinary.com/demo/image/upload/br.png' } },
    { id: 2, flag: null },
  ]
  t.mock.method(axios, 'get', async () => ({ data: { results: countries, total_pages: 1 } }))
  assert.deepEqual((await new CountryService().getAllCountrys()).results, countries)
})
