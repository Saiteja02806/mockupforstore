/**
 * Vercel/production guard: after vite build + merge, ensure in-app blog static assets exist in dist/.
 * sync-blog runs earlier in the pipeline; vite copies public/blog-posts → dist/blog-posts.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const editorRoot = join(__dirname, '..')
const manifestPath = join(editorRoot, 'src', 'data', 'blogManifest.json')
const postsDir = join(editorRoot, 'dist', 'blog-posts')

let manifest = []
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
} catch {
  console.error('[verify-in-app-blog] FAIL: could not read src/data/blogManifest.json')
  process.exit(1)
}

if (!Array.isArray(manifest)) {
  console.error('[verify-in-app-blog] FAIL: blogManifest.json must be a JSON array')
  process.exit(1)
}

if (manifest.length === 0) {
  console.log('[verify-in-app-blog] manifest has 0 entries — skipping dist/blog-posts count check')
  process.exit(0)
}

if (!existsSync(postsDir)) {
  console.error(
    '[verify-in-app-blog] FAIL: dist/blog-posts missing — ensure sync-blog runs before vite build',
  )
  process.exit(1)
}

const mdFiles = readdirSync(postsDir).filter((f) => f.toLowerCase().endsWith('.md'))
if (mdFiles.length < manifest.length) {
  console.error(
    `[verify-in-app-blog] FAIL: manifest has ${manifest.length} posts but dist/blog-posts has ${mdFiles.length} .md file(s)`,
  )
  process.exit(1)
}

for (const entry of manifest) {
  const file = `${entry.slug}.md`
  if (!existsSync(join(postsDir, file))) {
    console.error(`[verify-in-app-blog] FAIL: missing dist/blog-posts/${file}`)
    process.exit(1)
  }
}

console.log(
  `[verify-in-app-blog] OK: ${manifest.length} post(s) present under dist/blog-posts/ (Vercel static)`,
)
