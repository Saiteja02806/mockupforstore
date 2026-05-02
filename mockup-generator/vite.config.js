import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Dev / preview: same as Vercel rewrites — serve SPA shell for /blog routes */
function spaBlogRoutes() {
  return {
    name: 'spa-blog-routes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url?.split('?')[0] ?? ''
        const isBlogApp =
          raw === '/blog' ||
          raw === '/blog/' ||
          (raw.startsWith('/blog/') && !raw.startsWith('/blog-posts'))
        if (req.method === 'GET' && isBlogApp) req.url = '/index.html'
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url?.split('?')[0] ?? ''
        const isBlogApp =
          raw === '/blog' ||
          raw === '/blog/' ||
          (raw.startsWith('/blog/') && !raw.startsWith('/blog-posts'))
        if (req.method === 'GET' && isBlogApp) req.url = '/index.html'
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), react(), spaBlogRoutes()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        vanilla: path.resolve(__dirname, 'vanilla.html'),
      },
    },
  },
})
