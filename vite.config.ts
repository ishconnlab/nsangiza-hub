import fs from 'node:fs/promises'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const PUBLIC_ROUTES = [
  '/',
  '/how-it-works',
  '/professionals',
  '/resources',
  '/safety',
  '/help/emergency',
  '/help/contact',
  '/join',
  '/privacy',
  '/terms',
]

/**
 * Injects absolute SEO metadata (canonical, Open Graph, JSON-LD, hreflang) at
 * build time and generates sitemap.xml + robots.txt in the output directory.
 * The public origin comes from VITE_SITE_URL.
 */
function seoPlugin(siteUrl: string): Plugin {
  const base = siteUrl.replace(/\/+$/, '')
  const absolute = (p: string) => `${base}${p}`
  let root = process.cwd()
  let outDir = 'dist'

  return {
    name: 'nsangiza-seo',
    configResolved(config) {
      root = config.root
      outDir = config.build.outDir
    },
    transformIndexHtml(html) {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Nsangiza Hub',
        url: absolute('/'),
        logo: absolute('/icons/icon-512.png'),
        description:
          'Nsangiza Hub connects people in Rwanda with trusted mental-health professionals, wellbeing resources and continued follow-up support.',
        areaServed: 'RW',
      }
      const tags: HtmlTagDescriptor[] = [
        { tag: 'link', attrs: { rel: 'canonical', href: absolute('/') }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: absolute('/') }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image', content: absolute('/icons/icon-512.png') }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Nsangiza Hub' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:image', content: absolute('/icons/icon-512.png') }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'alternate', hreflang: 'en', href: absolute('/') }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'alternate', hreflang: 'rw', href: absolute('/?lang=rw') }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'alternate', hreflang: 'fr', href: absolute('/?lang=fr') }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'alternate', hreflang: 'x-default', href: absolute('/') }, injectTo: 'head' },
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(jsonLd), injectTo: 'head' },
      ]
      return { html, tags }
    },
    async closeBundle() {
      const dist = path.resolve(root, outDir)
      const urls = PUBLIC_ROUTES.map((route) => {
        const priority = route === '/' ? '1.0' : '0.7'
        return `  <url><loc>${absolute(route)}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`
      }).join('\n')
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      const robots = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /app/',
        'Disallow: /professional/',
        'Disallow: /admin/',
        'Disallow: /onboarding',
        'Disallow: /api/',
        '',
        `Sitemap: ${absolute('/sitemap.xml')}`,
        '',
      ].join('\n')
      await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap)
      await fs.writeFile(path.join(dist, 'robots.txt'), robots)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = env.VITE_SITE_URL ?? 'http://localhost:5173'

  return {
    plugins: [
      react(),
      seoPlugin(siteUrl),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'offline.html', 'robots.txt'],
        manifest: {
          name: 'Nsangiza Hub | Your Safe Space to Talk',
          short_name: 'Nsangiza',
          description: 'Private, safe mental-health support for Rwanda — matched professionals, wellbeing tools, community and resources.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#0f766e',
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
        '/api': { target: 'http://localhost:4000', changeOrigin: true },
        '/uploads': { target: 'http://localhost:4000', changeOrigin: true },
      },
    },
  }
})
