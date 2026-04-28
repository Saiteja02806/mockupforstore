import { getEffectiveFrameLayout, getFrameAssetUrl, isRasterFrame } from '../data/frames'
import { useMockupStore } from '../store/mockupStore'
import { createSvgObjectUrl, fetchFrameSvgMarkup, loadImageElement, paintBackground } from './canvasHelpers'
import { getFrameShadowFilter } from './frameShadow'

/** Read a File object into an HTMLImageElement. */
function fileToImageElementDirect(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Failed to load ${file.name}`)) }
    img.src = url
  })
}

function resolveExportLayout(selectedFrame) {
  const intrinsic = useMockupStore.getState().rasterIntrinsic
  return getEffectiveFrameLayout(selectedFrame, intrinsic)
}

/** Same screen hole as DOM preview / layout, in export pixel space (multiplier × boost). */
function clipCtxToLayoutScreen(ctx, screenArea, m) {
  if (!screenArea) return
  ctx.beginPath()
  if (screenArea.shape === 'circle') {
    ctx.arc(screenArea.cx * m, screenArea.cy * m, screenArea.r * m, 0, Math.PI * 2)
    ctx.closePath()
    return
  }
  if (screenArea.shape === 'polygon' && Array.isArray(screenArea.points) && screenArea.points.length >= 3) {
    const [first, ...rest] = screenArea.points
    ctx.moveTo(first.x * m, first.y * m)
    for (const point of rest) {
      ctx.lineTo(point.x * m, point.y * m)
    }
    ctx.closePath()
    return
  }
  const x = screenArea.x * m
  const y = screenArea.y * m
  const w = screenArea.width * m
  const h = screenArea.height * m
  const r = Math.min((screenArea.radius || 0) * m, w / 2, h / 2)
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.rect(x, y, w, h)
  }
  ctx.closePath()
}

export async function downloadAsPNG(options, fileName = 'mockup') {
  const dataUrl = await composeMockupDataUrl({ ...options, format: 'png', quality: 1 })
  triggerDownload(dataUrl, `${fileName}.png`)
}

export async function downloadAsJPG(options, fileName = 'mockup') {
  const dataUrl = await composeMockupDataUrl({ ...options, format: 'jpeg', quality: 0.95 })
  triggerDownload(dataUrl, `${fileName}.jpg`)
}

export async function copyToClipboard(options) {
  const dataUrl = await composeMockupDataUrl({ ...options, format: 'png', quality: 1 })

  try {
    const blob = await (await fetch(dataUrl)).blob()
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch {
    return false
  }
}

/** PNG data URLs for App / Play Store editor (scene + transparent background variant). */
export async function getStoreEditorCaptureDataUrls(options) {
  const base = { ...options, format: 'png', quality: 1, multiplier: 2 }
  const withSceneFull = await composeMockupDataUrl({ ...base, includeBackground: true })
  const deviceOnlyFull = await composeMockupDataUrl({ ...base, includeBackground: false })
  return cropStoreEditorCapturesToDeviceBounds(withSceneFull, deviceOnlyFull)
}

async function cropStoreEditorCapturesToDeviceBounds(withSceneDataUrl, deviceOnlyDataUrl) {
  const deviceOnly = await loadImageElement(deviceOnlyDataUrl)
  const bounds = getAlphaBounds(deviceOnly)
  if (!bounds) return { withScene: withSceneDataUrl, deviceOnly: deviceOnlyDataUrl }

  const padding = 8
  const crop = {
    x: Math.max(0, bounds.x - padding),
    y: Math.max(0, bounds.y - padding),
    width: Math.min(deviceOnly.naturalWidth - Math.max(0, bounds.x - padding), bounds.width + padding * 2),
    height: Math.min(deviceOnly.naturalHeight - Math.max(0, bounds.y - padding), bounds.height + padding * 2),
  }

  const [withScene, deviceOnlyCropped] = await Promise.all([
    cropDataUrl(withSceneDataUrl, crop),
    cropDataUrl(deviceOnlyDataUrl, crop),
  ])
  return { withScene, deviceOnly: deviceOnlyCropped }
}

function getAlphaBounds(img) {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha <= 1) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (maxX < minX || maxY < minY) return null
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  }
}

async function cropDataUrl(dataUrl, crop) {
  const img = await loadImageElement(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(crop.width))
  canvas.height = Math.max(1, Math.round(crop.height))
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl
  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  return canvas.toDataURL('image/png', 1)
}

async function composeMockupDataUrl({
  fabricCanvas,
  selectedFrame,
  frameColorVariant,
  frameShadowStrength,
  backgroundColor,
  bgGradient,
  format,
  quality,
  multiplier = 2,
  includeBackground = true,
}) {
  if (!fabricCanvas || !selectedFrame) {
    throw new Error('Canvas is not ready to export')
  }

  const layout = resolveExportLayout(selectedFrame)
  const boost = layout.exportMultiplierBoost
  const width = Math.round(layout.canvasWidth * multiplier * boost)
  const height = Math.round(layout.canvasHeight * multiplier * boost)
  const output = document.createElement('canvas')
  output.width = width
  output.height = height

  const context = output.getContext('2d')
  if (includeBackground) {
    paintBackground(context, width, height, backgroundColor, bgGradient)
  } else {
    context.clearRect(0, 0, width, height)
  }

  const imageLayerUrl = fabricCanvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: multiplier * boost,
  })
  const imageLayer = await loadImageElement(imageLayerUrl)
  const m = multiplier * boost
  context.save()
  if (layout.screenArea) {
    clipCtxToLayoutScreen(context, layout.screenArea, m)
    context.clip()
  }
  context.drawImage(imageLayer, 0, 0, width, height)
  context.restore()

  let frameBlobUrl = null
  try {
    let frameLayer
    if (isRasterFrame(selectedFrame)) {
      const src = getFrameAssetUrl(selectedFrame, frameColorVariant)
      if (!src) {
        throw new Error('Missing raster frame asset')
      }
      frameLayer = await loadImageElement(src)
    } else {
      const frameMarkup = await fetchFrameSvgMarkup(selectedFrame.file, frameColorVariant)
      frameBlobUrl = createSvgObjectUrl(frameMarkup)
      frameLayer = await loadImageElement(frameBlobUrl)
    }
    context.save()
    context.filter = getFrameShadowFilter(frameShadowStrength, m)
    context.drawImage(frameLayer, 0, 0, width, height)
    context.restore()
  } finally {
    if (frameBlobUrl) URL.revokeObjectURL(frameBlobUrl)
  }

  return output.toDataURL(`image/${format}`, quality)
}

function triggerDownload(dataUrl, fileName) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Batch-export multiple screenshot files using the current frame + scene settings.
 * Downloads each one individually (sequential, 300 ms apart to avoid browser blocking).
 *
 * @param {File[]}   files          - Raw image files to place into the device frame
 * @param {object}   baseOptions    - Same shape as composeMockupDataUrl options (canvas, frame, etc.)
 * @param {object}   selectedFrame  - The currently selected device frame
 * @param {function} onProgress     - Called with (doneCount) after each successful export
 */
export async function batchDownloadAll(files, baseOptions, selectedFrame, onProgress) {
  const { frameColorVariant, frameShadowStrength, backgroundColor, bgGradient, bgImageDataUrl, bgBlur } = baseOptions

  const layout = resolveExportLayout(selectedFrame)
  if (!layout.screenArea) throw new Error('Selected frame has no screen area')

  const multiplier = 2
  const boost = layout.exportMultiplierBoost ?? 1
  const width  = Math.round(layout.canvasWidth  * multiplier * boost)
  const height = Math.round(layout.canvasHeight * multiplier * boost)
  const m = multiplier * boost

  // Pre-load the frame layer once (shared across all exports)
  let frameBlobUrl = null
  let frameLayer
  try {
    if (isRasterFrame(selectedFrame)) {
      const src = getFrameAssetUrl(selectedFrame, frameColorVariant)
      if (!src) throw new Error('Missing raster frame asset')
      frameLayer = await loadImageElement(src)
    } else {
      const markup = await fetchFrameSvgMarkup(selectedFrame.file, frameColorVariant)
      frameBlobUrl = createSvgObjectUrl(markup)
      frameLayer = await loadImageElement(frameBlobUrl)
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const output = document.createElement('canvas')
      output.width  = width
      output.height = height
      const ctx = output.getContext('2d')

      // Background
      if (bgImageDataUrl) {
        const bgImg = await loadImageElement(bgImageDataUrl)
        if (bgBlur > 0) {
          ctx.filter = `blur(${bgBlur}px)`
          ctx.drawImage(bgImg, -bgBlur * 2, -bgBlur * 2, width + bgBlur * 4, height + bgBlur * 4)
          ctx.filter = 'none'
        } else {
          ctx.drawImage(bgImg, 0, 0, width, height)
        }
      } else {
        paintBackground(ctx, width, height, backgroundColor, bgGradient)
      }

      // Screenshot inside screen clip
      const screenshotEl = await fileToImageElementDirect(file)
      const sa = layout.screenArea
      ctx.save()
      ctx.beginPath()
      if (sa.shape === 'circle') {
        ctx.arc(sa.cx * m, sa.cy * m, sa.r * m, 0, Math.PI * 2)
      } else if (sa.shape === 'polygon' && sa.points?.length >= 3) {
        const [first, ...rest] = sa.points
        ctx.moveTo(first.x * m, first.y * m)
        rest.forEach((p) => ctx.lineTo(p.x * m, p.y * m))
      } else {
        const x = sa.x * m, y = sa.y * m, w = sa.width * m, h = sa.height * m
        const r = Math.min((sa.radius || 0) * m, w / 2, h / 2)
        if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r)
        else ctx.rect(x, y, w, h)
      }
      ctx.closePath()
      ctx.clip()
      // Fill screen area with screenshot (cover mode)
      const saW = (sa.width || sa.r * 2) * m
      const saH = (sa.height || sa.r * 2) * m
      const saX = (sa.x ?? (sa.cx - sa.r)) * m
      const saY = (sa.y ?? (sa.cy - sa.r)) * m
      const scale = Math.max(saW / screenshotEl.width, saH / screenshotEl.height)
      const dw = screenshotEl.width  * scale
      const dh = screenshotEl.height * scale
      ctx.drawImage(screenshotEl, saX + (saW - dw) / 2, saY + (saH - dh) / 2, dw, dh)
      ctx.restore()

      // Frame overlay
      ctx.save()
      ctx.filter = getFrameShadowFilter(frameShadowStrength, m)
      ctx.drawImage(frameLayer, 0, 0, width, height)
      ctx.restore()

      const baseName = file.name.replace(/\.[^.]+$/, '')
      const dataUrl  = output.toDataURL('image/png', 1)
      triggerDownload(dataUrl, `${baseName}_mockup.png`)

      onProgress?.(i + 1)

      // Brief pause between downloads to avoid browser throttling
      if (i < files.length - 1) await new Promise((r) => setTimeout(r, 350))
    }
  } finally {
    if (frameBlobUrl) URL.revokeObjectURL(frameBlobUrl)
  }
}
