import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const { VITE_API_BASE_URL } = loadEnv(mode, process.cwd(), 'VITE_')
  if (command === 'build' && mode !== 'development') {
    const { VITE_API_BASE_URL } = loadEnv(mode, process.cwd(), 'VITE_')
    let url
    try {
      url = new URL(VITE_API_BASE_URL)
    } catch {
      // The message below also covers a missing or malformed URL.
    }
    if (
      url?.protocol !== 'https:' ||
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
      !['/', '/api', '/api/'].includes(url.pathname) ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    ) {
      throw new Error(
        'Configure VITE_API_BASE_URL com a origem HTTPS pÃºblica do backend antes do deploy.',
      )
    }
  }

  return {
    server: {
      proxy: {
        '/api': {
          target: (VITE_API_BASE_URL || 'https://sinuca-backend.class.fabricadesoftware.ifc.edu.br').replace(/\/api\/?$/, ''),
          changeOrigin: true,
        },
      },
    },
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',
        devOptions: { enabled: false },
        manifest: {
          id: 'com.sinuca-pwa',
          name: 'SINUCA Site',
          short_name: 'SINUCA',
          description: 'Aplicativo do evento SINUCA',
          theme_color: '#4a90d9',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/logo-app192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/logo-app512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/logo-app512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
      ...(command === 'serve' ? [vueDevTools()] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
