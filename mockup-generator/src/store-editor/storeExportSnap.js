/**
 * Shared export / preview font size and half-pixel snapping so text and image layers
 * map (x, y) percent → pixels consistently between DOM preview and canvas export.
 */

/** Half-pixel grid in output canvas (or same-scale preview) space. */
export function snapExportHalfPx(v) {
  const s = Math.round(v * 2) / 2
  return s !== 0 || v === 0 ? s : v
}

/** Matches preview text sizing: [`StoreScreenshotEditor.jsx`] fsPx / Math.max(10, …). */
export function storeFontPxFromHeight(h, fontSizePct) {
  return Math.max(10, (h * (fontSizePct ?? 3.5)) / 100)
}
