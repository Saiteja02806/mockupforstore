export const siteName = 'Mockup Studio'
export const siteTagline = 'Create store-ready mockups in minutes, not in two-hour editing sessions.'
export const defaultDescription =
  'Mockup Studio helps app teams create Play Store and App Store screenshots with real device frames, built-in editing, and export-ready layouts.'

export const defaultSiteUrl = 'https://mockupeditor.site'
export const defaultAppUrl = 'https://mockupeditor.site/'

export function getAppUrl() {
  return import.meta.env.PUBLIC_APP_URL || defaultAppUrl
}

export function getSiteUrl() {
  return import.meta.env.PUBLIC_SITE_URL || defaultSiteUrl
}
