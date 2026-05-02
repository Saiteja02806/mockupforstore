import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const repoRoot = resolve(process.cwd(), '..')
const editorRoot = [resolve(repoRoot, 'editor'), resolve(repoRoot, 'mockup-generator')].find((dir) =>
  existsSync(resolve(dir, 'package.json')),
)

if (!editorRoot) {
  console.error('Editor package not found: expected ../editor or ../mockup-generator with package.json')
  process.exit(1)
}

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

if (!existsSync(vectorSourceDir)) {
  console.error(`Frame source not found: ${vectorSourceDir}`)
  process.exit(1)
}

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

console.log(`Synced frame assets from ${vectorSourceDir} -> ${vectorTargetDir} (editor root: ${editorRoot})`)
if (existsSync(rasterSourceDir)) {
  console.log(`Synced raster assets from ${rasterSourceDir} -> ${rasterTargetDir}`)
}
for (const item of heroSources) {
  if (existsSync(item.source)) {
    console.log(`Synced ${item.label} from ${item.source} -> ${item.target}`)
  }
}
