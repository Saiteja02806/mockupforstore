import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, relative, resolve } from 'node:path'

const root = resolve(process.cwd(), 'dist')
const port = Number(process.env.PORT || 4321)
const host = process.env.HOST || '127.0.0.1'

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

function isPathInsideDist(filePath) {
  const rel = relative(root, resolve(filePath))
  return rel === '' || (!rel.startsWith('..') && rel !== '..')
}

createServer((req, res) => {
  const pathname = decodeURIComponent((req.url || '/').split('?')[0])
  // Strip leading "/" so path.join(root, ...) stays under dist on Windows.
  // join("C:\\...\\dist", "/blog/x") would incorrectly resolve to "C:\\blog\\x".
  const underRoot = pathname.replace(/^\/+/, '').replace(/\/+$/, '')

  let file =
    underRoot === '' ? join(root, 'index.html') : join(root, underRoot)

  if (!isPathInsideDist(file)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  if (existsSync(file) && statSync(file).isDirectory()) {
    file = join(file, 'index.html')
  }

  if (!existsSync(file) && !extname(file)) {
    const asDir = join(root, underRoot, 'index.html')
    if (isPathInsideDist(asDir) && existsSync(asDir)) {
      file = asDir
    }
  }

  if (!existsSync(file)) {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
}).listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}/`)
})
