/**
 * After `vite build`, copy the Astro marketing static site into `dist/` so routes
 * like /blog/ exist on the same origin as the editor (Vercel only builds mockup-generator).
 * Skips marketing's root index.html so the Vite app's entry HTML stays at /.
 */
import { appendFileSync, cpSync, existsSync, mkdirSync } from 'fs'
import { dirname, join, normalize, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const editorRoot = join(__dirname, '..')
const marketingDist = join(editorRoot, '..', 'marketing', 'dist')
const viteDist = join(editorRoot, 'dist')

if (!existsSync(viteDist)) {
  console.error('[merge-marketing] dist/ missing — run vite build first')
  process.exit(1)
}
if (!existsSync(marketingDist)) {
  console.error('[merge-marketing] ../marketing/dist missing — run astro build in marketing/ first')
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
  console.error('[merge-marketing] FAIL: dist/blog/index.html missing — Astro blog did not merge (check marketing build + install ../marketing deps)')
  process.exit(1)
}

// #region agent log (build verification NDJSON for debug session 8707e8)
try {
  const logDir = join(editorRoot, '..', '.cursor')
  mkdirSync(logDir, { recursive: true })
  appendFileSync(
    join(logDir, 'debug-8707e8.log'),
    `${JSON.stringify({
      sessionId: '8707e8',
      location: 'merge-marketing-into-editor-dist.mjs',
      message: 'post-merge blog smoke check',
      data: { blogIndexExists: blogOk, blogIndexPath: blogIndex },
      timestamp: Date.now(),
      hypothesisId: 'H-vercel-install-merge',
    })}\n`,
  )
} catch {
  /* ignore missing .cursor on CI */
}
// #endregion

console.log('[merge-marketing] OK: dist/blog/index.html present')
