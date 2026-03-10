// @ts-check
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import partytown from '@astrojs/partytown'

const SITE_URL = 'https://webdesigner.sakaybrile.uk'

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  adapter: cloudflare({ platformProxy: { enabled: true } }),

  integrations: [
    react(),
    mdx(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      customPages: [
        `${SITE_URL}/services/creation-site-vitrine/`,
        `${SITE_URL}/services/creation-site-ecommerce/`,
        `${SITE_URL}/services/referencement-seo/`,
      ],
    }),
    partytown({
      config: { forward: ['dataLayer.push'] },
    }),
  ],

  image: {
    service: { entrypoint: 'astro/assets/services/compile' },
    domains: ['webdesigner.sakaybrile.uk'],
  },

  // View Transitions activées globalement
  experimental: {},

  vite: {
    build: { cssMinify: true },
  },
})
