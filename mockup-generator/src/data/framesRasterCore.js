/**
 * Shared raster frame helpers (phones, tablets, desktop photos, watches).
 * Kept separate so `framesDesktop.js` can import without circular deps with `frames.js`.
 */

export const RASTER_ASSETS_SINGLE = (path) => ({
  midnight: path,
  silver: path,
  gold: path,
})

/**
 * Map `vanilla-mockup/frames.js` viewport (vw×vh) + glass rect onto raster size (w×h).
 */
export function rasterRectFromVanilla(w, h, vw, vh, sx, sy, sw, sh, rx) {
  const refMin = Math.min(vw, vh)
  const minWH = Math.min(w, h)
  return {
    x: Math.round((w * sx) / vw),
    y: Math.round((h * sy) / vh),
    width: Math.round((w * sw) / vw),
    height: Math.round((h * sh) / vh),
    radius: rx > 0 ? Math.round((minWH * rx) / refMin) : 0,
    shape: 'rect',
  }
}

export function rasterFrameFromSpec(id, label, fileName, w, h, screenFn) {
  const url = `/assets/frames/${fileName}`
  return {
    kind: 'raster',
    id,
    label,
    file: url,
    assets: RASTER_ASSETS_SINGLE(url),
    canvasWidth: w,
    canvasHeight: h,
    screenArea: screenFn(w, h),
    computeScreenArea: screenFn,
  }
}
