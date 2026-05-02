import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const dir = path.join(process.cwd(), 'public', 'frames', 'circular courosel')

if (!existsSync(dir)) {
  console.warn(`optimize-landing-carousel-webp: skip (missing ${dir})`)
  process.exit(0)
}

const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'))

for (const file of files) {
  const input = path.join(dir, file)
  const output = path.join(dir, file.replace(/\.png$/i, '.webp'))
  await sharp(input).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output)
}

console.log(`optimize-landing-carousel-webp: wrote ${files.length} webp file(s) next to png sources`)
