/**
 * Normalized crop rect on the natural image: origin top-left, components in [0, 1].
 * @typedef {{ x: number; y: number; w: number; h: number }} NormCropRect
 */

import { clampCrop, getCoverImageLayout } from '../lib/cropMath.js'

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

const MIN_FRAC = 0.02

/** @returns {NormCropRect} */
export function getDefaultImageCropRect() {
  return { x: 0, y: 0, w: 1, h: 1 }
}

/** @param {Partial<NormCropRect>|null|undefined} r */
export function clampNormRect(r) {
  if (!r || typeof r !== 'object') return getDefaultImageCropRect()
  let x = clamp(Number(r.x) || 0, 0, 1)
  let y = clamp(Number(r.y) || 0, 0, 1)
  let w = clamp(Number(r.w) || 1, MIN_FRAC, 1)
  let h = clamp(Number(r.h) || 1, MIN_FRAC, 1)
  if (x + w > 1) x = clamp(1 - w, 0, 1)
  if (y + h > 1) y = clamp(1 - h, 0, 1)
  return { x, y, w, h }
}

/**
 * Convert legacy cover+zoom+offset crop (modal ref viewport) to a normalized rect (best-effort).
 * @param {number} nw
 * @param {number} nh
 * @param {number} refW
 * @param {number} refH
 * @param {{ zoom?: number; offsetX?: number; offsetY?: number }} legacyCrop
 * @returns {NormCropRect}
 */
export function legacyCoverCropToNormRect(nw, nh, refW, refH, legacyCrop) {
  if (!nw || !nh || !refW || !refH || refW <= 0 || refH <= 0) return getDefaultImageCropRect()
  const viewport = { x: 0, y: 0, width: refW, height: refH }
  const safe = clampCrop(viewport, { width: nw, height: nh }, legacyCrop)
  const layout = getCoverImageLayout(viewport, { width: nw, height: nh }, safe)
  const vx0 = Math.max(0, layout.x)
  const vx1 = Math.min(refW, layout.x + layout.width)
  const vy0 = Math.max(0, layout.y)
  const vy1 = Math.min(refH, layout.y + layout.height)
  const u0 = (vx0 - layout.x) / layout.width
  const u1 = (vx1 - layout.x) / layout.width
  const v0 = (vy0 - layout.y) / layout.height
  const v1 = (vy1 - layout.y) / layout.height
  return clampNormRect({
    x: u0,
    y: v0,
    w: Math.max(u1 - u0, MIN_FRAC),
    h: Math.max(v1 - v0, MIN_FRAC),
  })
}

/**
 * Resolved normalized crop for a store layer (image or mockup), migrating legacy fields once.
 * @param {object} layer
 * @param {number} nw
 * @param {number} nh
 * @returns {NormCropRect}
 */
export function resolveImageCropRect(layer, nw, nh) {
  const hasRect =
    layer?.imageCropRect &&
    typeof layer.imageCropRect === 'object' &&
    typeof layer.imageCropRect.w === 'number' &&
    typeof layer.imageCropRect.h === 'number'
  if (hasRect) return clampNormRect(layer.imageCropRect)

  const legacy = layer?.imageCrop
  const refW = layer?.imageCropRefW
  const refH = layer?.imageCropRefH
  if (
    legacy &&
    typeof refW === 'number' &&
    typeof refH === 'number' &&
    refW > 0 &&
    refH > 0
  ) {
    return legacyCoverCropToNormRect(nw, nh, refW, refH, legacy)
  }
  return getDefaultImageCropRect()
}

/**
 * Pixel source rect from normalized crop.
 * @param {number} nw
 * @param {number} nh
 * @param {NormCropRect} rect
 */
export function normRectToSourcePixels(nw, nh, rect) {
  const r = clampNormRect(rect)
  let sx = Math.round(r.x * nw)
  let sy = Math.round(r.y * nh)
  let sw = Math.round(r.w * nw)
  let sh = Math.round(r.h * nh)
  sx = clamp(sx, 0, Math.max(0, nw - 1))
  sy = clamp(sy, 0, Math.max(0, nh - 1))
  sw = clamp(sw, 1, nw - sx)
  sh = clamp(sh, 1, nh - sy)
  return { sx, sy, sw, sh }
}

/**
 * Contain-fit image inside box; returns pixel geometry for mapping pointer coords.
 * @param {number} nw natural width
 * @param {number} nh natural height
 * @param {number} boxW
 * @param {number} boxH
 */
export function containFitRect(nw, nh, boxW, boxH) {
  if (!nw || !nh || !boxW || !boxH) {
    return { ox: 0, oy: 0, iw: 0, ih: 0, scale: 1 }
  }
  const scale = Math.min(boxW / nw, boxH / nh)
  const iw = nw * scale
  const ih = nh * scale
  const ox = (boxW - iw) / 2
  const oy = (boxH - ih) / 2
  return { ox, oy, iw, ih, scale }
}

/**
 * Normalized coords from stage-local pixel (inside stage box).
 */
export function stagePxToNorm(px, py, contain) {
  const { ox, oy, iw, ih } = contain
  if (iw <= 0 || ih <= 0) return { nx: 0, ny: 0 }
  return {
    nx: clamp((px - ox) / iw, 0, 1),
    ny: clamp((py - oy) / ih, 0, 1),
  }
}
