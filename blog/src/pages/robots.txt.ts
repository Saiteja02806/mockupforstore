import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) => {
  const base = String(site || 'https://www.mockupeditor.site').replace(/\/$/, '')
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
