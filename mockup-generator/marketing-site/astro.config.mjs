import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

/** Canonical host is www — normalize apex so builds never emit apex-only URLs if PUBLIC_SITE_URL was mis-set in CI/Vercel. */
function canonicalSiteOrigin() {
  const raw = process.env.PUBLIC_SITE_URL || 'https://www.mockupeditor.site'
  try {
    const u = new URL(raw)
    if (u.hostname === 'mockupeditor.site') u.hostname = 'www.mockupeditor.site'
    return u.origin
  } catch {
    return 'https://www.mockupeditor.site'
  }
}

export default defineConfig({
  site: canonicalSiteOrigin(),
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
