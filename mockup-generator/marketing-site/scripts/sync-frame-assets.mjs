import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

/** Editor app root: walk up from marketing-site until package.json + public/frames, else sibling mockup-generator. */
function findEditorRoot() {
  let dir = process.cwd()
  for (let i = 0; i < 8; i++) {
    const pkg = resolve(dir, 'package.json')
    const frames = resolve(dir, 'public', 'frames')
    if (existsSync(pkg) && existsSync(frames)) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  const workspaceRoot = resolve(process.cwd(), '..')
  for (const name of ['mockup-generator', 'editor']) {
    const cand = resolve(workspaceRoot, name)
    if (
      existsSync(resolve(cand, 'package.json')) &&
      existsSync(resolve(cand, 'public', 'frames'))
    )
      return cand
  }
  console.error(
    'Editor package not found: expected ancestor or sibling with package.json and public/frames',
  )
  process.exit(1)
}

const editorRoot = findEditorRoot()

const vectorSourceDir = resolve(editorRoot, 'public', 'frames')
const vectorTargetDir = resolve(process.cwd(), 'public', 'frame-assets')
const rasterSourceDir = resolve(editorRoot, 'public', 'assets', 'frames')
const rasterTargetDir = resolve(process.cwd(), 'public', 'assets', 'frames')
const heroSources = [
  {
    label: 'phone hero assets',
    source: resolve(editorRoot, 'public', 'phonesforhero'),
    target: resolve(process.cwd(), 'public', 'hero-assets', 'phones'),
  },
  {
    label: 'tablet hero assets',
    source: resolve(editorRoot, 'public', 'phonesforhero', 'tabsforhero'),
    target: resolve(process.cwd(), 'public', 'hero-assets', 'tablets'),
  },
  {
    label: 'laptop hero assets',
    source: resolve(editorRoot, 'public', 'frames', 'laptop', 'laptopforhero'),
    target: resolve(process.cwd(), 'public', 'hero-assets', 'laptops'),
  },
]

const legacyLogoSrc = resolve(
  process.cwd(),
  'public',
  'frame-assets',
  'circular courosel',
  'logo',
  'Screenshot 2026-04-25 231338-modified.png',
)
const marketingFavicon = resolve(process.cwd(), 'public', 'favicon.png')

/** Copy real logo to favicon before frame-assets may be replaced (legacy path lives under frame-assets). */
function syncFaviconFiles() {
  if (existsSync(legacyLogoSrc)) {
    copyFileSync(legacyLogoSrc, marketingFavicon)
    console.log(`Synced favicon.png from ${legacyLogoSrc}`)
  }
  const editorPublic = resolve(editorRoot, 'public')
  if (existsSync(marketingFavicon) && existsSync(editorPublic)) {
    copyFileSync(marketingFavicon, resolve(editorPublic, 'favicon.png'))
    console.log(`Copied favicon.png to ${editorPublic}`)
  }
}

async function emitHeroWebp(dir) {
  if (!existsSync(dir)) return
  const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'))
  for (const file of files) {
    const input = resolve(dir, file)
    const output = resolve(dir, file.replace(/\.png$/i, '.webp'))
    await sharp(input).resize({ width: 520, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output)
  }
}

if (!existsSync(vectorSourceDir)) {
  console.error(`Frame source not found: ${vectorSourceDir}`)
  process.exit(1)
}

syncFaviconFiles()

rmSync(vectorTargetDir, { recursive: true, force: true })
mkdirSync(vectorTargetDir, { recursive: true })
cpSync(vectorSourceDir, vectorTargetDir, { recursive: true })

if (existsSync(rasterSourceDir)) {
  rmSync(rasterTargetDir, { recursive: true, force: true })
  mkdirSync(resolve(process.cwd(), 'public', 'assets'), { recursive: true })
  cpSync(rasterSourceDir, rasterTargetDir, { recursive: true })
}

for (const item of heroSources) {
  if (!existsSync(item.source)) continue
  rmSync(item.target, { recursive: true, force: true })
  mkdirSync(item.target, { recursive: true })
  cpSync(item.source, item.target, { recursive: true })
}

for (const item of heroSources) {
  if (existsSync(item.source)) {
    await emitHeroWebp(item.target)
    console.log(`Wrote WebP variants for ${item.label}`)
  }
}

syncFaviconFiles()

console.log(`Synced frame assets from ${vectorSourceDir} -> ${vectorTargetDir} (editor root: ${editorRoot})`)
if (existsSync(rasterSourceDir)) {
  console.log(`Synced raster assets from ${rasterSourceDir} -> ${rasterTargetDir}`)
}
for (const item of heroSources) {
  if (existsSync(item.source)) {
    console.log(`Synced ${item.label} from ${item.source} -> ${item.target}`)
  }
}
