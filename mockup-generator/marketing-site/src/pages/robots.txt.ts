import type { APIRoute } from 'astro'

/** Required for `output: 'static'` — otherwise /robots.txt may not be written at build time. */
export const prerender = true

export const GET: APIRoute = ({ site }) => {
  let base = String(site || 'https://www.mockupeditor.site').replace(/\/$/, '')
  try {
    const u = new URL(base)
    if (u.hostname === 'mockupeditor.site') u.hostname = 'www.mockupeditor.site'
    base = u.origin
  } catch {
    base = 'https://www.mockupeditor.site'
  }
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${base}/sitemap-index.xml`,
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
