import {
  resolveImageCropRect,
  normRectToSourcePixels,
} from './storeRectCropMath.js'

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

function getLayerShadow(layer, scale = 1) {
  if (!layer?.shadowOn) return null
  const opacity = clamp(Number(layer.shadowOpacity ?? 0.35), 0, 1)
  if (opacity <= 0) return null
  const s = Math.max(0, Number(scale) || 1)
  return {
    blur: (Math.max(0, Number(layer.shadowBlur ?? 24) || 0)) * s,
    offsetX: (Number(layer.shadowOffsetX ?? 0) || 0) * s,
    offsetY: (Number(layer.shadowOffsetY ?? 12) || 0) * s,
    opacity,
  }
}

/** @deprecated use getDefaultImageCropRect from storeRectCropMath */
export function getDefaultImageCrop() {
  return { zoom: 1, offsetX: 0, offsetY: 0 }
}

export { getDefaultImageCropRect, clampNormRect } from './storeRectCropMath.js'

/** Rounded rect path when `ctx.roundRect` is missing. */
function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2))
  if (rr <= 0) {
    ctx.rect(x, y, w, h)
    return
  }
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  ctx.lineTo(x + rr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
  ctx.lineTo(x, y + rr)
  ctx.quadraticCurveTo(x, y, x + rr, y)
  ctx.closePath()
}

/**
 * Draw an image layer: source rectangle crop + optional rounded clip (export canvas).
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} im
 * @param {object} layer - store editor image or mockup layer
 * @param {number} W
 * @param {number} H
 * @param {number} shadowScale
 */
export function drawStoreImageLayer(ctx, im, layer, W, H, shadowScale = 1) {
  const nw = im.naturalWidth || im.width
  const nh = im.naturalHeight || im.height
  if (!nw || !nh) return

  const mw = W * ((layer.wPct ?? 22) / 100)
  if (mw <= 0) return

  const norm = resolveImageCropRect(layer, nw, nh)
  const { sx, sy, sw, sh } = normRectToSourcePixels(nw, nh, norm)
  if (sw <= 0 || sh <= 0) return

  const mh = mw * (sh / sw)
  const cx = (W * (layer.x ?? 50)) / 100
  const cy = (H * (layer.y ?? 50)) / 100
  const rot = (((layer.rotation ?? 0) * Math.PI) / 180)

  const ratio = clamp(Number(layer.imageCornerRadiusRatio) || 0, 0, 1)
  const r = ratio * 0.5 * Math.min(mw, mh)

  ctx.save()
  ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1)
  ctx.translate(cx, cy)
  if (rot !== 0) ctx.rotate(rot)

  const shadow = getLayerShadow(layer, shadowScale)
  if (shadow && typeof document !== 'undefined') {
    const offW = Math.max(1, Math.round(mw))
    const offH = Math.max(1, Math.round(mh))
    const offscreen = document.createElement('canvas')
    offscreen.width = offW
    offscreen.height = offH
    const octx = offscreen.getContext('2d', { alpha: true })
    if (octx) {
      const sxScale = offW / mw
      const syScale = offH / mh
      octx.save()
      octx.scale(sxScale, syScale)
      octx.beginPath()
      if (typeof octx.roundRect === 'function') {
        octx.roundRect(0, 0, mw, mh, r)
      } else {
        roundRectPath(octx, 0, 0, mw, mh, r)
      }
      octx.clip()
      octx.drawImage(im, sx, sy, sw, sh, 0, 0, mw, mh)
      octx.restore()

      ctx.shadowColor = `rgba(0,0,0,${shadow.opacity})`
      ctx.shadowBlur = shadow.blur
      ctx.shadowOffsetX = shadow.offsetX
      ctx.shadowOffsetY = shadow.offsetY
      ctx.drawImage(offscreen, -mw / 2, -mh / 2, mw, mh)
      ctx.restore()
      return
    }
  }

  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-mw / 2, -mh / 2, mw, mh, r)
  } else {
    roundRectPath(ctx, -mw / 2, -mh / 2, mw, mh, r)
  }
  ctx.clip()

  ctx.drawImage(im, sx, sy, sw, sh, -mw / 2, -mh / 2, mw, mh)
  ctx.restore()
}

/**
 * Preview layout for stage: outer box mw×mh (mh from cropped aspect), inner img absolute px.
 */
export function getImageLayerPreviewBox(layer, natW, natH, mw) {
  const nw = natW || 1
  const nh = natH || 1
  const norm = resolveImageCropRect(layer, nw, nh)
  const { sx, sy, sw, sh } = normRectToSourcePixels(nw, nh, norm)
  const mh = mw * (sh / Math.max(sw, 1))
  const scale = mw / Math.max(sw, 1)
  const ratio = clamp(Number(layer.imageCornerRadiusRatio) || 0, 0, 1)
  const cornerRadiusPx = ratio * 0.5 * Math.min(mw, mh)
  const layout = {
    width: nw * scale,
    height: nh * scale,
    left: -sx * scale,
    top: -sy * scale,
  }
  return { mw, mh, layout, cornerRadiusPx }
}

/** Cropped aspect ratio sh/sw from layer + natural size. */
export function getLayerCroppedAspect(layer, nw, nh) {
  const norm = resolveImageCropRect(layer, nw || 1, nh || 1)
  const { sw, sh } = normRectToSourcePixels(nw || 1, nh || 1, norm)
  return sh / Math.max(sw, 1)
}
