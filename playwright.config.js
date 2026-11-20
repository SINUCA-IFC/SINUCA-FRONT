import { defineConfig } from '@playwright/test'

const testOrigin = 'http://localhost:4174'

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: testOrigin,
    channel: 'chrome',
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'npm run dev -- --host localhost --port 4174 --strictPort',
    url: testOrigin,
    env: { VITE_API_BASE_URL: 'http://localhost:8000' },
    reuseExistingServer: false,
  },
})
