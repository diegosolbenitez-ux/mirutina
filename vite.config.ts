import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Ejercicio Elemental',
        short_name: 'Workout',
        description: 'App de progreso de entrenamiento',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-292.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-612.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})