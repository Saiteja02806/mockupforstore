import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const vectorSourceDir = resolve(process.cwd(), '..', 'mockup-generator', 'public', 'frames')
const vectorTargetDir = resolve(process.cwd(), 'public', 'frame-assets')
const rasterSourceDir = resolve(process.cwd(), '..', 'mockup-generator', 'public', 'assets', 'frames')
const rasterTargetDir = resolve(process.cwd(), 'public', 'assets', 'frames')
const heroSources = [
  {
    label: 'phone hero assets',
    source: resolve(process.cwd(), '..', 'mockup-generator', 'public', 'phonesforhero'),
    target: resolve(process.cwd(), 'public', 'hero-assets', 'phones'),
  },
  {
    label: 'tablet hero assets',
    source: resolve(process.cwd(), '..', 'mockup-generator', 'public', 'phonesforhero', 'tabsforhero'),
    target: resolve(process.cwd(), 'public', 'hero-assets', 'tablets'),
  },
  {
    label: 'laptop hero assets',
    source: resolve(process.cwd(), '..', 'mockup-generator', 'public', 'frames', 'laptop', 'laptopforhero'),
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

console.log(`Synced frame assets from ${vectorSourceDir} -> ${vectorTargetDir}`)
if (existsSync(rasterSourceDir)) {
  console.log(`Synced raster assets from ${rasterSourceDir} -> ${rasterTargetDir}`)
}
for (const item of heroSources) {
  if (existsSync(item.source)) {
    console.log(`Synced ${item.label} from ${item.source} -> ${item.target}`)
  }
}
