// @ts-check
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import keystatic from '@keystatic/astro'
import react from '@astrojs/react'

export default defineConfig({
  site: 'https://blog.sakaybrile.uk',
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [
    react(),
    sitemap(),
    keystatic(),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/compile' },
  },
})
