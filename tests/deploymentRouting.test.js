import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const { rewrites } = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

function destination(path) {
  const url = new URL(path, 'https://sinuca-ifc-mocha.vercel.app')
  for (const rule of rewrites) {
    const pattern = new RegExp(`^${rule.source}$`)
    if (pattern.test(url.pathname)) {
      return url.pathname.replace(pattern, rule.destination) + url.search
    }
  }
}

test('Vercel routes Django endpoints to the backend preserving trailing slashes and queries', () => {
  for (const path of [
    '/api/token/',
    '/api/token/refresh/',
    '/api/postagens/?page=1',
    '/api/usuarios/me/',
    '/api/registro/',
    '/api/auth/csrf/',
    '/api/token',
  ]) {
    assert.equal(destination(path), 'https://sinuca-backend.class.fabricadesoftware.ifc.edu.br' + path)
  }
})

test('Vercel keeps the SPA fallback for frontend pages', () => {
  for (const path of ['/mural', '/login', '/auth/callback']) {
    assert.equal(destination(path), '/index.html')
  }
})
