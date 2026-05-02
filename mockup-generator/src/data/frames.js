/**
 * Device catalog: mobile, tablet, watch, and desktop **vector** frames.
 * Desktop **photo** rasters + glass math: `./framesDesktop.js` (edit there to avoid phone/tablet risk).
 * Shared raster helpers: `./framesRasterCore.js`.
 */
import { rasterFrameFromSpec, rasterRectFromVanilla } from './framesRasterCore'
import { RASTER_DESKTOP_FRAMES } from './framesDesktop'

export { isDesktopRasterPhotoFrame } from './framesDesktop'

export const CATEGORIES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  WATCH: 'watch'
}

/** @returns {boolean} */
export function isRasterFrame(frame) {
  return frame?.kind === 'raster'
}

/**
 * @param {object} frame
 * @param {string} variant - midnight | silver | gold
 * @returns {string|null}
 */
export function getFrameAssetUrl(frame, variant) {
  if (!isRasterFrame(frame)) return null
  const assets = frame.assets || {}
  return assets[variant] || assets.midnight || Object.values(assets)[0] || null
}

/** Thumbnail / picker preview src */
export function getFrameThumbnailSrc(frame) {
  if (isRasterFrame(frame)) {
    return frame.thumbnail || getFrameAssetUrl(frame, 'midnight')
  }
  return frame.file
}

/** Longest side cap for Fabric + preview; avoids multi‑million‑pixel canvases that freeze the tab */
const RASTER_EDITOR_MAX_SIDE = 1000

// Frame masks antialias their transparent screen edges. Bleed keeps uploaded artwork under that
// partially transparent bezel edge instead of stopping exactly at the visible hole boundary.
const VECTOR_SCREEN_BLEED_PX = 2
const RASTER_SCREEN_BLEED_PX = 4

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function expandScreenArea(area, bleed, canvasWidth, canvasHeight) {
  if (!area || !bleed) return area

  if (area.shape === 'circle') {
    const maxR = Math.min(area.cx, area.cy, canvasWidth - area.cx, canvasHeight - area.cy)
    return {
      ...area,
      r: Math.round(clampValue(area.r + bleed, 1, maxR)),
    }
  }

  if (area.shape === 'polygon') {
    return area
  }

  const x1 = clampValue(area.x - bleed, 0, canvasWidth)
  const y1 = clampValue(area.y - bleed, 0, canvasHeight)
  const x2 = clampValue(area.x + area.width + bleed, 0, canvasWidth)
  const y2 = clampValue(area.y + area.height + bleed, 0, canvasHeight)

  return {
    ...area,
    shape: area.shape || 'rect',
    x: Math.round(x1),
    y: Math.round(y1),
    width: Math.max(1, Math.round(x2 - x1)),
    height: Math.max(1, Math.round(y2 - y1)),
    radius: Math.round((area.radius || 0) + bleed),
  }
}

function getVectorScreenArea(frame) {
  const bleed = Number(frame.screenBleed ?? VECTOR_SCREEN_BLEED_PX) || 0
  return expandScreenArea(frame.screenArea, bleed, frame.canvasWidth, frame.canvasHeight)
}

function getRasterScreenArea(frame, canvasWidth, canvasHeight) {
  const bleed = Number(frame.screenBleed ?? RASTER_SCREEN_BLEED_PX) || 0
  return expandScreenArea(frame.screenArea, bleed, canvasWidth, canvasHeight)
}

function scaleScreenArea(area, scale) {
  if (!area) return area
  if (area.shape === 'circle') {
    return {
      shape: 'circle',
      cx: Math.round(area.cx * scale),
      cy: Math.round(area.cy * scale),
      r: Math.round(area.r * scale),
    }
  }
  if (area.shape === 'polygon') {
    return {
      ...area,
      shape: 'polygon',
      x: Math.round(area.x * scale),
      y: Math.round(area.y * scale),
      width: Math.round(area.width * scale),
      height: Math.round(area.height * scale),
      radius: 0,
      points: Array.isArray(area.points)
        ? area.points.map((point) => ({
            x: Math.round(point.x * scale),
            y: Math.round(point.y * scale),
          }))
        : [],
    }
  }
  return {
    ...area,
    shape: area.shape || 'rect',
    x: Math.round(area.x * scale),
    y: Math.round(area.y * scale),
    width: Math.round(area.width * scale),
    height: Math.round(area.height * scale),
    radius: Math.round((area.radius || 0) * scale),
  }
}

/**
 * Layout used by the editor (may be downscaled for large rasters).
 * `exportMultiplierBoost` scales Fabric + frame export back to native pixel size.
 */
export function getFrameLayout(frame) {
  if (!frame) {
    return {
      canvasWidth: 0,
      canvasHeight: 0,
      screenArea: null,
      exportMultiplierBoost: 1,
    }
  }
  if (!isRasterFrame(frame)) {
    return {
      canvasWidth: frame.canvasWidth,
      canvasHeight: frame.canvasHeight,
      screenArea: getVectorScreenArea(frame),
      exportMultiplierBoost: 1,
    }
  }
  const nw = frame.canvasWidth
  const nh = frame.canvasHeight
  const maxSide = Math.max(nw, nh)
  if (maxSide <= RASTER_EDITOR_MAX_SIDE) {
    return {
      canvasWidth: nw,
      canvasHeight: nh,
      screenArea: getRasterScreenArea(frame, nw, nh),
      exportMultiplierBoost: 1,
    }
  }
  const s = RASTER_EDITOR_MAX_SIDE / maxSide
  const canvasWidth = Math.max(1, Math.round(nw * s))
  const canvasHeight = Math.max(1, Math.round(nh * s))
  const screenArea = scaleScreenArea(frame.screenArea, s)
  return {
    canvasWidth,
    canvasHeight,
    screenArea: getRasterScreenArea({ ...frame, screenArea }, canvasWidth, canvasHeight),
    exportMultiplierBoost: 1 / s,
  }
}

/**
 * When a raster frame asset’s real pixel size differs from `frame.canvasWidth/Height`
 * (metadata drift), recompute the screen hole from the same heuristics so the clip
 * matches the overlay and artwork is not cropped incorrectly.
 * @param {object|null} intrinsic - `{ frameId, naturalWidth, naturalHeight }` from loaded asset
 */
export function getEffectiveFrameLayout(frame, intrinsic) {
  if (!frame) {
    return getFrameLayout(null)
  }
  if (!isRasterFrame(frame)) {
    return getFrameLayout(frame)
  }
  if (!intrinsic || intrinsic.frameId !== frame.id) {
    return getFrameLayout(frame)
  }
  const nw = intrinsic.naturalWidth
  const nh = intrinsic.naturalHeight
  if (!nw || !nh) {
    return getFrameLayout(frame)
  }
  if (nw === frame.canvasWidth && nh === frame.canvasHeight && !intrinsic.screenArea) {
    return getFrameLayout(frame)
  }
  const screenFn = frame.computeScreenArea
  const screenArea =
    intrinsic.screenArea || (typeof screenFn === 'function' ? screenFn(nw, nh) : frame.screenArea)
  const adjusted = {
    ...frame,
    canvasWidth: nw,
    canvasHeight: nh,
    screenArea,
  }
  return getFrameLayout(adjusted)
}

/**
 * Screen-hole heuristics for raster (photo) frames.
 *
 * **Horizontal:** Must stay in sync with real glass width. `vanilla-mockup/frames.js`
 * punch-hole uses `sc: { x: 38, w: 324 }` on vw=400 → **81%** width, **9.5%** side
 * inset — not ~90% width. A wider heuristic clip extends into the semi-transparent /
 * transparent band beside the glass; the frame PNG is transparent there, so the
 * user sees the **canvas** bleeding onto the black workspace past the metal bezel.
 *
 * **Vertical:** Slightly taller than that same `sc` (682/800) so portrait photos
 * still fill top/bottom glass; only the horizontal numbers are tied to vanilla.
 *
 * Corner radius: vanilla `rx: 6` at vw 400 → scale by min side.
 */
function phoneScreenRect(w, h) {
  const xN = 38 / 400
  const wN = 324 / 400
  const yN = 0.065
  const hN = 0.885
  const rxN = 6 / 400
  return {
    x: Math.round(w * xN),
    y: Math.round(h * yN),
    width: Math.round(w * wN),
    height: Math.round(h * hN),
    radius: Math.round(Math.min(w, h) * rxN),
    shape: 'rect',
  }
}

function rectFromRatios(w, h, ratios) {
  const minSide = Math.min(w, h)
  return {
    x: Math.round(w * ratios.x),
    y: Math.round(h * ratios.y),
    width: Math.round(w * ratios.width),
    height: Math.round(h * ratios.height),
    radius: Math.round(minSide * (ratios.radius || 0)),
    shape: 'rect',
  }
}

const RASTER_SCREEN_RATIOS = {
  'phone-studio-square-b-photo': { x: 0.323, y: 0.121, width: 0.355, height: 0.758, radius: 0.035 },
  'apple-iphone-11-photo': { x: 0.0988, y: 0.051, width: 0.8023, height: 0.898, radius: 0.064 },
  'apple-iphone-11-pro-max-photo': { x: 0.0884, y: 0.045, width: 0.8232, height: 0.91, radius: 0.0609 },
  'apple-iphone-15-photo': { x: 0.0846, y: 0.043, width: 0.8307, height: 0.914, radius: 0.1024 },
  'google-pixel-7-photo': { x: 0.0338, y: 0.02, width: 0.9219, height: 0.954, radius: 0.0654 },
  'google-pixel-5-photo': { x: 0.1352, y: 0.073, width: 0.7296, height: 0.854, radius: 0.0759 },
  'samsung-galaxy-s24-ultra-photo': { x: 0.1212, y: 0.072, width: 0.7538, height: 0.856, radius: 0.004 },
  'samsung-galaxy-s20-plus-photo': { x: 0.1311, y: 0.056, width: 0.7378, height: 0.888, radius: 0.0528 },
  'samsung-galaxy-s21-plus-photo': { x: 0.1361, y: 0.072, width: 0.7278, height: 0.856, radius: 0.0529 },
  'samsung-galaxy-s21-ultra-photo': { x: 0.1096, y: 0.056, width: 0.7808, height: 0.888, radius: 0.0509 },
  'apple-ipad-air-5-photo': { x: 0.0743, y: 0.053, width: 0.8528, height: 0.894, radius: 0.0041 },
  'apple-ipad-pro-11-photo': { x: 0.0594, y: 0.043, width: 0.8812, height: 0.914, radius: 0.0028 },
}

function measuredRasterScreenRect(w, h, frameId, fallback) {
  const ratios = RASTER_SCREEN_RATIOS[frameId]
  return ratios ? rectFromRatios(w, h, ratios) : fallback(w, h)
}

/** `tab-portrait` / `tab-landscape` in vanilla-mockup (600×800 vs 800×600). */
function tabletScreenRect(w, h) {
  const portrait = h >= w
  if (portrait) {
    return rasterRectFromVanilla(w, h, 600, 800, 32, 32, 536, 736, 8)
  }
  return rasterRectFromVanilla(w, h, 800, 600, 32, 32, 736, 536, 8)
}

/**
 * Raster watch helpers — catalog has vector watches only today; use when adding photo watches.
 * Matches `watch-square` / `watch-round` in vanilla-mockup (240×290).
 */
export function watchSquareScreenRect(w, h) {
  return rasterRectFromVanilla(w, h, 240, 290, 30, 56, 180, 176, 28)
}

export function watchCircleScreenArea(w, h) {
  const vw = 240
  const vh = 290
  return {
    shape: 'circle',
    cx: Math.round((w * 120) / vw),
    cy: Math.round((h * 145) / vh),
    r: Math.round((Math.min(w, h) * 88) / vw),
  }
}

const WATCH_PREVIEW_TARGET_HEIGHT = 400
const WATCH_PREVIEW_SCALE_MAX = 2.1

/** Synced from /frames → /public/assets/frames (see npm run sync-frames) */
const RASTER_MOBILE_FRAMES = [
  ['phone-studio-square-b-photo', 'iPhone 15', 'phone_0351.webp', 5000, 5000],
  ['apple-iphone-11-photo', 'iPhone 11 (photo)', 'apple-iphone-11-black-portrait.webp', 1028, 1992],
  ['apple-iphone-11-pro-max-photo', 'iPhone 11 Pro Max (photo)', 'apple-iphone-11-pro-max-gold-portrait.webp', 1502, 2948],
  ['apple-iphone-15-photo', 'iPhone 15 (photo)', 'apple-iphone-15-black-portrait.webp', 1419, 2796],
  ['google-pixel-7-photo', 'Pixel 7 (photo)', 'google-pixel-7-obsidian-portrait.webp', 1118, 2361],
  ['google-pixel-5-photo', 'Pixel 5 (photo)', 'google-pixel5-justblack-portrait.webp', 1480, 2740],
  ['samsung-galaxy-s24-ultra-photo', 'Galaxy S24 Ultra (photo)', 'samsung-galaxy-s24-ultra-portrait.webp', 1245, 2359],
  ['samsung-galaxy-s20-plus-photo', 'Galaxy S20+ (photo)', 'samsung-galaxys20plus-cloudblue-portrait.webp', 1840, 3600],
  ['samsung-galaxy-s21-plus-photo', 'Galaxy S21+ (photo)', 'samsung-galaxys21plus-black-portrait.webp', 1480, 2800],
  ['samsung-galaxy-s21-ultra-photo', 'Galaxy S21 Ultra (photo)', 'samsung-galaxys21ultra-black-portrait.webp', 1840, 3600],
].map(([id, label, file, width, height]) =>
  rasterFrameFromSpec(id, label, file, width, height, (iw, ih) =>
    measuredRasterScreenRect(iw, ih, id, phoneScreenRect)
  )
)

const RASTER_TABLET_FRAMES = [
  rasterFrameFromSpec(
    'apple-ipad-air-5-photo',
    'iPad Air (photo)',
    'apple-ipadair5-spacegrey-portrait.webp',
    1920,
    2640,
    (iw, ih) => measuredRasterScreenRect(iw, ih, 'apple-ipad-air-5-photo', tabletScreenRect)
  ),
  rasterFrameFromSpec(
    'apple-ipad-pro-11-photo',
    'iPad Pro 11" (photo)',
    'apple-ipadpro11-spacegrey-portrait.webp',
    1890,
    2610,
    (iw, ih) => measuredRasterScreenRect(iw, ih, 'apple-ipad-pro-11-photo', tabletScreenRect)
  ),
]

/** Photo watches — same glass math as vector `watch-square` / `watch-round` (240×290 ref). */
const RASTER_WATCH_FRAMES = [
  rasterFrameFromSpec(
    'apple-watch-ultra-photo',
    'Apple Watch Ultra (photo)',
    'apple-applewatchultra-alpineband-portrait.webp',
    600,
    940,
    watchSquareScreenRect
  ),
  rasterFrameFromSpec(
    'apple-watch-series-5-photo',
    'Apple Watch Series 5 40mm (photo)',
    'apple-watch-series-5-40-mm-space-grey-aluminum-black-closed-portrait.webp',
    905,
    1579,
    watchCircleScreenArea
  ),
].map((frame) => ({
  ...frame,
  previewTargetHeight: WATCH_PREVIEW_TARGET_HEIGHT,
  previewScaleMax: WATCH_PREVIEW_SCALE_MAX,
}))

/**
 * Desktop photo rasters + heuristics: `framesDesktop.js`.
 * Vector laptop/monitor/browser entries stay below in `frames.desktop`.
 */
export const frames = {
  mobile: [
    ...RASTER_MOBILE_FRAMES,
    {
      id: 'pill-phone',
      label: 'Dynamic Island',
      file: '/frames/mobile/pill-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 38, y: 60, width: 324, height: 680, radius: 4, shape: 'rect' }
    },
    {
      id: 'dynamic-island-camera',
      label: 'Dynamic Island + Camera',
      file: '/frames/mobile/dynamic-island-camera.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 38, y: 60, width: 324, height: 680, radius: 4, shape: 'rect' }
    },
    {
      id: 'punchhole-phone',
      label: 'Punch-hole',
      file: '/frames/mobile/punchhole-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 38, y: 58, width: 324, height: 682, radius: 4, shape: 'rect' }
    },
    {
      id: 'notch-phone',
      label: 'Notch',
      file: '/frames/mobile/notch-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 38, y: 62, width: 324, height: 678, radius: 4, shape: 'rect' }
    },
    {
      id: 'borderless-phone',
      label: 'Borderless',
      file: '/frames/mobile/borderless-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 14, y: 14, width: 372, height: 772, radius: 48, shape: 'rect' }
    },
    {
      id: 'borderless-phone-clean',
      label: 'Borderless Clean',
      file: '/frames/mobile/borderless-phone-clean.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      screenArea: { x: 14, y: 14, width: 372, height: 772, radius: 48, shape: 'rect' }
    },
    {
      id: 'borderless-phone-silver',
      label: 'Borderless Silver',
      file: '/frames/mobile/borderless-phone-silver.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      fixedFinish: 'silver',
      screenArea: { x: 14, y: 14, width: 372, height: 772, radius: 48, shape: 'rect' }
    },
    {
      id: 'silver-black-phone',
      label: 'Silver Black',
      file: '/frames/mobile/silver-black-phone.svg',
      canvasWidth: 400,
      canvasHeight: 800,
      fixedFinish: 'silver',
      screenArea: { x: 32, y: 32, width: 336, height: 736, radius: 42, shape: 'rect' }
    },
    {
      id: 'foldable-closed',
      label: 'Foldable (closed)',
      file: '/frames/mobile/foldable-closed.svg',
      canvasWidth: 300,
      canvasHeight: 800,
      screenArea: { x: 30, y: 52, width: 240, height: 696, radius: 4, shape: 'rect' }
    },
    {
      id: 'foldable-open',
      label: 'Foldable (open)',
      file: '/frames/mobile/foldable-open.svg',
      canvasWidth: 760,
      canvasHeight: 800,
      screenArea: { x: 32, y: 32, width: 696, height: 736, radius: 6, shape: 'rect' }
    }
  ],
  tablet: [
    ...RASTER_TABLET_FRAMES,
    {
      id: 'portrait-tablet',
      label: 'Tablet portrait',
      file: '/frames/tablet/portrait-tablet.svg',
      canvasWidth: 600,
      canvasHeight: 800,
      screenArea: { x: 32, y: 32, width: 536, height: 736, radius: 8, shape: 'rect' }
    },
    {
      id: 'portrait-tablet-clean',
      label: 'Tablet portrait clean',
      file: '/frames/tablet/portrait-tablet-clean.svg',
      canvasWidth: 600,
      canvasHeight: 800,
      screenArea: { x: 32, y: 32, width: 536, height: 736, radius: 8, shape: 'rect' }
    },
    {
      id: 'portrait-tablet-camera',
      label: 'Tablet portrait + Camera',
      file: '/frames/tablet/portrait-tablet-camera.svg',
      canvasWidth: 600,
      canvasHeight: 800,
      screenArea: { x: 32, y: 32, width: 536, height: 736, radius: 8, shape: 'rect' }
    },
    {
      id: 'landscape-tablet',
      label: 'Tablet landscape',
      file: '/frames/tablet/landscape-tablet.svg',
      canvasWidth: 800,
      canvasHeight: 600,
      screenArea: { x: 32, y: 32, width: 736, height: 536, radius: 8, shape: 'rect' }
    },
    {
      id: 'landscape-tablet-clean',
      label: 'Tablet landscape clean',
      file: '/frames/tablet/landscape-tablet-clean.svg',
      canvasWidth: 800,
      canvasHeight: 600,
      screenArea: { x: 32, y: 32, width: 736, height: 536, radius: 8, shape: 'rect' }
    }
  ],
  desktop: [
    ...RASTER_DESKTOP_FRAMES,
    {
      id: 'slim-laptop',
      label: 'Laptop',
      file: '/frames/laptop/slim-laptop.svg',
      canvasWidth: 1200,
      canvasHeight: 780,
      // Aligned with vanilla-mockup `laptop` sc (was 90,48,1020,626 — caused clip vs SVG drift)
      screenArea: { x: 86, y: 46, width: 1028, height: 628, radius: 4, shape: 'rect' }
    },
    {
      id: 'monitor',
      label: 'Monitor',
      file: '/frames/laptop/monitor.svg',
      canvasWidth: 1200,
      canvasHeight: 860,
      screenArea: { x: 50, y: 30, width: 1100, height: 680, radius: 4, shape: 'rect' }
    },
    {
      id: 'browser-window',
      label: 'Browser window',
      file: '/frames/laptop/browser-window.svg',
      canvasWidth: 1200,
      canvasHeight: 800,
      screenArea: { x: 28, y: 76, width: 1144, height: 696, radius: 0, shape: 'rect' }
    }
  ],
  watch: [
    ...RASTER_WATCH_FRAMES,
    {
      id: 'rect-watch',
      label: 'Watch square',
      file: '/frames/watch/rect-watch.svg',
      canvasWidth: 240,
      canvasHeight: 290,
      previewTargetHeight: WATCH_PREVIEW_TARGET_HEIGHT,
      previewScaleMax: WATCH_PREVIEW_SCALE_MAX,
      screenArea: { x: 30, y: 56, width: 180, height: 176, radius: 28, shape: 'rect' }
    },
    {
      id: 'rect-watch-clean',
      label: 'Watch square clean',
      file: '/frames/watch/rect-watch-clean.svg',
      canvasWidth: 212,
      canvasHeight: 208,
      previewTargetHeight: WATCH_PREVIEW_TARGET_HEIGHT,
      previewScaleMax: WATCH_PREVIEW_SCALE_MAX,
      screenArea: { x: 4, y: 4, width: 205, height: 201, radius: 29, shape: 'rect' }
    },
    {
      id: 'round-watch',
      label: 'Watch round',
      file: '/frames/watch/round-watch.svg',
      canvasWidth: 240,
      canvasHeight: 290,
      previewTargetHeight: WATCH_PREVIEW_TARGET_HEIGHT,
      previewScaleMax: WATCH_PREVIEW_SCALE_MAX,
      screenArea: { shape: 'circle', cx: 120, cy: 145, r: 88 }
    },
    {
      id: 'round-watch-clean',
      label: 'Watch round clean',
      file: '/frames/watch/round-watch-clean.svg',
      canvasWidth: 212,
      canvasHeight: 212,
      previewTargetHeight: WATCH_PREVIEW_TARGET_HEIGHT,
      previewScaleMax: WATCH_PREVIEW_SCALE_MAX,
      screenArea: { shape: 'circle', cx: 106, cy: 106, r: 101 }
    }
  ]
}

export const getAllFrames = () => Object.values(frames).flat()
export const getFrameById = (id) => getAllFrames().find(f => f.id === id) || null
export const getFramesByCategory = (category) => frames[category] || []

/** Mobile/tablet SVG frames can render a synthetic status bar inside the screen area. */
export function supportsVectorStatusBar(frame) {
  if (!frame || isRasterFrame(frame)) return false
  const file = String(frame.file || '')
  return file.includes('/frames/mobile/') || file.includes('/frames/tablet/')
}

/** Total devices in the catalog (shown in studio chrome). */
export const FRAME_CATALOG_TOTAL = getAllFrames().length
