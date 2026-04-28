import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://mockupstudio.app',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  server: {
    port: 4321,
    strictPort: true,
    // Listen on all interfaces so localhost / 127.0.0.1 / LAN hostname all reach dev.
    host: true,
  },
})
