/**
 * Removes embedded feDropShadow filters from public/dist vector frame SVGs.
 * Run: node scripts/strip-frame-svg-filters.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function strip(s) {
  let out = s.replace(/\r\n/g, '\n')
  out = out.replace(/\n[ \t]*<filter\b[^>]*>[\s\S]*?<\/filter>[ \t]*\n/g, '\n')
  out = out.replace(/ filter="url\(#[^)]+\)"/g, '')
  return out
}

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.svg')) {
      const raw = fs.readFileSync(p, 'utf8')
      const next = strip(raw)
      if (next !== raw) {
        fs.writeFileSync(p, next)
        console.log('stripped', path.relative(root, p))
      }
    }
  }
}

walk(path.join(root, 'public', 'frames'))
walk(path.join(root, 'dist', 'frames'))
console.log('done')
