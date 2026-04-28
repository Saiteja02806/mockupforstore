import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'frames')

/** @returns {{w:number,h:number}|null} */
function webpDims(buf) {
  if (buf.length < 30 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null
  let o = 12
  while (o + 8 <= buf.length) {
    const tag = buf.toString('ascii', o, o + 4)
    const size = buf.readUInt32LE(o + 4)
    const start = o + 8
    const end = start + size + (size & 1) // RIFF padding
    if (tag === 'VP8X' && size >= 10) {
      const w = 1 + buf.readUIntLE(start + 4, 3)
      const h = 1 + buf.readUIntLE(start + 7, 3)
      return { w, h }
    }
    if (tag === 'VP8 ' && size >= 10) {
      // Keyframe: bytes 6-9 width (16-bit LE), 10-11 height (16-bit LE) — actually starts after 3-byte frame tag
      const w = buf.readUInt16LE(start + 6) & 0x3fff
      const h = buf.readUInt16LE(start + 8) & 0x3fff
      if (w > 0 && h > 0) return { w, h }
    }
    if (tag === 'VP8L' && size >= 5) {
      const bits = buf.readUInt32LE(start + 1)
      const w = 1 + (bits & 0x3fff)
      const h = 1 + ((bits >> 14) & 0x3fff)
      return { w, h }
    }
    o = end
  }
  return null
}

const exts = new Set(['.webp', '.png', '.jpg', '.jpeg'])
const out = {}
for (const name of fs.readdirSync(dir)) {
  const ext = path.extname(name).toLowerCase()
  if (!exts.has(ext)) continue
  const fp = path.join(dir, name)
  const buf = fs.readFileSync(fp)
  let dims = ext === '.webp' ? webpDims(buf) : null
  if (!dims && (ext === '.png' || ext === '.jpg' || ext === '.jpeg')) {
    // PNG: IHDR at byte 16, width 4 height 4
    if (ext === '.png' && buf.length >= 24 && buf.toString('ascii', 12, 16) === 'IHDR') {
      dims = { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
    }
  }
  out[name] = dims || { w: null, h: null }
}
console.log(JSON.stringify(out, null, 2))
