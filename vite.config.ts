import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'offline.html', 'robots.txt'],
      manifest: {
        name: 'Nsangiza Hub — Your Safe Space to Talk',
        short_name: 'Nsangiza',
        description: 'Safe, private digital psychological and mental-health support for Rwanda — talk, learn and feel supported.',
        id: '/',
        theme_color: '#2F6B4F',
        background_color: '#F8FAF8',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['health', 'wellness', 'lifestyle'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
        shortcuts: [
          { name: 'Check in', short_name: 'Check-in', url: '/app/check-in', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Messages', short_name: 'Messages', url: '/app/messages', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/professionals/,
            handler: 'NetworkFirst',
            options: { cacheName: 'professionals-api', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 5 } },
          },
          {
            urlPattern: /\/api\/v1\/resources/,
            handler: 'NetworkFirst',
            options: { cacheName: 'resources-api', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 10 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})