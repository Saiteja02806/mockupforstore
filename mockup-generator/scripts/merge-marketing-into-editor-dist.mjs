/**
 * After `vite build`, copy the Astro marketing static site into `dist/` so routes
 * like /blog/ exist on the same origin as the editor (Vercel only builds mockup-generator).
 * Skips marketing's root index.html so the Vite app's entry HTML stays at /.
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
    if (rel === 'index.html') return false
    return true
  },
})

console.log('[merge-marketing] Copied Astro marketing dist into editor dist/ (kept Vite root index.html)')

const blogIndex = join(viteDist, 'blog', 'index.html')
const blogOk = existsSync(blogIndex)
if (!blogOk) {
  console.error('[merge-marketing] FAIL: dist/blog/index.html missing — Astro blog did not merge (check marketing-site build + npm install --prefix ./marketing-site)')
  process.exit(1)
}

console.log('[merge-marketing] OK: dist/blog/index.html present')
