/** Preset canvas sizes for App Store / Play Store style screenshots */
export const CUSTOM_FORMAT_KEY = 'custom'

/** Default export size when no valid saved preference (Phone 9:16). */
export const DEFAULT_STORE_FORMAT_KEY = 'phone_9_16'

const clampDim = (n, min = 400, max = 4096) => {
  const x = Math.round(Number(n))
  if (!Number.isFinite(x)) return min
  return Math.max(min, Math.min(max, x))
}

export const STORE_FORMATS = [
  { key: 'phone_9_16',    label: 'Phone 9:16 (1080×1920)',         width: 1080, height: 1920, category: 'phone' },
  { key: 'iphone_69',    label: 'iPhone 6.9" (1320×2868)',         width: 1320, height: 2868, category: 'phone' },
  { key: 'iphone_67',    label: 'iPhone 6.7" (1290×2796)',         width: 1290, height: 2796, category: 'phone' },
  { key: 'iphone_65',    label: 'iPhone 6.5" (1242×2688)',         width: 1242, height: 2688, category: 'phone' },
  { key: 'iphone_61',    label: 'iPhone 6.1" (1179×2556)',         width: 1179, height: 2556, category: 'phone' },
  { key: 'iphone_55',    label: 'iPhone 5.5" (1242×2208)',         width: 1242, height: 2208, category: 'phone' },
  { key: 'android_phone', label: 'Android phone (1080×1920)',      width: 1080, height: 1920, category: 'phone' },
  { key: 'tablet_105',   label: 'Tablet 10.5" (1668×2224)',        width: 1668, height: 2224, category: 'tablet' },
  { key: 'ipad_129',     label: 'iPad Pro 12.9" (2048×2732)',      width: 2048, height: 2732, category: 'tablet' },
  { key: 'ipad_11',      label: 'iPad 11" (1668×2388)',            width: 1668, height: 2388, category: 'tablet' },
  { key: 'desktop_fhd',  label: 'Desktop 16:9 (1920×1080)',        width: 1920, height: 1080, category: 'desktop' },
  { key: 'desktop_16_10', label: 'Laptop 16:10 (1920×1200)',       width: 1920, height: 1200, category: 'desktop' },
  { key: 'desktop_1440', label: 'Desktop (1440×900)',              width: 1440, height: 900,  category: 'desktop' },
  { key: 'play_feature', label: 'Play feature graphic (1024×500)', width: 1024, height: 500,  category: 'desktop' },
  { key: 'square_promo', label: 'Square promo (1080×1080)',        width: 1080, height: 1080, category: 'social' },
  { key: CUSTOM_FORMAT_KEY, label: 'Custom size…',                 width: 1080, height: 1920, category: 'custom' },
]

/**
 * Exact sizes required when submitting to the Apple App Store.
 * At least one 6.9" or 6.7" frame is required for iPhone.
 * iPad Pro 12.9" is required when the app supports iPad.
 * Source: developer.apple.com/help/app-store-connect (2025)
 */
export const APP_STORE_FORMATS = [
  { key: 'iphone_69', label: 'iPhone 6.9"',  width: 1320, height: 2868, note: 'Required (latest)' },
  { key: 'iphone_67', label: 'iPhone 6.7"',  width: 1290, height: 2796, note: 'Required (older)' },
  { key: 'iphone_65', label: 'iPhone 6.5"',  width: 1242, height: 2688, note: 'Legacy required' },
  { key: 'ipad_129',  label: 'iPad Pro 12.9"', width: 2048, height: 2732, note: 'Required for iPad' },
  { key: 'ipad_11',   label: 'iPad 11"',     width: 1668, height: 2388, note: 'Optional' },
]

/**
 * Sizes for Google Play Store submissions.
 * Source: support.google.com/googleplay/android-developer (2025)
 */
export const PLAY_STORE_FORMATS = [
  { key: 'android_phone', label: 'Phone screenshot', width: 1080, height: 1920, note: 'Min 1080×1920' },
  { key: 'play_feature',  label: 'Feature graphic',  width: 1024, height: 500,  note: 'Required banner' },
]

/** Returns true if the given W×H matches an App Store required size */
export function isAppStoreReady(w, h) {
  return APP_STORE_FORMATS.some((f) => f.width === w && f.height === h)
}

/** Returns true if the given W×H matches a Play Store required size */
export function isPlayStoreReady(w, h) {
  return PLAY_STORE_FORMATS.some((f) => f.width === w && f.height === h)
}

export function storeFormatByKey(key) {
  return STORE_FORMATS.find((f) => f.key === key) || STORE_FORMATS[0]
}

/**
 * Effective format dimensions (handles custom WxH).
 * @param {string} formatKey
 * @param {number} [customW]
 * @param {number} [customH]
 */
export function resolveStoreFormat(formatKey, customW, customH) {
  if (formatKey === CUSTOM_FORMAT_KEY) {
    const w = clampDim(customW, 400, 4096)
    const h = clampDim(customH, 400, 4096)
    return {
      key: CUSTOM_FORMAT_KEY,
      label: `Custom (${w}×${h})`,
      width: w,
      height: h,
      category: 'custom',
    }
  }
  const f = storeFormatByKey(formatKey)
  return { key: f.key, label: f.label, width: f.width, height: f.height, category: f.category }
}

const GROUP_ORDER = ['phone', 'tablet', 'desktop', 'social', 'custom']
const GROUP_LABELS = {
  phone: 'Phone',
  tablet: 'Tablet',
  desktop: 'Desktop & TV',
  social: 'Social & promo',
  custom: 'Other',
}

/** For `<select>` `<optgroup>` lists in the store editor. */
export function getStoreFormatOptgroups() {
  const byCat = {}
  for (const f of STORE_FORMATS) {
    const c = f.category || 'custom'
    if (!byCat[c]) byCat[c] = []
    byCat[c].push(f)
  }
  return GROUP_ORDER.filter((k) => byCat[k]?.length).map((k) => ({
    category: k,
    label: GROUP_LABELS[k] || k,
    formats: byCat[k],
  }))
}

export function getLayerRowLabel(layer, stack) {
  if (layer.type === 'mockup') {
    const mocks = stack.filter((l) => l.type === 'mockup')
    if (mocks.length <= 1) return 'Device'
    const i = mocks.findIndex((m) => m.id === layer.id)
    return i < 0 ? 'Device' : `Device ${i + 1}`
  }
  if (layer.type === 'image') {
    const n = stack.filter((l) => l.type === 'image').findIndex((l) => l.id === layer.id) + 1
    return `Image ${n || 1}`
  }
  if (layer.type === 'text') {
    const n = stack.filter((l) => l.type === 'text').findIndex((l) => l.id === layer.id) + 1
    return `Text ${n || 1}`
  }
  return 'Layer'
}
