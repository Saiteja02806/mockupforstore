/**
 * Mockup editor — Fabric 7
 *
 * Do **not** use Fabric `canvas.clipPath` (destination-in) — it caused repeated
 * “cut down” / wrong rendering. Screen masking for preview is handled in the DOM
 * (MockupCanvas: overflow + offset wrapper). Export clips the raster snapshot in 2D
 * (see exportHelpers). FabricImage.clipPath stays unset.
 */
import { Control, FabricImage, Group, Path, Rect, Text, filters, controlsUtils } from 'fabric'
import { useMockupStore } from '../store/mockupStore'

const {
  scalingXOrSkewingY,
  scalingYOrSkewingX,
  scaleSkewCursorStyleHandler,
  scaleOrSkewActionName,
} = controlsUtils

const FRAME_PALETTES = {
  midnight: { body: '#1c1c20', bezel: '#0c0c10', edge: '#1c1c22', shadow: '#080810', lens: '#040408' },
  silver: { body: '#c6ccd6', bezel: '#a9b1bc', edge: '#dee3ea', shadow: '#88909a', lens: '#6d7480' },
  gold: { body: '#d4bc82', bezel: '#b29860', edge: '#e1cfa0', shadow: '#8d733f', lens: '#715a30' },
}

const FRAME_COLOR_TOKENS = {
  '#1c1c20': 'body',
  '#0c0c10': 'bezel',
  '#1c1c22': 'edge',
  '#080810': 'shadow',
  '#040408': 'lens',
  '#090912': 'shadow',
  '#101014': 'bezel',
  '#1e1e28': 'edge',
  '#181820': 'body',
  '#1a1a1e': 'body',
  '#151518': 'body',
  '#0f0f14': 'bezel',
  '#161620': 'bezel',
  '#1a1a24': 'edge',
  '#151520': 'bezel',
  '#2a3040': 'edge',
  '#1e2030': 'edge',
}

/** Axis-aligned box used for fit/fill math (circle screens use their bounding square). */
function screenBox(screenArea) {
  if (!screenArea) return null
  if (screenArea.shape === 'circle') {
    const r = screenArea.r
    return {
      x: screenArea.cx - r,
      y: screenArea.cy - r,
      width: r * 2,
      height: r * 2,
    }
  }
  return {
    x: screenArea.x,
    y: screenArea.y,
    width: screenArea.width,
    height: screenArea.height,
  }
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function makeStatusBarIconGroup(box, color, offsetX = 0, offsetY = 0) {
  const minDim = Math.min(box.width, box.height)
  const iconHeight = clampValue(minDim * 0.042, 10, 16)
  const gap = clampValue(iconHeight * 0.36, 3.5, 7)
  const padX = clampValue(iconHeight * 0.24, 3, 5)
  const padY = clampValue(iconHeight * 0.2, 2.5, 4)

  const wifi = new Path(
    'M 0.8 6.6 C 4.4 2.6 9.1 0.5 14.7 0.5 C 20.1 0.5 24.9 2.6 28.5 6.6 L 15.1 21.9 Z',
    {
      fill: color,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  )
  wifi.scaleToHeight(iconHeight)
  const wifiWidth = wifi.getScaledWidth()
  wifi.set({
    left: padX,
    top: padY + iconHeight * 0.05,
    originX: 'left',
    originY: 'top',
  })

  const signal = new Path(
    'M 0 17 L 17 0 H 19 V 19 H 2 C 0.9 19 0 18.1 0 17 Z',
    {
      fill: color,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  )
  signal.scaleToHeight(iconHeight)
  const signalWidth = signal.getScaledWidth()
  signal.set({
    left: padX + wifiWidth + gap,
    top: padY,
    originX: 'left',
    originY: 'top',
  })

  const battery = new Path(
    'M 4.1 0 H 9.2 V 2.4 H 11.4 C 12.3 2.4 13 3.1 13 4 V 17.4 C 13 18.3 12.3 19 11.4 19 H 1.6 C 0.7 19 0 18.3 0 17.4 V 4 C 0 3.1 0.7 2.4 1.6 2.4 H 4.1 Z',
    {
      fill: color,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  )
  battery.scaleToHeight(iconHeight)
  const batteryWidth = battery.getScaledWidth()
  battery.set({
    left: padX + wifiWidth + signalWidth + gap * 2,
    top: padY,
    originX: 'left',
    originY: 'top',
  })

  const totalWidth = wifiWidth + signalWidth + batteryWidth + gap * 2 + padX * 2
  const totalHeight = iconHeight + padY * 2
  const safeBounds = new Rect({
    left: 0,
    top: 0,
    width: totalWidth,
    height: totalHeight,
    fill: 'rgba(255,255,255,0)',
    strokeWidth: 0,
    selectable: false,
    evented: false,
    objectCaching: false,
  })
  const insetX = clampValue(minDim * 0.04, 10, 18)
  const insetY = clampValue(minDim * 0.034, 8, 14)

  return new Group([safeBounds, wifi, signal, battery], {
    left: box.x + box.width - insetX + padX + offsetX,
    top: box.y + insetY - padY + offsetY,
    width: totalWidth,
    height: totalHeight,
    originX: 'right',
    originY: 'top',
    selectable: false,
    evented: false,
    objectCaching: false,
    subTargetCheck: false,
  })
}

function createVectorStatusBarGroup(screenArea, options = {}) {
  const box = screenBox(screenArea)
  if (!box) return null

  const {
    timeValue = '12:30',
    color = '#111111',
    timeOffsetXPct = 0,
    timeOffsetYPct = 0,
    iconsOffsetXPct = 0,
    iconsOffsetYPct = 0,
  } = options
  const minDim = Math.min(box.width, box.height)
  const topInset = clampValue(minDim * 0.034, 8, 14)
  const sideInset = clampValue(minDim * 0.04, 10, 18)
  const fontSize = clampValue(minDim * 0.05, 13.5, 22)
  const timeOffsetX = (clampValue(Number(timeOffsetXPct) || 0, -30, 30) / 100) * box.width
  const timeOffsetY = (clampValue(Number(timeOffsetYPct) || 0, -30, 30) / 100) * box.height
  const iconsOffsetX = (clampValue(Number(iconsOffsetXPct) || 0, -30, 30) / 100) * box.width
  const iconsOffsetY = (clampValue(Number(iconsOffsetYPct) || 0, -30, 30) / 100) * box.height
  const top = box.y + topInset + timeOffsetY
  const left = box.x + sideInset + timeOffsetX

  const time = new Text(timeValue || '12:30', {
    left,
    top,
    originX: 'left',
    originY: 'top',
    fontFamily: 'Roboto, Arial, system-ui, sans-serif',
    fontWeight: 300,
    fontSize: fontSize * 0.98,
    fill: color,
    charSpacing: -15,
    lineHeight: 1,
    selectable: false,
    evented: false,
    objectCaching: false,
  })

  const icons = makeStatusBarIconGroup(box, color, iconsOffsetX, iconsOffsetY)

  return new Group([time, icons], {
    selectable: false,
    evented: false,
    objectCaching: false,
    subTargetCheck: false,
    excludeFromExport: false,
  })
}

/**
 * Scale factors vs the **screen** rect (same box as vanilla-mockup `sc` / DOM clip / export).
 * - **fit** = min(sx, sy): full image **inside** the glass (contain) — smaller scale when aspects differ.
 * - **fill** = max(sx, sy): image **covers** the glass (cover); extra pixels are clipped.
 *
 * Phones: `phoneScreenRect` tracks real PNG glass, so cover + clip looks correct. Desktop photo
 * frames use measured or detected glass bounds; fill remains the default no-gap placement.
 */
function fitFillScales(intrinsicW, intrinsicH, boxW, boxH) {
  if (!intrinsicW || !intrinsicH || !boxW || !boxH) {
    return { fit: 1, fill: 1 }
  }
  const sx = boxW / intrinsicW
  const sy = boxH / intrinsicH
  return { fit: Math.min(sx, sy), fill: Math.max(sx, sy) }
}

function enforceMinScaleXY(image) {
  const minS = image._minScale || 0.1
  image.set({
    scaleX: Math.max(image.scaleX, minS),
    scaleY: Math.max(image.scaleY, minS),
  })
}

const MAX_USER_ZOOM = 5

/** Fit mode can pan loosely because gaps are expected there; fill mode must keep hard coverage. */
const FIT_PAN_CLAMP_SLACK_PX = 2

function getImageMode(image) {
  return image?._fitMode === 'fit' ? 'fit' : 'fill'
}

function getMinScaleForMode(image, mode = getImageMode(image)) {
  if (!image?._scales) return image?._minScale ?? 0.1
  return mode === 'fit' ? image._scales.fit : image._scales.fill
}

function getPanRange(image, screenArea) {
  const box = screenBox(screenArea)
  if (!box || !image) return { x: 0, y: 0 }
  const w = image.getScaledWidth()
  const h = image.getScaledHeight()

  if (getImageMode(image) === 'fill') {
    return {
      x: Math.max(0, (w - box.width) / 2),
      y: Math.max(0, (h - box.height) / 2),
    }
  }

  return {
    x: Math.max(0, (w + box.width) / 2 - Math.min(box.width, w) * 0.35),
    y: Math.max(0, (h + box.height) / 2 - Math.min(box.height, h) * 0.35),
  }
}

function getImagePanPercent(image, screenArea) {
  const box = screenBox(screenArea)
  if (!box || !image) return { x: 0, y: 0 }
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  const range = getPanRange(image, screenArea)
  return {
    x: range.x > 0 ? clampValue(Math.round(((image.left - centerX) / range.x) * 100), -100, 100) : 0,
    y: range.y > 0 ? clampValue(Math.round(((image.top - centerY) / range.y) * 100), -100, 100) : 0,
  }
}

function setImagePanPercent(image, screenArea, xPercent = 0, yPercent = 0) {
  const box = screenBox(screenArea)
  if (!box || !image) return
  const range = getPanRange(image, screenArea)
  const x = clampValue(Number(xPercent) || 0, -100, 100)
  const y = clampValue(Number(yPercent) || 0, -100, 100)
  image.set({
    left: box.x + box.width / 2 + (range.x * x) / 100,
    top: box.y + box.height / 2 + (range.y * y) / 100,
  })
}

function syncUserImageScreenArea(image, screenArea) {
  if (image && screenArea) {
    image._screenArea = screenArea
  }
}

/**
 * Pan limits in layout space (same box as screenArea / DOM mask / export clip).
 *
 * Fill mode keeps the image covering the whole screen rect so dragging cannot reveal a thin gap
 * at any edge. Fit mode intentionally allows looser panning because letterboxing is expected.
 */
function clampCenterToScreen(image, screenArea) {
  const box = screenBox(screenArea)
  if (!box) return

  const w = image.getScaledWidth()
  const h = image.getScaledHeight()
  const halfW = w / 2
  const halfH = h / 2
  let cx = image.left
  let cy = image.top
  // Fill mode uses zero slack; otherwise max pan can reveal background at an edge.
  const s = getImageMode(image) === 'fill' ? 0 : FIT_PAN_CLAMP_SLACK_PX

  let minCx
  let maxCx
  let minCy
  let maxCy

  if (getImageMode(image) === 'fill') {
    minCx = box.x + box.width - halfW - s
    maxCx = box.x + halfW + s
    minCy = box.y + box.height - halfH - s
    maxCy = box.y + halfH + s

    if (minCx > maxCx) minCx = maxCx = box.x + box.width / 2
    if (minCy > maxCy) minCy = maxCy = box.y + box.height / 2
  } else {
    minCx = box.x - halfW - s
    maxCx = box.x + box.width + halfW + s
    minCy = box.y - halfH - s
    maxCy = box.y + box.height + halfH + s
  }

  if (minCx <= maxCx) {
    cx = Math.min(Math.max(cx, minCx), maxCx)
  }
  if (minCy <= maxCy) {
    cy = Math.min(Math.max(cy, minCy), maxCy)
  }

  image.set({ left: cx, top: cy })
}

function applyPhotoConstraints(image, screenArea) {
  // Do not force scaleX === scaleY here — that breaks corner handles and prevents
  // independent width/height adjustment (canvas.uniformScaling handles shift=uniform).
  image._minScale = getMinScaleForMode(image)
  enforceMinScaleXY(image)
  clampCenterToScreen(image, screenArea)
}

/**
 * While a side/corner scale is in progress, Fabric keeps the opposite edge fixed via
 * wrapWithFixedAnchor. Running clampCenterToScreen on every `scaling` tick re-centers the
 * image inside the allowed band, which shifts both edges and feels like the far side “ripples”.
 * Only enforce minimum scale during the gesture; run full constraints on `modified` (mouseup).
 */
function applyPhotoConstraintsWhileScaling(image) {
  image._minScale = getMinScaleForMode(image)
  enforceMinScaleXY(image)
}

/**
 * Fabric only exposes one handle per side (center). On tall portrait photos in laptop frames the
 * bottom-center dot is easy to miss or sits under the bezel clip; duplicate handles at ±⅓ along
 * each edge so any point along the side can initiate the same axis resize as ml/mr/mt/mb.
 */
function addDistributedEdgeResizeControls(fabricImage) {
  const horiz = {
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionHandler: scalingXOrSkewingY,
    getActionName: scaleOrSkewActionName,
  }
  const vert = {
    cursorStyleHandler: scaleSkewCursorStyleHandler,
    actionHandler: scalingYOrSkewingX,
    getActionName: scaleOrSkewActionName,
  }
  const touch = { touchSizeX: 40, touchSizeY: 40 }
  const c = fabricImage.controls

  c.el_t = new Control({ x: -0.5, y: -1 / 3, ...horiz, offsetX: 20, ...touch })
  c.el_b = new Control({ x: -0.5, y: 1 / 3, ...horiz, offsetX: 20, ...touch })
  c.er_t = new Control({ x: 0.5, y: -1 / 3, ...horiz, offsetX: -20, ...touch })
  c.er_b = new Control({ x: 0.5, y: 1 / 3, ...horiz, offsetX: -20, ...touch })

  c.et_l = new Control({ x: -1 / 3, y: -0.5, ...vert, offsetY: 26, ...touch })
  c.et_r = new Control({ x: 1 / 3, y: -0.5, ...vert, offsetY: 26, ...touch })
  c.eb_l = new Control({ x: -1 / 3, y: 0.5, ...vert, offsetY: -42, touchSizeX: 40, touchSizeY: 48 })
  c.eb_r = new Control({ x: 1 / 3, y: 0.5, ...vert, offsetY: -42, touchSizeX: 40, touchSizeY: 48 })
}

export function enableScrollZoom(fabricCanvas) {
  const handler = (event) => {
    const image = fabricCanvas._userImage
    if (!image) return

    const area = image._screenArea
    const pan = getImagePanPercent(image, area)
    const delta = event.deltaY > 0 ? -0.05 : 0.05
    const floor = getMinScaleForMode(image)
    const next = Math.max(floor, Math.min(image.scaleX + delta, MAX_USER_ZOOM))
    image.set({ scaleX: next, scaleY: next })
    setImagePanPercent(image, area, pan.x, pan.y)
    applyPhotoConstraints(image, area)
    fabricCanvas.requestRenderAll()
    fabricCanvas.fire('object:modified', { target: image })
    event.preventDefault()
    event.stopPropagation()
  }

  const canvasEl = fabricCanvas.getElement()
  canvasEl.addEventListener('wheel', handler, { passive: false })
  return () => canvasEl.removeEventListener('wheel', handler)
}

/**
 * Preview: stretch lower/upper/wrapper CSS size so logical coords stay W×H while display is W×s × H×s.
 * Fabric pointer code uses boundingRect vs buffer size (cssScale) — no transform:scale needed on parents.
 */
export function applyFabricPreviewCssScale(fabricCanvas, previewScale = 1) {
  if (!fabricCanvas || previewScale <= 0) return

  // Use the NATURAL (unscaled) canvas dimensions stored by syncFabricCanvasToLayout.
  // Fallback to current size only on very first call before natural dims are recorded.
  const nw = fabricCanvas._naturalWidth  ?? fabricCanvas.getWidth()
  const nh = fabricCanvas._naturalHeight ?? fabricCanvas.getHeight()

  // Resize the canvas PIXEL BUFFER to match the intended display size.
  // This avoids CSS upscaling (which blurs the content) because buffer === display size.
  fabricCanvas.setDimensions({
    width:  Math.round(nw * previewScale),
    height: Math.round(nh * previewScale),
  })

  // Apply a matching viewport zoom so Fabric objects stay at their original
  // canvas-coordinate positions (objects are authored in the nw×nh space).
  fabricCanvas.setZoom(previewScale)
  fabricCanvas.calcOffset()
}

/** Match Fabric logical size to the active frame layout (never assign canvas.clipPath). */
export function syncFabricCanvasToLayout(fabricCanvas, layout) {
  if (!fabricCanvas || !layout) return

  // Record the frame's natural (unscaled) dimensions so applyFabricPreviewCssScale
  // can always compute the correct scaled buffer size regardless of call order.
  fabricCanvas._naturalWidth  = layout.canvasWidth
  fabricCanvas._naturalHeight = layout.canvasHeight

  // Reset to natural size + no zoom before applying the preview scale.
  fabricCanvas.setDimensions({ width: layout.canvasWidth, height: layout.canvasHeight })
  fabricCanvas.setZoom(1)
  fabricCanvas.clipPath = undefined

  const previewScale = useMockupStore.getState().previewFabricCssScale ?? 1
  applyFabricPreviewCssScale(fabricCanvas, previewScale)
  fabricCanvas.requestRenderAll()
}

export function removeVectorStatusBar(fabricCanvas) {
  const statusBar = fabricCanvas?._vectorStatusBar
  if (!statusBar) return

  try {
    fabricCanvas.remove(statusBar)
  } catch {
    /* no-op if the object was already cleared */
  }

  fabricCanvas._vectorStatusBar = null
  fabricCanvas.requestRenderAll()
}

export function bringVectorStatusBarToFront(fabricCanvas) {
  const statusBar = fabricCanvas?._vectorStatusBar
  if (!fabricCanvas || !statusBar) return

  if (typeof fabricCanvas.bringObjectToFront === 'function') {
    fabricCanvas.bringObjectToFront(statusBar)
  } else {
    fabricCanvas.remove(statusBar)
    fabricCanvas.add(statusBar)
  }
  statusBar.setCoords()
}

export function syncVectorStatusBar(fabricCanvas, screenArea, options = {}) {
  if (!fabricCanvas || !screenArea) return null

  removeVectorStatusBar(fabricCanvas)

  const statusBar = createVectorStatusBarGroup(screenArea, options)
  if (!statusBar) return null

  fabricCanvas._vectorStatusBar = statusBar
  fabricCanvas.add(statusBar)
  bringVectorStatusBarToFront(fabricCanvas)
  fabricCanvas.requestRenderAll()
  return statusBar
}

export function detachUserImageRefsAfterClear(fabricCanvas) {
  if (!fabricCanvas) return
  const image = fabricCanvas._userImage
  if (image) {
    image.off('moving')
    image.off('scaling')
    image.off('modified')
  }
  fabricCanvas._userImage = null
  fabricCanvas._baseScale = null
  fabricCanvas._vectorStatusBar = null
  fabricCanvas.discardActiveObject()
}

export function placeImage(fabricCanvas, imgElement, screenArea, fitMode = 'fill') {
  if (!fabricCanvas || !screenArea) return null

  if (fabricCanvas._userImage) {
    removeUserImage(fabricCanvas)
  }

  const box = screenBox(screenArea)
  const iw = imgElement.naturalWidth || imgElement.width
  const ih = imgElement.naturalHeight || imgElement.height
  const scales = fitFillScales(iw, ih, box.width, box.height)
  const mode = scales[fitMode] != null ? fitMode : 'fill'
  const initialScale = scales[mode]

  if (import.meta.env.DEV) {
    const cw = fabricCanvas.getWidth()
    const ch = fabricCanvas.getHeight()
    if (cw > 0 && ch > 0) {
      if (box.x >= cw || box.y >= ch) {
        console.error(
          '[placeImage] Screen box starts outside canvas — setDimensions must run before placement.',
          { canvas: `${cw}×${ch}`, box }
        )
      } else if (box.x + box.width > cw + 1 || box.y + box.height > ch + 1) {
        console.error('[placeImage] Screen box extends past canvas.', { canvas: `${cw}×${ch}`, box })
      }
    }
  }

  const fabricImage = new FabricImage(
    imgElement,
    iw > 0 && ih > 0 ? { width: iw, height: ih } : {}
  )

  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2

  fabricImage.set({
    left: cx,
    top: cy,
    originX: 'center',
    originY: 'center',
    scaleX: initialScale,
    scaleY: initialScale,
    clipPath: undefined,
    objectCaching: false,
    selectable: true,
    hasControls: false,
    hasBorders: false,
    lockMovementX: false,
    lockMovementY: false,
    lockScalingX: false,
    lockScalingY: false,
    lockRotation: true,
    lockScalingFlip: true,
    cornerColor: '#3b82f6',
    cornerStrokeColor: '#3b82f6',
    borderColor: '#3b82f680',
    cornerSize: 12,
    touchCornerSize: 30,
    cornerStyle: 'circle',
    transparentCorners: false,
    hoverCursor: 'move',
    moveCursor: 'move',
  })

  syncUserImageScreenArea(fabricImage, screenArea)
  fabricImage._scales = scales
  fabricImage._fitMode = mode
  // Always allow zooming out to “full image” (contain) on any device; fill is only the default.
  fabricImage._minScale = getMinScaleForMode(fabricImage, mode)

  const applyFromStoredArea = () => {
    const area = fabricImage._screenArea
    if (area) applyPhotoConstraints(fabricImage, area)
  }
  const scaleFromStoredArea = () => {
    const area = fabricImage._screenArea
    if (area) applyPhotoConstraintsWhileScaling(fabricImage, area)
  }
  const onModified = () => {
    applyFromStoredArea()
    fabricImage.setCoords()
    fabricCanvas.requestRenderAll()
  }
  fabricImage.on('moving', applyFromStoredArea)
  fabricImage.on('scaling', scaleFromStoredArea)
  fabricImage.on('modified', onModified)

  fabricCanvas._userImage = fabricImage
  fabricCanvas._baseScale = initialScale
  fabricCanvas.add(fabricImage)
  applyFromStoredArea()

  addDistributedEdgeResizeControls(fabricImage)

  fabricImage.setControlsVisibility({
    tl: true,
    tr: true,
    br: true,
    bl: true,
    ml: true,
    mt: true,
    mr: true,
    mb: true,
    el_t: true,
    el_b: true,
    er_t: true,
    er_b: true,
    et_l: true,
    et_r: true,
    eb_l: true,
    eb_r: true,
    mtr: false,
  })
  // Edge mid-handles sit on the image AABB. When the box extends past the canvas bitmap, Fabric
  // clips controls. Nudge inward (fixed px) so they draw and hit-test — bottom row especially.
  const ctrls = fabricImage.controls
  if (ctrls.ml) ctrls.ml.offsetX = 20
  if (ctrls.mr) ctrls.mr.offsetX = -20
  if (ctrls.mt) ctrls.mt.offsetY = 26
  if (ctrls.mb) ctrls.mb.offsetY = -42
  if (ctrls.tl) ctrls.tl.offsetY = 10
  if (ctrls.tr) ctrls.tr.offsetY = 10
  if (ctrls.bl) ctrls.bl.offsetY = -14
  if (ctrls.br) ctrls.br.offsetY = -14

  fabricCanvas.setActiveObject(fabricImage)
  bringVectorStatusBarToFront(fabricCanvas)
  fabricImage.setCoords()
  fabricCanvas.requestRenderAll()

  return fabricImage
}

/**
 * Uniform scale as % of the current fit-mode reference (fit = “full image”, fill = “cover”).
 * 100 = that mode’s default scale; lower zooms out (down to _minScale), higher zooms in.
 */
export function setUserImageRelativeScale(fabricCanvas, screenArea, fitMode, percent) {
  const image = fabricCanvas?._userImage
  if (!image || !image._scales) return

  const pan = getImagePanPercent(image, screenArea)
  const ref = fitMode === 'fit' ? image._scales.fit : image._scales.fill
  const minS = getMinScaleForMode(image, fitMode)
  const raw = (percent / 100) * ref
  const s = Math.max(minS, Math.min(raw, MAX_USER_ZOOM))
  image._fitMode = fitMode === 'fit' ? 'fit' : 'fill'
  image._minScale = minS
  image.set({ scaleX: s, scaleY: s })
  syncUserImageScreenArea(image, screenArea)
  setImagePanPercent(image, screenArea, pan.x, pan.y)
  applyPhotoConstraints(image, screenArea)
  fabricCanvas.setActiveObject(image)
  bringVectorStatusBarToFront(fabricCanvas)
  fabricCanvas.requestRenderAll()
  fabricCanvas.fire('object:modified', { target: image })
}

export function setUserImageAxisRelativeScale(fabricCanvas, screenArea, fitMode, axis, percent) {
  const image = fabricCanvas?._userImage
  if (!image || !image._scales) return

  const pan = getImagePanPercent(image, screenArea)
  const ref = fitMode === 'fit' ? image._scales.fit : image._scales.fill
  const minS = getMinScaleForMode(image, fitMode)
  const raw = (percent / 100) * ref
  const s = Math.max(minS, Math.min(raw, MAX_USER_ZOOM))
  image._fitMode = fitMode === 'fit' ? 'fit' : 'fill'
  image._minScale = minS
  image.set(axis === 'y' ? { scaleY: s } : { scaleX: s })
  syncUserImageScreenArea(image, screenArea)
  setImagePanPercent(image, screenArea, pan.x, pan.y)
  applyPhotoConstraints(image, screenArea)
  fabricCanvas.setActiveObject(image)
  bringVectorStatusBarToFront(fabricCanvas)
  fabricCanvas.requestRenderAll()
  fabricCanvas.fire('object:modified', { target: image })
}

export function setUserImagePanRelative(fabricCanvas, screenArea, xPercent = 0, yPercent = 0) {
  const image = fabricCanvas?._userImage
  if (!image) return

  syncUserImageScreenArea(image, screenArea)
  setImagePanPercent(image, screenArea, xPercent, yPercent)
  applyPhotoConstraints(image, screenArea)
  fabricCanvas.setActiveObject(image)
  bringVectorStatusBarToFront(fabricCanvas)
  fabricCanvas.requestRenderAll()
  fabricCanvas.fire('object:modified', { target: image })
}

export function getUserImageAdjustment(fabricCanvas, screenArea, fitMode = 'fill') {
  const image = fabricCanvas?._userImage
  if (!image || !image._scales) {
    return { scalePercent: 100, panXPercent: 0, panYPercent: 0 }
  }

  const ref = fitMode === 'fit' ? image._scales.fit : image._scales.fill
  const pan = getImagePanPercent(image, screenArea || image._screenArea)
  const scaleXPercent = ref ? Math.round((100 * image.scaleX) / ref) : 100
  const scaleYPercent = ref ? Math.round((100 * image.scaleY) / ref) : 100
  return {
    scalePercent: Math.round((scaleXPercent + scaleYPercent) / 2),
    scaleXPercent,
    scaleYPercent,
    panXPercent: pan.x,
    panYPercent: pan.y,
  }
}

export function removeUserImage(fabricCanvas) {
  const image = fabricCanvas?._userImage
  if (!image) return

  image.off('moving')
  image.off('scaling')
  image.off('modified')
  fabricCanvas.remove(image)
  fabricCanvas._userImage = null
  fabricCanvas._baseScale = null
  fabricCanvas.discardActiveObject()
  fabricCanvas.requestRenderAll()
}

export function resetImagePosition(fabricCanvas, screenArea) {
  const image = fabricCanvas?._userImage
  if (!image || fabricCanvas._baseScale == null) return

  const box = screenBox(screenArea)
  const mode = image._fitMode || 'fill'
  const nextScale = image._scales?.[mode] ?? fabricCanvas._baseScale
  image._minScale = getMinScaleForMode(image, mode)

  image.set({
    left: box.x + box.width / 2,
    top: box.y + box.height / 2,
    scaleX: nextScale,
    scaleY: nextScale,
    angle: 0,
  })
  fabricCanvas._baseScale = nextScale
  syncUserImageScreenArea(image, screenArea)
  applyPhotoConstraints(image, screenArea)
  bringVectorStatusBarToFront(fabricCanvas)
  fabricCanvas.requestRenderAll()
}

export function setImageDisplayMode(fabricCanvas, screenArea, mode) {
  const image = fabricCanvas?._userImage
  if (!image) return

  const targetScale = image._scales?.[mode]
  if (targetScale == null) return

  image._fitMode = mode
  image._minScale = getMinScaleForMode(image, mode)
  fabricCanvas._baseScale = targetScale
  syncUserImageScreenArea(image, screenArea)

  const box = screenBox(screenArea)
  image.set({
    left: box.x + box.width / 2,
    top: box.y + box.height / 2,
    scaleX: targetScale,
    scaleY: targetScale,
    angle: 0,
  })

  applyPhotoConstraints(image, screenArea)
  fabricCanvas.setActiveObject(image)
  bringVectorStatusBarToFront(fabricCanvas)
  fabricCanvas.requestRenderAll()
}

export function applyImageFilters(fabricCanvas, { brightness = 0, contrast = 0, opacity = 1 }) {
  const image = fabricCanvas?._userImage
  if (!image) return

  const filterList = []
  if (brightness !== 0) filterList.push(new filters.Brightness({ brightness: brightness / 200 }))
  if (contrast !== 0) filterList.push(new filters.Contrast({ contrast: contrast / 200 }))

  image.filters = filterList
  image.applyFilters()
  image.set({ opacity })
  bringVectorStatusBarToFront(fabricCanvas)
  fabricCanvas.requestRenderAll()
}

export async function fetchFrameSvgMarkup(file, variant) {
  const response = await fetch(file)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const svgMarkup = await response.text()
  return recolorFrameSvgMarkup(svgMarkup, variant)
}

export function recolorFrameSvgMarkup(svgMarkup, variant) {
  const palette = FRAME_PALETTES[variant] || FRAME_PALETTES.midnight
  let nextMarkup = svgMarkup

  for (const [source, token] of Object.entries(FRAME_COLOR_TOKENS)) {
    const target = palette[token]
    nextMarkup = nextMarkup.replace(new RegExp(escapeForRegex(source), 'gi'), target)
  }

  return nextMarkup
}

export function createSvgObjectUrl(svgMarkup) {
  return URL.createObjectURL(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }))
}

export function getBackgroundStyle(backgroundColor, bgGradient) {
  if (!bgGradient) {
    return { background: backgroundColor }
  }

  return {
    background:
      bgGradient.type === 'radial'
        ? `radial-gradient(circle at 50% 35%, ${bgGradient.colors.join(', ')})`
        : `linear-gradient(${bgGradient.angle}deg, ${bgGradient.colors.join(', ')})`,
  }
}

export function paintBackground(ctx, width, height, backgroundColor, bgGradient) {
  ctx.save()

  if (bgGradient) {
    const fill =
      bgGradient.type === 'radial'
        ? createRadialGradient(ctx, width, height, bgGradient.colors)
        : createLinearGradient(ctx, width, height, bgGradient.angle, bgGradient.colors)

    ctx.fillStyle = fill
    ctx.fillRect(0, 0, width, height)
  } else {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
  }

  ctx.restore()
}

export function loadImageElement(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image failed to load'))
    image.src = source
  })
}

async function ensureImageElementDecoded(image) {
  if (typeof image.decode === 'function') {
    try {
      await image.decode()
    } catch {
      /* optional */
    }
  }
}

export function fileToImageElement(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const image = await loadImageElement(event.target.result)
        await ensureImageElementDecoded(image)
        resolve(image)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}

function createLinearGradient(ctx, width, height, angle, colors) {
  const radians = ((angle - 90) * Math.PI) / 180
  const halfWidth = width / 2
  const halfHeight = height / 2
  const radius = Math.hypot(halfWidth, halfHeight)
  const centerX = halfWidth
  const centerY = halfHeight
  const x1 = centerX - Math.cos(radians) * radius
  const y1 = centerY - Math.sin(radians) * radius
  const x2 = centerX + Math.cos(radians) * radius
  const y2 = centerY + Math.sin(radians) * radius
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2)

  addColorStops(gradient, colors)
  return gradient
}

function createRadialGradient(ctx, width, height, colors) {
  const centerX = width / 2
  const centerY = height * 0.35
  const outerRadius = Math.max(width, height) * 0.85
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius)

  addColorStops(gradient, colors)
  return gradient
}

function addColorStops(gradient, colors) {
  if (colors.length === 1) {
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(1, colors[0])
    return
  }

  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })
}

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
