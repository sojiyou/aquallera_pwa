import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024
      },
      manifest: {
        name: 'Aqua-llera',
        short_name: 'Aqua-llera',
        description: 'Water Refilling Station Finder and Ordering App',
        theme_color: '#1a2a3a',
        background_color: '#f5f5f5',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
