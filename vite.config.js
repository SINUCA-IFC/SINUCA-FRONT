import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: 'com.sinuca-pwa',
        name: 'SINUCA Site',
        short_name: 'SINUCA',
        description: 'Aplicativo de centralização de informação acerca do evento SINUCA',
        theme_color: '#4a90d9',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
         icons: [
           {
             src: '../public/logo-sinuca.svg',
             sizes: '192x192',
             type: 'image/svg+xml',
           },
           {
             src: '../public/logo-sinuca.svg',
             sizes: '512x512',
             type: 'image/svg+xml',
           },
           {
             src: '../public/logo-sinuca.svg',
             sizes: '512x512',
             type: 'image/svg+xml',
             purpose: 'maskable',
           },
         ],
      },
      devOptions: {
        enabled: true,
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
