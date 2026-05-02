/**
 * Non-destructive screenshot crop (cover + pan + zoom) in **screen viewport** space.
 * Same math for mini-preview (CSS) and Fabric placement / export (via Fabric snapshot).
 */

/** @typedef {{ x: number; y: number; width: number; height: number }} Rect */
/** @typedef {{ width: number; height: number }} ImageSize */
/** @typedef {{ zoom: number; offsetX: number; offsetY: number }} ScreenshotCrop */

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * @param {Rect} viewport - usually { x:0, y:0, width, height } of the device screen hole
 * @param {ImageSize} imageSize
 * @param {ScreenshotCrop} crop
 */
export function getCoverImageLayout(viewport, imageSize, crop) {
  const safeZoom = Math.max(1, crop.zoom || 1)

  const baseScale = Math.max(
    viewport.width / imageSize.width,
    viewport.height / imageSize.height,
  )

  const scale = baseScale * safeZoom

  const renderedWidth = imageSize.width * scale
  const renderedHeight = imageSize.height * scale

  const centeredX = (viewport.width - renderedWidth) / 2
  const centeredY = (viewport.height - renderedHeight) / 2

  const rawX = centeredX + crop.offsetX
  const rawY = centeredY + crop.offsetY

  const minX = viewport.width - renderedWidth
  const maxX = 0

  const minY = viewport.height - renderedHeight
  const maxY = 0

  const x = clamp(rawX, minX, maxX)
  const y = clamp(rawY, minY, maxY)

  return {
    x,
    y,
    width: renderedWidth,
    height: renderedHeight,
    scale,
  }
}

export function clampCrop(viewport, imageSize, crop) {
  const layout = getCoverImageLayout(viewport, imageSize, crop)

  const baseScale = Math.max(
    viewport.width / imageSize.width,
    viewport.height / imageSize.height,
  )

  const scale = baseScale * Math.max(1, crop.zoom || 1)

  const renderedWidth = imageSize.width * scale
  const renderedHeight = imageSize.height * scale

  const centeredX = (viewport.width - renderedWidth) / 2
  const centeredY = (viewport.height - renderedHeight) / 2

  return {
    zoom: Math.max(1, crop.zoom || 1),
    offsetX: layout.x - centeredX,
    offsetY: layout.y - centeredY,
  }
}

export function clampBorderRadius(radius, viewport) {
  const maxRadius = Math.min(viewport.width, viewport.height) / 2
  return clamp(radius || 0, 0, maxRadius)
}

/**
 * Inverse: read uniform scale + center position from Fabric (origin center) → crop in viewport space.
 * @param {Rect} box - screen box in canvas coords (same as viewport size, origin at box.x/box.y in canvas — we use local 0,0 viewport)
 * @param {number} iw
 * @param {number} ih
 * @param {number} centerX - fabric image left
 * @param {number} centerY - fabric image top
 * @param {number} scaleX - uniform expected
 */
export function fabricCenteredImageToCrop(box, iw, ih, centerX, centerY, scaleX) {
  const viewport = { x: 0, y: 0, width: box.width, height: box.height }
  const scaledW = iw * scaleX
  const scaledH = ih * scaleX
  const topLeftX = centerX - scaledW / 2 - box.x
  const topLeftY = centerY - scaledH / 2 - box.y
  const centeredX = (viewport.width - scaledW) / 2
  const centeredY = (viewport.height - scaledH) / 2
  const rawCrop = {
    zoom: scaleX / Math.max(viewport.width / iw, viewport.height / ih),
    offsetX: topLeftX - centeredX,
    offsetY: topLeftY - centeredY,
  }
  return clampCrop(viewport, { width: iw, height: ih }, rawCrop)
}

export const defaultScreenshotCrop = () => ({ zoom: 1, offsetX: 0, offsetY: 0 })

/**
 * @param {{ x: number; y: number; width: number; height: number }} box - screen AABB in canvas coords
 * @param {{ width: number; height: number }} imageSize
 * @param {ScreenshotCrop} crop
 * @returns {{ left: number; top: number; scaleX: number; scaleY: number }} Fabric `left`/`top` with origin **center**
 */
export function layoutUserImageInScreenBox(box, imageSize, crop) {
  const viewport = { x: 0, y: 0, width: box.width, height: box.height }
  const clamped = clampCrop(viewport, imageSize, crop)
  const layout = getCoverImageLayout(viewport, imageSize, clamped)
  return {
    left: box.x + layout.x + layout.width / 2,
    top: box.y + layout.y + layout.height / 2,
    scaleX: layout.scale,
    scaleY: layout.scale,
  }
}

/** @param {number} centerX @param {number} centerY — Fabric center (`left`/`top`) in canvas space */
export function cropFromFabricUniform(box, iw, ih, centerX, centerY, scaleX) {
  return fabricCenteredImageToCrop(box, iw, ih, centerX, centerY, scaleX)
}
