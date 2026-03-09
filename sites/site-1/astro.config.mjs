// @ts-check
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import keystatic from '@keystatic/astro'

export default defineConfig({
  site: 'https://sakaybrile.uk',
  output: 'static',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [
    sitemap(),
    keystatic(),
  ],
  image: {
    service: { entrypoint: 'astro/assets/services/compile' },
  },
})
