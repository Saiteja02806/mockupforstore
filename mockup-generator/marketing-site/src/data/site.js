export const siteName = 'Mockup Studio'
export const siteTagline = 'Create store-ready mockups in minutes, not in two-hour editing sessions.'
export const defaultDescription =
  'Mockup Studio helps app teams create Play Store and App Store screenshots with real device frames, built-in editing, and export-ready layouts.'

export const defaultSiteUrl = 'https://www.mockupeditor.site'
export const defaultAppUrl = 'https://www.mockupeditor.site/'

const CANONICAL_HOST = 'www.mockupeditor.site'
const APEX_HOST = 'mockupeditor.site'

function normalizeMockupEditorOrigin(urlLike) {
  const fallback = `https://${CANONICAL_HOST}`
  if (!urlLike || typeof urlLike !== 'string') return fallback
  try {
    const u = new URL(urlLike.includes('://') ? urlLike : `https://${urlLike}`)
    if (u.hostname === APEX_HOST) u.hostname = CANONICAL_HOST
    return u.origin
  } catch {
    return fallback
  }
}

export function getAppUrl() {
  const raw = import.meta.env.PUBLIC_APP_URL || defaultAppUrl
  try {
    const u = new URL(raw.includes('://') ? raw : `https://${raw}`)
    if (u.hostname === APEX_HOST) u.hostname = CANONICAL_HOST
    return u.toString()
  } catch {
    return defaultAppUrl
  }
}

export function getSiteUrl() {
  return normalizeMockupEditorOrigin(import.meta.env.PUBLIC_SITE_URL || defaultSiteUrl)
}
