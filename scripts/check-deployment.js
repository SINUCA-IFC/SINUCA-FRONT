// Run after deploying: node scripts/check-deployment.js https://sinuca-ifc-mocha.vercel.app
const origin = new URL(process.argv[2] || 'http://localhost:5173').origin
const checks = [
  { path: '/api/postagens/?page=1', status: 200 },
  { path: '/api/token/', status: 400, method: 'POST', body: '{}' },
]

for (const check of checks) {
  const response = await fetch(origin + check.path, {
    method: check.method || 'GET',
    body: check.body,
    headers: check.body ? { 'Content-Type': 'application/json' } : {},
    redirect: 'manual',
    signal: AbortSignal.timeout(20000),
  })
  const type = response.headers.get('content-type') || ''
  if (response.status !== check.status || !type.includes('application/json')) {
    throw new Error(
      `${check.path}: HTTP ${response.status}, ${type || 'sem Content-Type'}. ` +
        `Esperado HTTP ${check.status} com JSON do backend. Confira o rewrite publicado.`,
    )
  }
  await response.json()
  console.log(`OK ${check.method || 'GET'} ${origin}${check.path}: JSON, HTTP ${response.status}`)
}
