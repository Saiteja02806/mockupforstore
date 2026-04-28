/**
 * Copies WebP (and PNG/JPG) from project /frames into /public/assets/frames
 * so Vite can serve them at /assets/frames/<filename>
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const srcDir = path.join(root, 'frames')
const destDir = path.join(root, 'public', 'assets', 'frames')

const exts = new Set(['.webp', '.png', '.jpg', '.jpeg'])

if (!fs.existsSync(srcDir)) {
  console.warn('No /frames directory at', srcDir)
  process.exit(0)
}

fs.mkdirSync(destDir, { recursive: true })

let n = 0
for (const name of fs.readdirSync(srcDir)) {
  const ext = path.extname(name).toLowerCase()
  if (!exts.has(ext)) continue
  fs.copyFileSync(path.join(srcDir, name), path.join(destDir, name))
  console.log('synced', name)
  n++
}

console.log(n ? `Done: ${n} file(s) -> public/assets/frames` : 'No matching assets in /frames')
