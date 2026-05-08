import {
  resolveImageCropRect,
  normRectToSourcePixels,
} from './storeRectCropMath.js'
import { snapExportHalfPx } from './storeExportSnap.js'

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

/**
 * Single source of truth for image + mockup layers on a WxH canvas.
 *
 * Important:
 * - Big mockups/images keep half-pixel snapping for crisp export.
 * - Tiny icons skip snapping because 0.5px / 1px changes are visible at small sizes.
 */
export function getStoreImageLayerGeometry(layer, natW, natH, W, H) {
  const nw = natW || 1
  const nh = natH || 1

  const norm = resolveImageCropRect(layer, nw, nh)
  const { sx, sy, sw, sh } = normRectToSourcePixels(nw, nh, norm)
  if (sw <= 0 || sh <= 0) return null

  const rawW = W * ((layer.wPct ?? 22) / 100)
  if (rawW <= 0) return null

  const shouldSnap = shouldSnapStoreImageLayer(layer, W)

  let mw = shouldSnap ? snapExportHalfPx(rawW) : rawW
  if (mw <= 0 && rawW > 0) mw = rawW

  const mh = mw * (sh / sw)

  const rawCx = (W * (layer.x ?? 50)) / 100
  const rawCy = (H * (layer.y ?? 50)) / 100

  const cx = shouldSnap ? snapExportHalfPx(rawCx) : rawCx
  const cy = shouldSnap ? snapExportHalfPx(rawCy) : rawCy

  const ratio = clamp(Number(layer.imageCornerRadiusRatio) || 0, 0, 1)
  const cornerRadiusPx = ratio * 0.5 * Math.min(mw, mh)

  const scale = mw / Math.max(sw, 1)

  return {
    cx,
    cy,
    mw,
    mh,
    sx,
    sy,
    sw,
    sh,
    cornerRadiusPx,
    layout: {
      width: nw * scale,
      height: nh * scale,
      left: -sx * scale,
      top: -sy * scale,
    },
  }
}

export function shouldSnapStoreImageLayer(layer, W) {
  const rawW = W * ((layer.wPct ?? 22) / 100)
  return (
    layer.type === 'mockup' ||
    rawW >= 160 ||
    layer.forceSnap === true
  )
}

export function scaleStoreImageGeometryToPreview(g, previewW, previewH, exportW, exportH) {
  const xs = previewW / exportW
  const ys = previewH / exportH

  return {
    cx: g.cx * xs,
    cy: g.cy * ys,
    mw: g.mw * xs,
    mh: g.mh * ys,
    cornerRadiusPx: g.cornerRadiusPx * Math.min(xs, ys),
    layout: {
      width: g.layout.width * xs,
      height: g.layout.height * ys,
      left: g.layout.left * xs,
      top: g.layout.top * ys,
    },
  }
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

export function drawStoreImageLayer(ctx, im, layer, W, H, shadowScale = 1) {
  const nw = im.naturalWidth || im.width
  const nh = im.naturalHeight || im.height

  if (!nw || !nh) return

  const g = getStoreImageLayerGeometry(layer, nw, nh, W, H)
  if (!g) return

  const { cx, cy, mw, mh, sx, sy, sw, sh } = g
  const r = g.cornerRadiusPx
  const ratio = clamp(Number(layer.imageCornerRadiusRatio) || 0, 0, 1)
  const rot = ((layer.rotation ?? 0) * Math.PI) / 180

  ctx.save()

  ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1)
  ctx.translate(cx, cy)

  if (rot !== 0) {
    ctx.rotate(rot)
  }

  const shadow = getLayerShadow(layer, shadowScale)

  if (shadow && typeof document !== 'undefined') {
    const offW = Math.max(1, Math.round(mw))
    const offH = Math.max(1, Math.round((mh * offW) / mw))
    const rOff = ratio * 0.5 * Math.min(offW, offH)

    const offscreen = document.createElement('canvas')
    offscreen.width = offW
    offscreen.height = offH

    const octx = offscreen.getContext('2d', { alpha: true })

    if (octx) {
      octx.save()
      octx.beginPath()

      if (typeof octx.roundRect === 'function') {
        octx.roundRect(0, 0, offW, offH, rOff)
      } else {
        roundRectPath(octx, 0, 0, offW, offH, rOff)
      }

      octx.clip()
      octx.drawImage(im, sx, sy, sw, sh, 0, 0, offW, offH)
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

export function getImageLayerPreviewBox(layer, natW, natH, mw) {
  const nw = natW || 1
  const nh = natH || 1

  const norm = resolveImageCropRect(layer, nw, nh)
  const { sx, sy, sw, sh } = normRectToSourcePixels(nw, nh, norm)

  const mh = mw * (sh / Math.max(sw, 1))
  const scale = mw / Math.max(sw, 1)

  const ratio = clamp(Number(layer.imageCornerRadiusRatio) || 0, 0, 1)
  const cornerRadiusPx = ratio * 0.5 * Math.min(mw, mh)

  return {
    mw,
    mh,
    cornerRadiusPx,
    layout: {
      width: nw * scale,
      height: nh * scale,
      left: -sx * scale,
      top: -sy * scale,
    },
  }
}

export function getLayerCroppedAspect(layer, nw, nh) {
  const norm = resolveImageCropRect(layer, nw || 1, nh || 1)
  const { sw, sh } = normRectToSourcePixels(nw || 1, nh || 1, norm)

  return sh / Math.max(sw, 1)
}
