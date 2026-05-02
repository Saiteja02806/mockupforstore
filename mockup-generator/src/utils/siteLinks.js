const DEFAULT_MARKETING_ORIGIN = 'https://mockupeditor.site'

export function getMarketingHomeUrl() {
  // Set VITE_MARKETING_SITE_URL in .env.local to override for any environment.
  // Locally: the Astro marketing site runs on port 4321 (run `npm run dev`
  // inside the `marketing/` folder). If that server is not running you will get
  // "site can't be reached" – start both dev servers to use the Home link.
  const configured = import.meta.env.VITE_MARKETING_SITE_URL
  if (configured) return configured

  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname === '127.0.0.1' || hostname === 'localhost') {
      return 'http://127.0.0.1:4321'
    }
    return DEFAULT_MARKETING_ORIGIN
  }

  return DEFAULT_MARKETING_ORIGIN
}

/** Marketing site blog index (Astro). Matches trailingSlash: 'always' on the marketing app. */
export function getMarketingBlogUrl() {
  const base = getMarketingHomeUrl().replace(/\/$/, '')
  return `${base}/blog/`
}

/** Matches App routing: landing vs studio (URL query/hash). Safe before React mounts. */
export function getInitialAppPage() {
  if (typeof window === 'undefined') return 'landing'
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
