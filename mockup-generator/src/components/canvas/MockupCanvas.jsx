import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas } from 'fabric'
import { useShallow } from 'zustand/react/shallow'
import { useMockupStore } from '../../store/mockupStore'
import { getEffectiveFrameLayout, getFrameAssetUrl, isRasterFrame } from '../../data/frames'
import {
  applyFabricPreviewCssScale,
  createSvgObjectUrl,
  detachUserImageRefsAfterClear,
  enableScrollZoom,
  fetchFrameSvgMarkup,
  getBackgroundStyle,
  setImageDisplayMode,
  syncFabricCanvasToLayout,
} from '../../utils/canvasHelpers'
import { getFrameShadowFilter } from '../../utils/frameShadow'
import { detectRasterScreenAreaFromImage } from '../../utils/rasterScreenDetect'

/** Cap CSS scale so tall devices read as a preview, not full-viewport chrome */
const PREVIEW_MAX_SCALE = 0.68

/** Clamp combined auto-scale × user zoom boost */
const PREVIEW_SCALE_MIN = 0.18
const PREVIEW_SCALE_MAX = 1.35

function computePreviewScale(wrapperEl, layout, frame) {
  if (!wrapperEl) return 1
  const { width, height } = wrapperEl.getBoundingClientRect()
  if (width < 2 || height < 2) return 1
  const availableWidth = Math.max(width - 48, 1)
  const availableHeight = Math.max(height - 48, 1)
  const fitScale = Math.min(availableWidth / layout.canvasWidth, availableHeight / layout.canvasHeight)
  const targetHeight = Number(frame?.previewTargetHeight) || 0
  if (targetHeight > 0 && layout.canvasHeight > 0) {
    return Math.round(Math.min(fitScale, targetHeight / layout.canvasHeight) * 1000) / 1000
  }
  return Math.round(Math.min(fitScale, PREVIEW_MAX_SCALE) * 1000) / 1000
}

/**
 * Clip **only** the Fabric lower canvas to the device glass (CSS clip-path).
 * The upper canvas stays unclipped and is stacked above the frame so resize/move
 * handles are not hidden under opaque bezel or cut off by a small overflow box.
 */
function applyLowerCanvasScreenClip(lowerEl, screenArea, canvasWidth, canvasHeight, previewScale) {
  if (!lowerEl) return
  if (!screenArea) {
    lowerEl.style.clipPath = ''
    lowerEl.style.webkitClipPath = ''
    return
  }
  const s = previewScale
  if (screenArea.shape === 'circle') {
    const cx = screenArea.cx * s
    const cy = screenArea.cy * s
    const r = screenArea.r * s
    const path = `circle(${r}px at ${cx}px ${cy}px)`
    lowerEl.style.clipPath = path
    lowerEl.style.webkitClipPath = path
    return
  }
  if (screenArea.shape === 'polygon' && Array.isArray(screenArea.points) && screenArea.points.length >= 3) {
    const points = screenArea.points
      .map((point) => `${Math.round(point.x * s * 100) / 100}px ${Math.round(point.y * s * 100) / 100}px`)
      .join(', ')
    const path = `polygon(${points})`
    lowerEl.style.clipPath = path
    lowerEl.style.webkitClipPath = path
    return
  }
  const top = screenArea.y * s
  const right = (canvasWidth - screenArea.x - screenArea.width) * s
  const bottom = (canvasHeight - screenArea.y - screenArea.height) * s
  const left = screenArea.x * s
  const maxR = Math.min(screenArea.width * s, screenArea.height * s) / 2
  const r = Math.min((screenArea.radius || 0) * s, maxR)
  const round = r > 0 ? ` round ${r}px` : ''
  const path = `inset(${top}px ${right}px ${bottom}px ${left}px${round})`
  lowerEl.style.clipPath = path
  lowerEl.style.webkitClipPath = path
}

export default function MockupCanvas({ onCanvasReady }) {
  const wrapperRef = useRef(null)
  const artboardRef = useRef(null)
  const frameImgRef = useRef(null)
  const containerRef = useRef(null)
  const fabricRef = useRef(null)
  const cleanupZoomRef = useRef(null)
  const frameUrlRef = useRef(null)
  const frameOverlayUrlRef = useRef(null)
  const ensureUpperStackRef = useRef(() => {})
  const layoutStateRef = useRef({ frameId: null, canvasWidth: 0, canvasHeight: 0 })
  const [basePreviewScale, setBasePreviewScale] = useState(1)
  const [frameOverlayUrl, setFrameOverlayUrl] = useState(null)

  frameOverlayUrlRef.current = frameOverlayUrl
  const {
    selectedFrame,
    backgroundColor,
    bgGradient,
    frameColorVariant,
    frameShadowStrength,
    setIsLoading,
    setError,
    rasterIntrinsic,
    setRasterIntrinsic,
    previewZoomBoost,
    bumpPreviewZoomBoost,
    resetPreviewZoomBoost,
  } = useMockupStore(
    useShallow((s) => ({
      selectedFrame: s.selectedFrame,
      backgroundColor: s.backgroundColor,
      bgGradient: s.bgGradient,
      frameColorVariant: s.frameColorVariant,
      frameShadowStrength: s.frameShadowStrength,
      setIsLoading: s.setIsLoading,
      setError: s.setError,
      rasterIntrinsic: s.rasterIntrinsic,
      setRasterIntrinsic: s.setRasterIntrinsic,
      previewZoomBoost: s.previewZoomBoost,
      bumpPreviewZoomBoost: s.bumpPreviewZoomBoost,
      resetPreviewZoomBoost: s.resetPreviewZoomBoost,
    }))
  )
  const effectivePreviewScaleMax = selectedFrame?.previewScaleMax ?? PREVIEW_SCALE_MAX

  const scale = Math.min(
    effectivePreviewScaleMax,
    Math.max(PREVIEW_SCALE_MIN, basePreviewScale * previewZoomBoost)
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const canvasEl = document.createElement('canvas')
    canvasEl.id = 'mockup-canvas'
    container.appendChild(canvasEl)

    const canvas = new Canvas(canvasEl, {
      selection: false,
      renderOnAddRemove: false,
      preserveObjectStacking: true,
      // Logical buffer W×H; preview display size is W×s via CSS (see applyFabricPreviewCssScale).
      enableRetinaScaling: false,
      controlsAboveOverlay: true,
      // false: corner handles adjust width/height independently; Shift still forces uniform (uniScaleKey).
      uniformScaling: false,
    })

    fabricRef.current = canvas
    onCanvasReady?.(canvas)
    cleanupZoomRef.current = enableScrollZoom(canvas)

    const onAfterRender = () => {
      ensureUpperStackRef.current()
    }
    canvas.on('after:render', onAfterRender)

    return () => {
      canvas.off('after:render', onAfterRender)
      if (cleanupZoomRef.current) cleanupZoomRef.current()
      if (frameUrlRef.current) {
        URL.revokeObjectURL(frameUrlRef.current)
        frameUrlRef.current = null
      }
      try {
        const u = canvas.upperCanvasEl
        const w = canvas.wrapperEl
        if (u && w && u.parentNode !== w) {
          w.appendChild(u)
        }
      } catch {
        /* dispose will run even if DOM is torn down */
      }
      canvas.dispose()
      fabricRef.current = null
      if (container.contains(canvasEl)) container.removeChild(canvasEl)
    }
  }, [onCanvasReady])

  useEffect(() => {
    setRasterIntrinsic(null)
  }, [selectedFrame?.id, setRasterIntrinsic])

  useEffect(() => {
    if (!selectedFrame || !isRasterFrame(selectedFrame) || !frameOverlayUrl) {
      return
    }
    let cancelled = false
    let settled = false
    let fallbackTimer = null
    const frameId = selectedFrame.id
    const img = new Image()
    img.decoding = 'async'

    function commitRasterIntrinsic(payload) {
      if (cancelled || settled) return
      settled = true
      if (fallbackTimer) clearTimeout(fallbackTimer)
      setRasterIntrinsic(payload)
    }

    function onLoad() {
      const detectedScreenArea = detectRasterScreenAreaFromImage(img)
      commitRasterIntrinsic({
        frameId,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        screenArea: detectedScreenArea,
      })
    }
    function onError() {
      // Asset 404 or failed — fall back to the frame's declared dimensions so
      // placement can still run using the static phoneScreenRect heuristic.
      commitRasterIntrinsic({
        frameId,
        naturalWidth: selectedFrame.canvasWidth,
        naturalHeight: selectedFrame.canvasHeight,
        screenArea: null,
      })
    }
    img.addEventListener('load', onLoad)
    img.addEventListener('error', onError)

    // Safety: if the image never fires load/error (e.g. stuck request), unblock after 4s.
    fallbackTimer = setTimeout(() => {
      commitRasterIntrinsic({
        frameId,
        naturalWidth: selectedFrame.canvasWidth,
        naturalHeight: selectedFrame.canvasHeight,
        screenArea: null,
      })
    }, 4000)
    img.src = frameOverlayUrl

    return () => {
      cancelled = true
      clearTimeout(fallbackTimer)
      img.removeEventListener('load', onLoad)
      img.removeEventListener('error', onError)
    }
  }, [selectedFrame, frameOverlayUrl, setRasterIntrinsic, selectedFrame?.canvasWidth, selectedFrame?.canvasHeight])

  useLayoutEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !selectedFrame) return

    const layout = getEffectiveFrameLayout(selectedFrame, rasterIntrinsic)
    const previous = layoutStateRef.current
    const shouldResetCanvas =
      previous.frameId !== selectedFrame.id ||
      previous.canvasWidth !== layout.canvasWidth ||
      previous.canvasHeight !== layout.canvasHeight

    layoutStateRef.current = {
      frameId: selectedFrame.id,
      canvasWidth: layout.canvasWidth,
      canvasHeight: layout.canvasHeight,
    }

    const nextBase = computePreviewScale(wrapperRef.current, layout, selectedFrame)
    setBasePreviewScale(nextBase)
    syncFabricCanvasToLayout(canvas, layout)

    // Raster measurement may arrive after an upload. Do not clear the canvas for a same-frame
    // screen-area refinement; clearing is what caused the visible blink and stale re-placement gap.
    if (shouldResetCanvas) {
      resetPreviewZoomBoost()
      canvas.clear()
      detachUserImageRefsAfterClear(canvas)
      useMockupStore.getState().bumpCanvasLayoutGeneration()
    } else if (canvas._userImage && layout.screenArea) {
      setImageDisplayMode(canvas, layout.screenArea, useMockupStore.getState().imageFitMode)
    }

    canvas.backgroundColor = 'transparent'
  }, [selectedFrame, rasterIntrinsic, resetPreviewZoomBoost])

  useLayoutEffect(() => {
    useMockupStore.getState().setPreviewFabricCssScale(scale)
  }, [scale])

  useEffect(() => {
    if (!selectedFrame) return

    let cancelled = false

    async function loadFrameOverlay() {
      try {
        setIsLoading(true)
        setError(null)
        setFrameOverlayUrl(null)

        if (isRasterFrame(selectedFrame)) {
          const assetUrl = getFrameAssetUrl(selectedFrame, frameColorVariant)
          if (!assetUrl) {
            throw new Error('Missing raster frame asset')
          }
          if (cancelled) return
          if (frameUrlRef.current) {
            URL.revokeObjectURL(frameUrlRef.current)
            frameUrlRef.current = null
          }
          setFrameOverlayUrl(assetUrl)
          setIsLoading(false)
          return
        }

        const svgMarkup = await fetchFrameSvgMarkup(selectedFrame.file, frameColorVariant)
        if (cancelled) return

        const nextUrl = createSvgObjectUrl(svgMarkup)
        if (frameUrlRef.current) {
          URL.revokeObjectURL(frameUrlRef.current)
        }

        frameUrlRef.current = nextUrl
        setFrameOverlayUrl(nextUrl)
        setIsLoading(false)
      } catch {
        if (!cancelled) {
          setFrameOverlayUrl(null)
          setError('Frame failed to load. Please refresh.')
          setIsLoading(false)
        }
      }
    }

    loadFrameOverlay()

    return () => {
      cancelled = true
    }
  }, [selectedFrame, frameColorVariant, setError, setIsLoading])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || !selectedFrame) return

    const layout = getEffectiveFrameLayout(selectedFrame, rasterIntrinsic)

    const updateScale = () => {
      setBasePreviewScale(computePreviewScale(wrapper, layout, selectedFrame))
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(wrapper)

    return () => observer.disconnect()
  }, [selectedFrame, rasterIntrinsic])

  useLayoutEffect(() => {
    const canvas = fabricRef.current
    if (!canvas || !selectedFrame) return

    const layout = getEffectiveFrameLayout(selectedFrame, rasterIntrinsic)
    const cw = layout.canvasWidth
    const ch = layout.canvasHeight

    applyFabricPreviewCssScale(canvas, scale)

    const lower = canvas.lowerCanvasEl
    if (lower) {
      applyLowerCanvasScreenClip(lower, layout.screenArea, cw, ch, scale)
    }

    ensureUpperStackRef.current = () => {
      const c = fabricRef.current
      const artboard = artboardRef.current
      const frameImg = frameImgRef.current
      const url = frameOverlayUrlRef.current
      if (!c || !artboard) return
      const upper = c.upperCanvasEl
      const wrap = c.wrapperEl
      if (!upper || !wrap) return
      if (frameImg && url) {
        if (upper.parentNode !== artboard || frameImg.nextSibling !== upper) {
          artboard.insertBefore(upper, frameImg.nextSibling)
        }
        upper.classList.add('mockup-fabric-upper')
        upper.style.zIndex = '3'
        upper.style.position = 'absolute'
        upper.style.left = '0'
        upper.style.top = '0'
        upper.style.pointerEvents = 'auto'
      } else {
        upper.classList.remove('mockup-fabric-upper')
        if (upper.parentNode !== wrap) {
          wrap.appendChild(upper)
        }
      }
    }

    ensureUpperStackRef.current()
    canvas.calcOffset()
  }, [selectedFrame, rasterIntrinsic, scale, frameOverlayUrl])

  if (!selectedFrame) return null

  const layout = getEffectiveFrameLayout(selectedFrame, rasterIntrinsic)
  const workspaceBg = getBackgroundStyle(backgroundColor, bgGradient)

  return (
    <div ref={wrapperRef} className="mockup-workspace" style={workspaceBg}>
      <div className="mockup-preview-zoom" role="group" aria-label="Preview zoom">
        <button
          type="button"
          className="mockup-preview-zoom__btn"
          onClick={() => bumpPreviewZoomBoost(-0.12)}
          aria-label="Zoom preview out"
        >
          −
        </button>
        <button
          type="button"
          className="mockup-preview-zoom__btn"
          onClick={() => bumpPreviewZoomBoost(0.12)}
          aria-label="Zoom preview in"
        >
          +
        </button>
      </div>
      <div
        className="mockup-stage-shell"
        style={{
          width: layout.canvasWidth * scale,
          height: layout.canvasHeight * scale,
        }}
      >
        <div
          ref={artboardRef}
          className="mockup-artboard"
          style={{
            width: layout.canvasWidth * scale,
            height: layout.canvasHeight * scale,
          }}
        >
          <div ref={containerRef} className="mockup-canvas-layer" />
          {frameOverlayUrl && (
            <img
              ref={frameImgRef}
              src={frameOverlayUrl}
              alt=""
              className="mockup-frame-overlay"
              draggable="false"
              style={{ filter: getFrameShadowFilter(frameShadowStrength) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
