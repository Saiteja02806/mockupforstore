const DEFAULT_MARKETING_ORIGIN = 'https://mockupeditor.site'

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
 * External canonical blog URL (SEO / Astro deploy). In-app navigation uses `#blog` instead — see BlogSection.
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

/** Matches App routing: landing vs in-app blog (#blog) vs studio. Safe before React mounts. */
export function getInitialAppPage() {
  if (typeof window === 'undefined') return 'landing'
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
