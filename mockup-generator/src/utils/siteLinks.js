const DEFAULT_MARKETING_ORIGIN = 'https://www.mockupeditor.site'

/** True when the editor/marketing app is served from loopback (incl. IPv6). */
export function isLoopbackMarketingHost(hostname) {
  const h = String(hostname || '').toLowerCase()
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]'
}

export function getMarketingHomeUrl() {
  // Set VITE_MARKETING_SITE_URL in .env.local to override for any environment.
  // Locally: Astro runs on port 4321 (`npm run dev` in mockup-generator/marketing-site).
  // If that server is not running you will get "site can't be reached" for the Home link.
  const configured = import.meta.env.VITE_MARKETING_SITE_URL
  if (configured) return configured

  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (isLoopbackMarketingHost(hostname)) {
      return 'http://127.0.0.1:4321'
    }
    return DEFAULT_MARKETING_ORIGIN
  }

  return DEFAULT_MARKETING_ORIGIN
}

/**
 * External-style blog URL (legacy). Prefer same-origin `/blog/` via MarketingHome links.
 */
export function getMarketingBlogUrl() {
  const configured = import.meta.env.VITE_MARKETING_SITE_URL
  if (configured) {
    const base = String(configured).replace(/\/$/, '')
    return `${base}/blog/`
  }

  /*
   * Loopback without VITE_MARKETING_SITE_URL: never use getMarketingHomeUrl()'s :4321 here — it breaks when
   * Astro isn't running (ERR_CONNECTION_REFUSED). Applies in dev and vite preview (import.meta.env.DEV may be false).
   */
  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (isLoopbackMarketingHost(hostname)) {
      return `${DEFAULT_MARKETING_ORIGIN.replace(/\/$/, '')}/blog/`
    }
  }

  const base = getMarketingHomeUrl().replace(/\/$/, '')
  return `${base}/blog/`
}

/**
 * Pathname under BASE_URL: `/blog` or `/blog/slug` → list vs slug object.
 * Returns `null` if URL is not the in-app blog route.
 */
export function getBlogPathMatch(pathname) {
  let p = String(pathname || '').replace(/\/+$/, '') || '/'
  const base = String(import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  if (base !== '/' && p.startsWith(base)) {
    p = p.slice(base.length) || '/'
    if (!p.startsWith('/')) p = `/${p}`
  }
  if (p === '/blog') return 'list'
  if (p.startsWith('/blog/')) {
    const slug = decodeURIComponent(p.slice('/blog/'.length).replace(/\/+$/, ''))
    return slug ? { slug } : 'list'
  }
  return null
}

/** Current slug from `/blog/:slug` or hash `#blog/:slug` (hash fallback for old links). */
export function getBlogSlugFromLocation() {
  if (typeof window === 'undefined') return null
  const match = getBlogPathMatch(window.location.pathname)
  if (match && typeof match === 'object') return match.slug
  const h = (window.location.hash || '').replace(/^#\/?/, '')
  if (h.startsWith('blog/')) {
    const s = decodeURIComponent(h.slice(5).replace(/\/+$/, ''))
    return s || null
  }
  return null
}

/** Matches App routing: landing vs in-app blog (/blog or #blog) vs studio. Safe before React mounts. */
export function getInitialAppPage() {
  if (typeof window === 'undefined') return 'landing'
  if (getBlogPathMatch(window.location.pathname) !== null) return 'blog'
  const h = (window.location.hash || '').replace(/^#\/?/, '')
  if (h === 'blog' || h.startsWith('blog/')) return 'blog'
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('studio') === '1') return 'studio'
  } catch {
    /* ignore */
  }
  if (window.location.hash === '#studio') return 'studio'
  return 'landing'
}

/** Logo / Home in the editor: external marketing URL, or in-app handler when the landing page is embedded. */
export function homeNavProps(onGoHome) {
  if (typeof onGoHome === 'function') {
    return {
      href: '#',
      onClick: (e) => {
        e.preventDefault()
        onGoHome()
      },
    }
  }
  return { href: getMarketingHomeUrl() }
}
