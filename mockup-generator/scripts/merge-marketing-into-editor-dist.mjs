/**
 * After `vite build`, copy the Astro marketing site into `dist/` (SEO pages, frames, etc.).
 * Skips root `index.html` (Vite shell) and skips `/blog/**` so React + vercel.json rewrites own /blog/*.
 */
import { cpSync, existsSync } from 'fs'
import { dirname, join, normalize, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const editorRoot = join(__dirname, '..')
const marketingDist = join(editorRoot, 'marketing-site', 'dist')
const viteDist = join(editorRoot, 'dist')

if (!existsSync(viteDist)) {
  console.error('[merge-marketing] dist/ missing — run vite build first')
  process.exit(1)
}
if (!existsSync(marketingDist)) {
  console.error('[merge-marketing] marketing-site/dist missing — run astro build in mockup-generator/marketing-site first')
  process.exit(1)
}

cpSync(marketingDist, viteDist, {
  recursive: true,
  filter: (src) => {
    const rel = normalize(relative(marketingDist, src))
    const posix = rel.replace(/\\/g, '/')
    if (posix === 'index.html') return false
    /* React SPA owns /blog/* (vercel.json rewrites → index.html). Do not ship Astro /blog HTML. */
    if (posix === 'blog' || posix.startsWith('blog/')) return false
    return true
  },
})

console.log('[merge-marketing] Copied Astro marketing dist into editor dist/ (skipped root index + /blog/* for SPA blog)')
