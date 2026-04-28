import { frames as productFrames, getAllFrames, isRasterFrame } from '../../../mockup-generator/src/data/frames.js'

const MARKETING_FRAME_IDS = [
  'pill-phone',
  'dynamic-island-camera',
  'punchhole-phone',
  'notch-phone',
  'borderless-phone',
  'borderless-phone-silver',
  'silver-black-phone',
  'foldable-closed',
  'foldable-open',
  'portrait-tablet',
  'portrait-tablet-camera',
  'landscape-tablet',
  'slim-laptop',
  'monitor',
  'browser-window',
  'rect-watch',
  'round-watch',
]

const CATEGORY_LABELS = {
  mobile: 'Phone frame',
  tablet: 'Tablet frame',
  desktop: 'Desktop frame',
  watch: 'Watch frame',
}

function assetPathForFrame(frame) {
  const file = String(frame.file || '')
  if (file.startsWith('/frames/')) {
    return file.replace('/frames/', '/frame-assets/')
  }
  return file
}

function categoryFromFrame(frame, fallback = 'mobile') {
  const file = String(frame.file || '')
  if (file.startsWith('/frames/mobile/')) return 'mobile'
  if (file.startsWith('/frames/tablet/')) return 'tablet'
  if (file.startsWith('/frames/laptop/')) return 'desktop'
  if (file.startsWith('/frames/watch/')) return 'watch'
  if (file.startsWith('/assets/frames/')) return fallback
  return fallback
}

function mapFrame(frame, categoryOverride) {
  const category = categoryOverride || categoryFromFrame(frame)
  return {
    ...frame,
    slug: frame.id,
    category,
    categoryLabel: CATEGORY_LABELS[category] || 'Frame',
    assetPath: assetPathForFrame(frame),
    seoTitle: `${frame.label} Mockup Generator`,
    seoDescription: buildFrameDescription(frame.label, category),
  }
}

const frameCollection = getAllFrames()
  .filter((frame) => !isRasterFrame(frame) && MARKETING_FRAME_IDS.includes(frame.id))
  .map((frame) => mapFrame(frame))

export const marketingFrames = MARKETING_FRAME_IDS
  .map((id) => frameCollection.find((frame) => frame.id === id))
  .filter(Boolean)

const mobileHeroIndex = new Map(productFrames.mobile.map((frame) => [frame.id, frame]))
const tabletHeroIndex = new Map(productFrames.tablet.map((frame) => [frame.id, frame]))

// Column 1: phones
const MOBILE_HERO_COL_1 = [
  { id: 'apple-iphone-15-photo', gradient: 'linear-gradient(160deg, #ff56ce 0%, #ff8db3 34%, #ffdbe2 66%, #fff7fb 100%)' },
  { id: 'borderless-phone-silver', gradient: 'linear-gradient(160deg, #d9ebff 0%, #bfd2ff 34%, #ece0ff 70%, #fff7ff 100%)' },
  { id: 'google-pixel-7-photo', gradient: 'linear-gradient(165deg, #d4fff1 0%, #a7efff 42%, #d9ddff 74%, #fff8ff 100%)' },
  { id: 'silver-black-phone', gradient: 'linear-gradient(160deg, #d8dbff 0%, #c7b1ff 36%, #f2d8ff 70%, #fff5fc 100%)' },
  { id: 'apple-iphone-11-photo', gradient: 'linear-gradient(160deg, #d9ecff 0%, #c7d9ff 40%, #eef1ff 74%, #ffffff 100%)' },
]

// Column 2: phones
const MOBILE_HERO_COL_2 = [
  { id: 'dynamic-island-camera', gradient: 'linear-gradient(160deg, #cbd8ff 0%, #b4c2ff 40%, #ddd5ff 72%, #fff8ff 100%)' },
  { id: 'samsung-galaxy-s24-ultra-photo', gradient: 'linear-gradient(165deg, #d2ffe1 0%, #b8f5ef 42%, #d9e6ff 76%, #fbfdff 100%)' },
  { id: 'notch-phone', gradient: 'linear-gradient(160deg, #ffc0e9 0%, #ffd2de 38%, #ead9ff 70%, #fff8fd 100%)' },
  { id: 'borderless-phone-clean', gradient: 'linear-gradient(160deg, #d7f6ff 0%, #c2dcff 40%, #ece3ff 74%, #fffaff 100%)' },
  { id: 'apple-iphone-11-pro-max-photo', gradient: 'linear-gradient(160deg, #ece8ff 0%, #ddd7ff 38%, #ffe4f3 72%, #fff9fd 100%)' },
]

// Column 3: portrait tablets (600×800 = same 3:4 ratio as phones → identical rendered height)
const TABLET_HERO_COL_3 = [
  { id: 'portrait-tablet-camera', gradient: 'linear-gradient(160deg, #ded6ff 0%, #c6b7ff 38%, #f1d8ff 72%, #fff7fc 100%)' },
  { id: 'portrait-tablet', gradient: 'linear-gradient(165deg, #d8fff2 0%, #c6f3ff 40%, #dde3ff 74%, #fffafd 100%)' },
  { id: 'portrait-tablet-clean', gradient: 'linear-gradient(160deg, #ffb9e0 0%, #ffd2e4 38%, #e6deff 72%, #fff8fd 100%)' },
  { id: 'portrait-tablet-camera', gradient: 'linear-gradient(160deg, #d9fff0 0%, #bdefff 38%, #dfe5ff 72%, #ffffff 100%)' },
  { id: 'portrait-tablet', gradient: 'linear-gradient(160deg, #ddd3ff 0%, #c8bcff 38%, #f6d5ff 72%, #fff8fd 100%)' },
]

const MOBILE_HERO_COLUMNS = [MOBILE_HERO_COL_1, MOBILE_HERO_COL_2, TABLET_HERO_COL_3]

export const mobileHeroColumns = MOBILE_HERO_COLUMNS.map((column, colIdx) =>
  column
    .map((item) => {
      // Col 0 & 1: mobile; Col 2: tablet (portrait)
      const isTabletCol = colIdx === 2
      const frame = isTabletCol
        ? tabletHeroIndex.get(item.id)
        : mobileHeroIndex.get(item.id)
      const category = isTabletCol ? 'tablet' : 'mobile'
      return frame ? { ...mapFrame(frame, category), gradient: item.gradient } : null
    })
    .filter(Boolean)
)

export const heroFrames = [
  getFrameById('dynamic-island-camera'),
  getFrameById('borderless-phone-silver'),
  getFrameById('silver-black-phone'),
  getFrameById('portrait-tablet'),
  getFrameById('browser-window'),
].filter(Boolean)

function buildFrameDescription(label, category) {
  if (category === 'mobile') {
    return `Use the ${label} frame to present mobile UI with store-ready proportions, polished device edges, and a cleaner App Store or Play Store screenshot.`
  }
  if (category === 'tablet') {
    return `Use the ${label} frame to present tablet layouts with a clearer viewport, realistic device shell, and export-ready app marketing visuals.`
  }
  if (category === 'desktop') {
    return `Use the ${label} frame to showcase desktop flows, browser UIs, and product marketing shots without rebuilding device chrome manually.`
  }
  return `Use the ${label} frame to showcase wearable interfaces with a clearer device presentation and a faster screenshot workflow.`
}

export function getFrameById(id) {
  return marketingFrames.find((frame) => frame.id === id) || null
}

export function getRelatedFrames(frame, count = 3) {
  const sameCategory = marketingFrames.filter((item) => item.category === frame.category && item.id !== frame.id)
  const otherCategory = marketingFrames.filter((item) => item.category !== frame.category)
  return [...sameCategory, ...otherCategory].slice(0, count)
}

export function getFrameAppUrl(frame, appUrl) {
  const url = new URL(appUrl)
  url.searchParams.set('frame', frame.id)
  return url.toString()
}

export const frameGroups = [
  {
    title: 'Phone frames',
    description: 'Popular device shells for Play Store and App Store screenshots.',
    frames: marketingFrames.filter((frame) => frame.category === 'mobile'),
  },
  {
    title: 'Tablet frames',
    description: 'Portrait and landscape tablet layouts for wider product storytelling.',
    frames: marketingFrames.filter((frame) => frame.category === 'tablet'),
  },
  {
    title: 'Desktop frames',
    description: 'Laptop, monitor, and browser layouts for desktop product pages.',
    frames: marketingFrames.filter((frame) => frame.category === 'desktop'),
  },
  {
    title: 'Watch frames',
    description: 'Clean watch canvases for wearable UI previews and onboarding shots.',
    frames: marketingFrames.filter((frame) => frame.category === 'watch'),
  },
]

export const frameToBlogMap = {
  'pill-phone': ['best-device-frame-sizes-for-google-play-2025', 'how-to-make-play-store-screenshots-that-get-downloads'],
  'dynamic-island-camera': ['how-to-make-play-store-screenshots-that-get-downloads', 'app-store-screenshot-requirements-complete-guide'],
  'punchhole-phone': ['best-device-frame-sizes-for-google-play-2025', 'app-store-screenshot-requirements-complete-guide'],
  'notch-phone': ['app-store-screenshot-requirements-complete-guide', 'how-to-make-play-store-screenshots-that-get-downloads'],
  'foldable-closed': ['best-device-frame-sizes-for-google-play-2025', 'how-to-make-play-store-screenshots-that-get-downloads'],
  'foldable-open': ['best-device-frame-sizes-for-google-play-2025', 'how-to-make-play-store-screenshots-that-get-downloads'],
  'portrait-tablet': ['app-store-screenshot-requirements-complete-guide', 'best-device-frame-sizes-for-google-play-2025'],
  'portrait-tablet-camera': ['app-store-screenshot-requirements-complete-guide', 'best-device-frame-sizes-for-google-play-2025'],
  'landscape-tablet': ['app-store-screenshot-requirements-complete-guide', 'best-device-frame-sizes-for-google-play-2025'],
  'slim-laptop': ['how-to-make-play-store-screenshots-that-get-downloads', 'best-device-frame-sizes-for-google-play-2025'],
  'monitor': ['how-to-make-play-store-screenshots-that-get-downloads', 'best-device-frame-sizes-for-google-play-2025'],
  'browser-window': ['how-to-make-play-store-screenshots-that-get-downloads', 'best-device-frame-sizes-for-google-play-2025'],
  'rect-watch': ['app-store-screenshot-requirements-complete-guide', 'how-to-make-play-store-screenshots-that-get-downloads'],
  'round-watch': ['app-store-screenshot-requirements-complete-guide', 'how-to-make-play-store-screenshots-that-get-downloads'],
}
