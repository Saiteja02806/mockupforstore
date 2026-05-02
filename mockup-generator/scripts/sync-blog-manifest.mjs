/**
 * Copies blog Markdown from marketing-site into public/blog-posts/ (body only, no frontmatter)
 * and writes src/data/blogManifest.json for the in-app blog (same origin as the Vite app).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const editorRoot = join(__dirname, '..')
const blogSrc = join(editorRoot, 'marketing-site', 'src', 'content', 'blog')
const outPosts = join(editorRoot, 'public', 'blog-posts')
const dataDir = join(editorRoot, 'src', 'data')
const manifestPath = join(dataDir, 'blogManifest.json')

function parseMdFile(raw) {
  const trimmed = raw.trimStart()
  if (!trimmed.startsWith('---')) {
    return { data: {}, body: raw }
  }
  const end = trimmed.indexOf('\n---', 3)
  if (end === -1) {
    return { data: {}, body: raw }
  }
  const fm = trimmed.slice(3, end).trim()
  const body = trimmed.slice(end + 4).trimStart()
  const data = {}
  for (const line of fm.split(/\r?\n/)) {
    const m = line.match(/^([\w-]+):\s*(.*)$/)
    if (!m) continue
    let val = m[2].trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    data[m[1]] = val
  }
  return { data, body }
}

mkdirSync(dataDir, { recursive: true })
if (existsSync(outPosts)) {
  rmSync(outPosts, { recursive: true })
}
mkdirSync(outPosts, { recursive: true })

if (!existsSync(blogSrc)) {
  console.warn('[sync-blog] Missing blog source folder:', blogSrc)
  writeFileSync(manifestPath, `${JSON.stringify([], null, 2)}\n`)
  process.exit(0)
}

const entries = []
for (const name of readdirSync(blogSrc)) {
  if (extname(name).toLowerCase() !== '.md') continue
  const slug = basename(name, '.md')
  const filePath = join(blogSrc, name)
  const raw = readFileSync(filePath, 'utf8')
  const { data, body } = parseMdFile(raw)
  writeFileSync(join(outPosts, `${slug}.md`), body, 'utf8')
  entries.push({
    slug,
    title: data.title || slug,
    description: data.description || '',
    pubDate: data.pubDate || '',
    category: data.category || 'Guide',
    readingTime: data.readingTime || '',
  })
}

entries.sort((a, b) => String(b.pubDate).localeCompare(String(a.pubDate)))
writeFileSync(manifestPath, `${JSON.stringify(entries, null, 2)}\n`)
console.log('[sync-blog]', entries.length, 'post(s) → public/blog-posts + src/data/blogManifest.json')
