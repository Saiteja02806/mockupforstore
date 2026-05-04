import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Download,
  Home,
  X,
  GripHorizontal,
  ImagePlus,
  Plus,
  Copy,
  Crop,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import {
  CUSTOM_FORMAT_KEY,
  DEFAULT_STORE_FORMAT_KEY,
  resolveStoreFormat,
  getStoreFormatOptgroups,
  getLayerRowLabel,
} from './storeFormats.js'
import { loadStoreEditorPrefs, saveStoreEditorPrefs } from './storeEditorStorage.js'
import { STORE_EDITOR_GOOGLE_FONTS_HREF, STORE_TEXT_FONT_OPTIONS } from './storeEditorFonts.js'
import { getMarketingHomeUrl } from '../utils/siteLinks.js'
import './storeEditorChrome.css'
import StoreCropCornerModal from './StoreCropCornerModal.jsx'
import {
  drawStoreImageLayer,
  getDefaultImageCropRect,
  getImageLayerPreviewBox,
  getLayerCroppedAspect,
} from './imageLayerGeometry.js'
import { resolveImageCropRect, normRectToSourcePixels, clampNormRect } from './storeRectCropMath.js'

/** Matches generator accent; root `.store-editor-root` also defines --accent in CSS */
const ACCENT = '#6366f1'
const EXPORT_SCALE = 2
const DEFAULT_MOCKUP_WIDTH_PCT = 72
const MOCKUP_TARGET_HEIGHT_PCT = 70
const MOCKUP_WIDTH_MIN_PCT = 10
const MOCKUP_WIDTH_MAX_PCT = 120
const MOCKUP_AUTO_MAX_WIDTH_PCT = 92
const IMAGE_WIDTH_MIN_PCT = 5
const IMAGE_WIDTH_MAX_PCT = 160
const TEXT_LINE_HEIGHT = 1.1
const TEXT_FONT_MAX_PX = 400
const MIN_VISIBLE_LAYER_PCT = 3

const CANVAS_PATTERN_CSS = {
  dots: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
  lines: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.04) 10px, rgba(255,255,255,0.04) 20px)',
  grid: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
  waves: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, rgba(255,255,255,0.04) 20px, transparent 40px)',
}

const CANVAS_PATTERN_SIZE = {
  dots: '20px 20px',
  lines: '20px 20px',
  grid: '20px 20px',
  waves: '40px 40px',
}

const imageCache = new Map()

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

/** Break a single token when it is wider than maxW (matches CSS word-break: break-word). */
function breakLongWordForCanvas(ctx, word, maxW) {
  if (!word) return ['']
  const parts = []
  let chunk = ''
  for (const ch of word) {
    const next = chunk + ch
    if (chunk && ctx.measureText(next).width > maxW) {
      parts.push(chunk)
      chunk = ch
    } else {
      chunk = next
    }
  }
  if (chunk) parts.push(chunk)
  return parts.length ? parts : ['']
}

/** Wrap one paragraph to max width (spaces + long-word breaks). */
function wrapParagraphToCanvasWidth(ctx, paragraph, maxW) {
  if (!paragraph) return ['']
  const words = paragraph.split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']
  const out = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width <= maxW) {
      line = test
    } else {
      if (line) {
        out.push(line)
        line = ''
      }
      if (ctx.measureText(w).width <= maxW) {
        line = w
      } else {
        const chunks = breakLongWordForCanvas(ctx, w, maxW)
        for (let i = 0; i < chunks.length - 1; i++) out.push(chunks[i])
        line = chunks[chunks.length - 1] || ''
      }
    }
  }
  if (line) out.push(line)
  return out.length ? out : ['']
}

/** Match preview: explicit newlines + soft wrap within canvas width (pre-wrap / break-word). */
function expandTextLinesForExport(ctx, raw, maxWrapW) {
  const parts = String(raw ?? '').replace(/\r\n/g, '\n').split('\n')
  const lines = []
  for (const p of parts) {
    lines.push(...wrapParagraphToCanvasWidth(ctx, p, maxWrapW))
  }
  return lines.length ? lines : ['']
}

function loadImage(src) {
  if (!src) return Promise.reject(new Error('no src'))
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src))
  return new Promise((resolve, reject) => {
    const im = new Image()
    im.onload = () => {
      imageCache.set(src, im)
      resolve(im)
    }
    im.onerror = () => reject(new Error('image load failed'))
    im.src = src
  })
}

function drawPatternOverlay(ctx, w, h, key) {
  if (!key || key === 'none') return
  const tile = document.createElement('canvas')
  const tw = 40
  const th = 40
  tile.width = tw
  tile.height = th
  const t = tile.getContext('2d')
  if (!t) return

  if (key === 'dots') {
    t.fillStyle = 'rgba(255,255,255,0.1)'
    for (let x = 0; x < tw; x += 10) {
      for (let y = 0; y < th; y += 10) {
        t.beginPath()
        t.arc(x + 1, y + 1, 1, 0, Math.PI * 2)
        t.fill()
      }
    }
  } else if (key === 'lines') {
    t.strokeStyle = 'rgba(255,255,255,0.05)'
    t.lineWidth = 1
    for (let i = -tw; i < tw * 2; i += 14) {
      t.beginPath()
      t.moveTo(i, 0)
      t.lineTo(i + th, th)
      t.stroke()
    }
  } else if (key === 'grid') {
    t.strokeStyle = 'rgba(255,255,255,0.05)'
    t.lineWidth = 1
    for (let x = 0; x <= tw; x += 10) {
      t.beginPath()
      t.moveTo(x, 0)
      t.lineTo(x, th)
      t.stroke()
    }
    for (let y = 0; y <= th; y += 10) {
      t.beginPath()
      t.moveTo(0, y)
      t.lineTo(tw, y)
      t.stroke()
    }
  } else if (key === 'waves') {
    t.strokeStyle = 'rgba(255,255,255,0.06)'
    t.lineWidth = 1
    t.beginPath()
    t.arc(tw / 2, th / 2, 8, 0, Math.PI * 2)
    t.stroke()
    t.beginPath()
    t.arc(tw / 2, th / 2, 18, 0, Math.PI * 2)
    t.stroke()
  }

  const pat = ctx.createPattern(tile, 'repeat')
  if (!pat) return
  ctx.save()
  ctx.globalAlpha = 0.75
  ctx.fillStyle = pat
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function paintBackground(ctx, w, h, bgMode, bgColor, gradStart, gradEnd, gradAngle) {
  if (bgMode === 'none') return
  if (bgMode === 'gradient') {
    const rad = (gradAngle * Math.PI) / 180
    const x2 = w * 0.5 + Math.cos(rad) * w
    const y2 = h * 0.5 + Math.sin(rad) * h
    const g = ctx.createLinearGradient(0, 0, x2, y2)
    g.addColorStop(0, gradStart)
    g.addColorStop(1, gradEnd)
    ctx.fillStyle = g
  } else {
    ctx.fillStyle = bgColor
  }
  ctx.fillRect(0, 0, w, h)
}

/** Cover-style background image; panY 0–100 (50 = centered vertically when overflow). */
function drawCoverImage(ctx, w, h, img, scaleMul, panY) {
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  if (!iw || !ih) return
  const base = Math.max(w / iw, h / ih)
  const s = base * clamp(scaleMul, 0.25, 4)
  const dw = iw * s
  const dh = ih * s
  const x = (w - dw) / 2
  const py = clamp(panY, 0, 100) / 100
  const y = (h - dh) * py
  ctx.drawImage(img, x, y, dw, dh)
}

function getTextMaxWidthPx(layer, totalWidth) {
  const pct = layer?.maxWidthPct
  if (typeof pct !== 'number' || !Number.isFinite(pct) || pct <= 0) return Number.POSITIVE_INFINITY
  return totalWidth * (clamp(pct, 20, 98) / 100)
}

function hasExplicitTextWidth(layer) {
  return typeof layer?.maxWidthPct === 'number' && Number.isFinite(layer.maxWidthPct) && layer.maxWidthPct > 0
}

function createLayerGradient(ctx, centerX, centerY, width, height, angleDeg, startColor, endColor) {
  const spanX = Math.max(width, 1) / 2
  const spanY = Math.max(height, 1) / 2
  const rad = ((Number(angleDeg) || 0) * Math.PI) / 180
  const dx = Math.cos(rad) * spanX
  const dy = Math.sin(rad) * spanY
  const gradient = ctx.createLinearGradient(centerX - dx, centerY - dy, centerX + dx, centerY + dy)
  gradient.addColorStop(0, startColor || '#f8fafc')
  gradient.addColorStop(1, endColor || startColor || '#f8fafc')
  return gradient
}

function getTextCanvasFill(ctx, layer, centerX, centerY, blockWidth, blockHeight) {
  if (layer.fillMode === 'gradient') {
    return createLayerGradient(
      ctx,
      centerX,
      centerY,
      blockWidth,
      blockHeight,
      layer.gradientAngle ?? 90,
      layer.gradientStart || layer.color || '#f8fafc',
      layer.gradientEnd || layer.color || '#cbd5e1',
    )
  }
  return layer.color || '#fff'
}

async function ensureTextFontsReady(layers) {
  if (typeof document === 'undefined' || !document.fonts?.load) return
  const specs = [...new Set(
    layers
      .filter((layer) => layer.type === 'text' && String(layer.text || '').trim())
      .map((layer) => `${layer.fontWeight || 600} 64px "${(layer.fontFamily || 'Inter').replace(/"/g, '')}"`),
  )]
  if (!specs.length) return
  await Promise.allSettled(specs.map((spec) => document.fonts.load(spec)))
  if (document.fonts?.ready) {
    await document.fonts.ready
  }
}

function newId() {
  return `ly_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function isLayerVisible(layer) {
  return layer.visible !== false
}

function getMockupBitmap(layer, mockImgs) {
  if (!mockImgs?.with || !mockImgs?.device) return null
  return layer.useSceneBg ? mockImgs.with : mockImgs.device
}

function getAutoMockupWidthPct(img, canvasWidth, canvasHeight) {
  if (!img?.naturalWidth || !img?.naturalHeight || !canvasWidth || !canvasHeight) {
    return DEFAULT_MOCKUP_WIDTH_PCT
  }
  const imageAR = img.naturalHeight / img.naturalWidth
  const canvasAR = canvasWidth / canvasHeight
  const widthForTargetHeight = MOCKUP_TARGET_HEIGHT_PCT / (canvasAR * imageAR)
  return clamp(Math.round(widthForTargetHeight), MOCKUP_WIDTH_MIN_PCT, MOCKUP_AUTO_MAX_WIDTH_PCT)
}

function getLayerPositionBounds(layer, mockImgs, canvasAspect) {
  if (layer?.type === 'mockup') {
    const img = getMockupBitmap(layer, mockImgs)
    const wPct = clamp(layer.wPct ?? DEFAULT_MOCKUP_WIDTH_PCT, MOCKUP_WIDTH_MIN_PCT, MOCKUP_WIDTH_MAX_PCT)
    let ar = 1.85
    if (img?.naturalWidth && img?.naturalHeight) {
      const { sw, sh } = normRectToSourcePixels(
        img.naturalWidth,
        img.naturalHeight,
        resolveImageCropRect(layer, img.naturalWidth, img.naturalHeight),
      )
      ar = sh / Math.max(sw, 1)
    }
    const hPct = wPct * ar * canvasAspect
    return {
      xMin: Math.min(0, -wPct / 2 + MIN_VISIBLE_LAYER_PCT),
      xMax: Math.max(100, 100 + wPct / 2 - MIN_VISIBLE_LAYER_PCT),
      yMin: Math.min(0, -hPct / 2 + MIN_VISIBLE_LAYER_PCT),
      yMax: Math.max(100, 100 + hPct / 2 - MIN_VISIBLE_LAYER_PCT),
    }
  }
  if (layer?.type === 'image') {
    // Full freedom: image can be positioned anywhere, including completely off-canvas,
    // so the user can push/slide it into position under device frames.
    return { xMin: -100, xMax: 200, yMin: -100, yMax: 200 }
  }
  return { xMin: 0.5, xMax: 99.5, yMin: 0.5, yMax: 99.5 }
}

function getLayerDropShadowFilter(layer) {
  if (!layer?.shadowOn) return undefined
  const opacity = clamp(Number(layer.shadowOpacity ?? 0.35), 0, 1)
  if (opacity <= 0) return undefined
  const blur = Math.max(0, Number(layer.shadowBlur ?? 24) || 0)
  const offsetX = Number(layer.shadowOffsetX ?? 0) || 0
  const offsetY = Number(layer.shadowOffsetY ?? 12) || 0
  return `drop-shadow(${offsetX}px ${offsetY}px ${blur}px rgba(0,0,0,${opacity}))`
}

/** stack[0] drawn first (back); stack[length-1] drawn last (front) */
function moveStackUp(stack, id) {
  const i = stack.findIndex((l) => l.id === id)
  if (i < 0 || i >= stack.length - 1) return stack
  const a = [...stack]
  ;[a[i], a[i + 1]] = [a[i + 1], a[i]]
  return a
}

function moveStackDown(stack, id) {
  const i = stack.findIndex((l) => l.id === id)
  if (i <= 0) return stack
  const a = [...stack]
  ;[a[i], a[i - 1]] = [a[i - 1], a[i]]
  return a
}

export default function StoreScreenshotEditor({
  initialMockupWithSceneUrl,
  initialMockupDeviceOnlyUrl,
  mockupCapturesIdentical = false,
  suggestedBaseName = 'mockup',
  onRequestClose,
}) {
  const sameCapture =
    mockupCapturesIdentical ||
    Boolean(
      initialMockupWithSceneUrl &&
        initialMockupDeviceOnlyUrl &&
        initialMockupWithSceneUrl === initialMockupDeviceOnlyUrl,
    )
  const prefs = loadStoreEditorPrefs()

  const [formatKey, setFormatKey] = useState(DEFAULT_STORE_FORMAT_KEY)
  const [customW, setCustomW] = useState(typeof prefs?.customW === 'number' ? prefs.customW : 1080)
  const [customH, setCustomH] = useState(typeof prefs?.customH === 'number' ? prefs.customH : 1920)

  const [bgMode, setBgMode] = useState(sameCapture ? 'none' : prefs?.bgMode || 'solid')
  const [bgColor, setBgColor] = useState(prefs?.bgColor || '#ffffff')
  const [gradStart, setGradStart] = useState(prefs?.gradStart || '#f8fafc')
  const [gradEnd, setGradEnd] = useState(prefs?.gradEnd || '#e2e8f0')
  const [gradAngle, setGradAngle] = useState(typeof prefs?.gradAngle === 'number' ? prefs.gradAngle : 160)
  const [bgPattern, setBgPattern] = useState(sameCapture ? '' : prefs?.bgPattern || '')
  const [bgImageUrl, setBgImageUrl] = useState(sameCapture ? '' : prefs?.bgImageUrl || '')
  const [bgImageScale, setBgImageScale] = useState(typeof prefs?.bgImageScale === 'number' ? prefs.bgImageScale : 1)
  const [bgImagePanY, setBgImagePanY] = useState(typeof prefs?.bgImagePanY === 'number' ? prefs.bgImagePanY : 50)
  const [bgImageOpacity, setBgImageOpacity] = useState(typeof prefs?.bgImageOpacity === 'number' ? prefs.bgImageOpacity : 1)

  const [stack, setStack] = useState(() => {
    /** Default off when opening from Mockup Studio; only on if user previously enabled (saved). */
    const useSceneBg = sameCapture ? false : prefs?.mockUseSceneBg === true
    return [
      {
        id: 'mockup',
        type: 'mockup',
        x: 50,
        y: 50,
        wPct: DEFAULT_MOCKUP_WIDTH_PCT,
        useSceneBg,
        visible: true,
        rotation: typeof prefs?.mockRotation === 'number' ? prefs.mockRotation : 0,
        shadowOn: prefs?.mockShadowOn === true,
        shadowBlur: typeof prefs?.mockShadowBlur === 'number' ? prefs.mockShadowBlur : 24,
        shadowOffsetX: typeof prefs?.mockShadowOffsetX === 'number' ? prefs.mockShadowOffsetX : 0,
        shadowOffsetY: typeof prefs?.mockShadowOffsetY === 'number' ? prefs.mockShadowOffsetY : 12,
        shadowOpacity: typeof prefs?.mockShadowOpacity === 'number' ? prefs.mockShadowOpacity : 0.35,
        ...(prefs?.mockImageCropRect && typeof prefs.mockImageCropRect === 'object'
          ? { imageCropRect: clampNormRect(prefs.mockImageCropRect) }
          : {}),
        ...(prefs?.mockImageCrop &&
        typeof prefs.mockImageCrop === 'object' &&
        !(prefs?.mockImageCropRect && typeof prefs.mockImageCropRect === 'object')
          ? {
              imageCrop: prefs.mockImageCrop,
              imageCropRefW: prefs.mockImageCropRefW,
              imageCropRefH: prefs.mockImageCropRefH,
            }
          : {}),
        ...(typeof prefs?.mockImageCornerRadiusRatio === 'number'
          ? { imageCornerRadiusRatio: clamp(prefs.mockImageCornerRadiusRatio, 0, 1) }
          : {}),
      },
    ]
  })

  const [selectedId, setSelectedId] = useState('__bg__')
  const [mockImgs, setMockImgs] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [dropHint, setDropHint] = useState('')
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [imgNaturalById, setImgNaturalById] = useState({})
  const addImageFileRef = useRef(null)
  const replaceImageFileRef = useRef(null)

  const stageRef = useRef(null)
  const previewRef = useRef(null)
  const dragRef = useRef(null)
  /** Outer wrapper per text layer — used for pointer hit-testing (matches padded bounds). */
  const textLayerRootRef = useRef({})
  const bgFileRef = useRef(null)
  const restoredTextRef = useRef(false)

  useEffect(() => {
    const id = 'store-editor-google-fonts'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = STORE_EDITOR_GOOGLE_FONTS_HREF
    document.head.appendChild(link)
  }, [])

  const fmt = resolveStoreFormat(formatKey, customW, customH)
  const aspect = fmt.width / fmt.height

  const [stageBox, setStageBox] = useState({ w: 900, h: 700 })
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (cr) setStageBox({ w: cr.width, h: cr.height })
    })
    ro.observe(el)
    setStageBox({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  let previewW = Math.min(stageBox.w - 32, (stageBox.h - 32) * aspect)
  let previewH = previewW / aspect
  if (previewH > stageBox.h - 32) {
    previewH = stageBox.h - 32
    previewW = previewH * aspect
  }

  useEffect(() => {
    if (sameCapture) {
      setStack((prev) =>
        prev.map((l) => (l.type === 'mockup' ? { ...l, useSceneBg: false } : l)),
      )
    }
  }, [sameCapture])

  useEffect(() => {
    if (!initialMockupWithSceneUrl || !initialMockupDeviceOnlyUrl) {
      setLoadError('Missing mockup capture.')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [withI, devI] = await Promise.all([
          loadImage(initialMockupWithSceneUrl),
          loadImage(initialMockupDeviceOnlyUrl),
        ])
        if (!cancelled) {
          setMockImgs({ with: withI, device: devI })
          setLoadError('')
        }
      } catch {
        if (!cancelled) setLoadError('Failed to load mockup images.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initialMockupWithSceneUrl, initialMockupDeviceOnlyUrl])

  /**
   * Auto-size the device whenever images change so every device frame
   * fills a consistent ~70 % of canvas height, regardless of which
   * frame was used in the Mockup Studio.
   *
   * Formula:  wPct = 70 / (canvasW/canvasH × deviceNH/deviceNW)
   * Derivation: deviceHeightFraction = wPct/100 × deviceAR / (canvasH/canvasW)
   *             => solve for wPct when deviceHeightFraction = 0.70
   */
  useLayoutEffect(() => {
    if (!mockImgs) return
    const img = mockImgs.device || mockImgs.with
    const safeWPct = getAutoMockupWidthPct(img, fmt.width, fmt.height)
    setStack((prev) =>
      prev.map((l) => (l.type === 'mockup' && l.wPct !== safeWPct ? { ...l, wPct: safeWPct } : l)),
    )
  }, [mockImgs, fmt.width, fmt.height])

  const getSavePayload = useCallback(() => {
    const mock = stack.find((l) => l.type === 'mockup')
    return {
      formatKey,
      customW,
      customH,
      bgMode,
      bgColor,
      gradStart,
      gradEnd,
      gradAngle,
      bgPattern,
      bgImageUrl: bgImageUrl.length < 200000 ? bgImageUrl : '',
      bgImageScale,
      bgImagePanY,
      bgImageOpacity,
      mockCx: mock?.x ?? 50,
      mockCy: mock?.y ?? 50,
      mockWPct: mock?.wPct ?? DEFAULT_MOCKUP_WIDTH_PCT,
      mockUseSceneBg: mock?.useSceneBg === true,
      mockRotation: mock?.rotation ?? 0,
      mockShadowOn: Boolean(mock?.shadowOn),
      mockShadowBlur: mock?.shadowBlur ?? 24,
      mockShadowOffsetX: mock?.shadowOffsetX ?? 0,
      mockShadowOffsetY: mock?.shadowOffsetY ?? 12,
      mockShadowOpacity: mock?.shadowOpacity ?? 0.35,
      mockImageCropRect: mock?.imageCropRect,
      mockImageCornerRadiusRatio: mock?.imageCornerRadiusRatio,
      textLayers: stack
        .filter((l) => l.type === 'text')
        .map((l) => ({
          id: l.id,
          text: l.text,
          x: l.x,
          y: l.y,
          fontSizePct: l.fontSizePct,
          color: l.color,
          fontWeight: l.fontWeight,
          fontFamily: l.fontFamily || 'Inter',
          align: l.align,
          opacity: l.opacity ?? 1,
          maxWidthPct: l.maxWidthPct ?? null,
          fillMode: l.fillMode || 'solid',
          gradientStart: l.gradientStart || l.color || '#f8fafc',
          gradientEnd: l.gradientEnd || l.color || '#cbd5e1',
          gradientAngle: typeof l.gradientAngle === 'number' ? l.gradientAngle : 90,
          visible: l.visible !== false,
        })),
    }
  }, [
    formatKey,
    customW,
    customH,
    bgMode,
    bgColor,
    gradStart,
    gradEnd,
    gradAngle,
    bgPattern,
    bgImageUrl,
    bgImageScale,
    bgImagePanY,
    bgImageOpacity,
    stack,
  ])

  useEffect(() => {
    const t = setTimeout(() => {
      saveStoreEditorPrefs(getSavePayload())
    }, 450)
    return () => clearTimeout(t)
  }, [getSavePayload])

  useEffect(() => {
    stack.forEach((l) => {
      if (l.type === 'image' && l.src) loadImage(l.src).catch(() => {})
    })
  }, [stack])

  useEffect(() => {
    if (restoredTextRef.current) return
    const p = loadStoreEditorPrefs()
    const texts = p?.textLayers
    if (!Array.isArray(texts) || texts.length === 0) return
    restoredTextRef.current = true
    setStack((prev) => {
      const has = prev.some((l) => l.type === 'text')
      if (has) return prev
      const extra = texts.map((t) => ({
        id: t.id || newId(),
        type: 'text',
        text: t.text || 'Text',
        x: t.x ?? 50,
        y: t.y ?? 12,
        fontSizePct: t.fontSizePct ?? 3.5,
        color: t.color || '#f8fafc',
        fontWeight: t.fontWeight ?? 600,
        fontFamily: t.fontFamily || 'Inter',
        align: t.align || 'center',
        opacity: typeof t.opacity === 'number' ? t.opacity : 1,
        maxWidthPct: typeof t.maxWidthPct === 'number' ? clamp(t.maxWidthPct, 20, 98) : null,
        fillMode: t.fillMode === 'gradient' ? 'gradient' : 'solid',
        gradientStart: t.gradientStart || t.color || '#f8fafc',
        gradientEnd: t.gradientEnd || t.color || '#cbd5e1',
        gradientAngle: typeof t.gradientAngle === 'number' ? t.gradientAngle : 90,
        visible: t.visible !== false,
      }))
      return [...prev, ...extra]
    })
  }, [])

  const mockLayer = stack.find((l) => l.type === 'mockup')
  const selected = stack.find((l) => l.id === selectedId)

  const updateLayer = useCallback((id, patch) => {
    setStack((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  /* ── Undo history ── */
  const historyRef = useRef([])
  const historyIdxRef = useRef(-1)

  const pushHistory = useCallback((newStack) => {
    const idx = historyIdxRef.current
    historyRef.current = historyRef.current.slice(0, idx + 1)
    historyRef.current.push(newStack.map((l) => ({ ...l })))
    if (historyRef.current.length > 60) historyRef.current.shift()
    historyIdxRef.current = historyRef.current.length - 1
  }, [])

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current -= 1
    setStack(historyRef.current[historyIdxRef.current].map((l) => ({ ...l })))
  }, [])

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current += 1
    setStack(historyRef.current[historyIdxRef.current].map((l) => ({ ...l })))
  }, [])

  /* Wrap setStack to also push to history */
  const setStackWithHistory = useCallback((updater) => {
    setStack((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      pushHistory(next)
      return next
    })
  }, [pushHistory])

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function onKeyDown(e) {
      const tag = document.activeElement?.tagName
      const editing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      /* Undo / Redo */
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo(); return
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo(); return
      }

      if (editing) return

      /* Delete selected layer */
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && selectedId !== '__bg__') {
        const layer = stack.find((l) => l.id === selectedId)
        if (!layer) return
        if (layer.type === 'mockup' && stack.filter((l) => l.type === 'mockup').length <= 1) return
        e.preventDefault()
        setStackWithHistory((prev) => prev.filter((l) => l.id !== selectedId))
        setSelectedId(null)
        return
      }

      /* Duplicate selected layer: Ctrl+D */
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedId && selectedId !== '__bg__') {
        e.preventDefault()
        const layer = stack.find((l) => l.id === selectedId)
        if (!layer) return
        const clone = { ...layer, id: newId(), x: layer.x + 3, y: layer.y + 3 }
        setStackWithHistory((prev) => {
          const idx = prev.findIndex((l) => l.id === selectedId)
          const a = [...prev]
          a.splice(idx + 1, 0, clone)
          return a
        })
        setSelectedId(clone.id)
        return
      }

      /* Arrow nudge selected layer */
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key) && selectedId && selectedId !== '__bg__') {
        e.preventDefault()
        const step = e.shiftKey ? 2 : 0.5
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp'   ? -step : e.key === 'ArrowDown'  ? step : 0
        setStackWithHistory((prev) =>
          prev.map((l) => {
            if (l.id !== selectedId) return l
            const bounds = getLayerPositionBounds(l, mockImgs, aspect)
            return {
              ...l,
              x: clamp(l.x + dx, bounds.xMin, bounds.xMax),
              y: clamp(l.y + dy, bounds.yMin, bounds.yMax),
            }
          })
        )
        return
      }

      /* Escape: deselect */
      if (e.key === 'Escape') { setSelectedId(null); return }

      /* Move layer up/down in Z: Ctrl+] / Ctrl+[ */
      if ((e.ctrlKey || e.metaKey) && e.key === ']' && selectedId) {
        e.preventDefault()
        setStackWithHistory((prev) => moveStackUp(prev, selectedId))
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '[' && selectedId) {
        e.preventDefault()
        setStackWithHistory((prev) => moveStackDown(prev, selectedId))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [aspect, mockImgs, selectedId, stack, undo, redo, setStackWithHistory])


  const addTextLayer = useCallback(() => {
    const id = newId()
    setStack((prev) => [
      ...prev,
      {
        id,
        type: 'text',
        text: 'New headline',
        x: 50,
        y: 14,
        fontSizePct: 4,
        color: '#f8fafc',
        fontWeight: 700,
        fontFamily: 'Inter',
        align: 'center',
        opacity: 1,
        maxWidthPct: null,
        fillMode: 'solid',
        gradientStart: '#f8fafc',
        gradientEnd: '#cbd5e1',
        gradientAngle: 90,
        visible: true,
      },
    ])
    setSelectedId(id)
  }, [])

  const addImageFromDataUrl = useCallback((dataUrl, opts = {}) => {
    const id = newId()
    setStack((prev) => [
      ...prev,
      {
        id,
        type: 'image',
        src: dataUrl,
        x: 50,
        y: 50,
        wPct: 22,
        rotation: 0,
        opacity: 1,
        visible: true,
        imageCropRect: opts.imageCropRect || getDefaultImageCropRect(),
        imageCornerRadiusRatio: clamp(Number(opts.imageCornerRadiusRatio) || 0, 0, 1),
        shadowOn: false,
        shadowBlur: 24,
        shadowOffsetX: 0,
        shadowOffsetY: 12,
        shadowOpacity: 0.35,
      },
    ])
    setSelectedId(id)
  }, [])

  const deleteLayer = useCallback((id) => {
    setStack((prev) => {
      const layer = prev.find((l) => l.id === id)
      if (layer?.type === 'mockup' && prev.filter((l) => l.type === 'mockup').length <= 1) {
        return prev
      }
      const next = prev.filter((l) => l.id !== id)
      setSelectedId((sel) => {
        if (sel !== id) return sel
        const m = next.find((l) => l.type === 'mockup')
        return m?.id ?? '__bg__'
      })
      return next
    })
  }, [])

  const duplicateLayer = useCallback((id) => {
    setStack((prev) => {
      const idx = prev.findIndex((l) => l.id === id)
      if (idx < 0) return prev
      const l = prev[idx]
      const nid = newId()

      if (l.type === 'mockup') {
        const ox = clamp((l.x ?? 50) - 5, 4, 96)
        const oy = clamp((l.y ?? 50) + 4, 4, 96)
        const copy = {
          ...l,
          id: nid,
          x: ox,
          y: oy,
          visible: true,
        }
        const a = [...prev]
        a.splice(idx, 0, copy)
        setSelectedId(nid)
        return a
      }

      if (l.type !== 'text' && l.type !== 'image') return prev

      const ox = clamp((l.x ?? 50) + 3, 4, 96)
      const oy = clamp((l.y ?? 50) + 3, 4, 96)
      const copy =
        l.type === 'text'
          ? {
              ...l,
              id: nid,
              x: ox,
              y: oy,
              visible: true,
              opacity: l.opacity ?? 1,
            }
          : { ...l, id: nid, x: ox, y: oy, visible: true }
      const a = [...prev]
      a.splice(idx + 1, 0, copy)
      setSelectedId(nid)
      return a
    })
  }, [])

  /**
   * Returns true if the mouse event lands inside `layer`'s hit area.
   * Extracted so we can reuse it for both sticky-selection and normal iteration.
   */
  const isHitOnLayer = useCallback(
    (layer, e, rect) => {
      if (!isLayerVisible(layer)) return false
      if (layer.type === 'mockup') {
        const img = getMockupBitmap(layer, mockImgs)
        if (!img) return false
        const mw = (layer.wPct / 100) * rect.width
        const nw = img.naturalWidth || img.width
        const nh = img.naturalHeight || img.height
        const car = nw && nh ? getLayerCroppedAspect(layer, nw, nh) : nh / Math.max(nw, 1)
        const mh = mw * car
        const lx = (layer.x / 100) * rect.width
        const ly = (layer.y / 100) * rect.height
        const dx = (e.clientX - rect.left - lx) / rect.width * 100
        const dy = (e.clientY - rect.top - ly) / rect.height * 100
        return Math.abs(dx) < (layer.wPct / 2) * 1.15 && Math.abs(dy) < ((mh / rect.height) * 100) / 2 + 6
      }
      if (layer.type === 'image') {
        const iw = (layer.wPct / 100) * rect.width
        const imgEl = imageCache.get(layer.src)
        const nat = imgNaturalById[layer.id]
        const nw = nat?.w || imgEl?.naturalWidth || 0
        const nh = nat?.h || imgEl?.naturalHeight || 0
        const car = nw && nh ? getLayerCroppedAspect(layer, nw, nh) : nh / Math.max(nw, 1) || 1
        const ih = iw * car
        const lx = (layer.x / 100) * rect.width
        const ly = (layer.y / 100) * rect.height
        const dx = e.clientX - rect.left - lx
        const dy = e.clientY - rect.top - ly
        return Math.abs(dx) < iw / 2 + 4 && Math.abs(dy) < ih / 2 + 4
      }
      if (layer.type === 'text') {
        const root = textLayerRootRef.current[layer.id]
        if (root) {
          const br = root.getBoundingClientRect()
          return e.clientX >= br.left && e.clientX <= br.right && e.clientY >= br.top && e.clientY <= br.bottom
        }
        const fs = Math.max(10, (rect.height * (layer.fontSizePct ?? 3.5)) / 100)
        const lines = String(layer.text || '').split('\n').length || 1
        const approxH = Math.max(fs * 1.45 * lines, 40) + 28
        const limitedW = hasExplicitTextWidth(layer)
          ? rect.width * (clamp(layer.maxWidthPct, 20, 98) / 100)
          : Math.min(rect.width * 0.92, 320)
        const lx = (layer.x / 100) * rect.width
        const ly = (layer.y / 100) * rect.height
        const dx = e.clientX - rect.left - lx
        const dy = e.clientY - rect.top - ly
        return Math.abs(dx) < Math.max(limitedW, 80) / 2 && Math.abs(dy) < approxH / 2
      }
      return false
    },
    [mockImgs, imgNaturalById],
  )

  const onStageMouseDown = useCallback(
    (e) => {
      if (!previewRef.current || !mockImgs) return
      const rect = previewRef.current.getBoundingClientRect()
      const px = ((e.clientX - rect.left) / rect.width) * 100
      const py = ((e.clientY - rect.top) / rect.height) * 100

      /**
       * STICKY SELECTION — Figma-style:
       * If the currently selected layer contains the click point, drag it
       * immediately without checking whether a higher-z layer also overlaps.
       * This prevents an image layer on top from "stealing" clicks intended
       * for a text layer the user already has selected.
       */
      if (selectedId && selectedId !== '__bg__') {
        const selLayer = stack.find((l) => l.id === selectedId)
        if (selLayer && isHitOnLayer(selLayer, e, rect)) {
          dragRef.current = { id: selLayer.id, ox: px - selLayer.x, oy: py - selLayer.y, kind: selLayer.type }
          e.preventDefault()
          return
        }
      }

      /* Normal front-to-back (top-z to bottom-z) iteration for new selection */
      for (let i = stack.length - 1; i >= 0; i--) {
        const layer = stack[i]
        if (!isHitOnLayer(layer, e, rect)) continue
        setSelectedId(layer.id)
        dragRef.current = { id: layer.id, ox: px - layer.x, oy: py - layer.y, kind: layer.type }
        e.preventDefault()
        return
      }
      setSelectedId('__bg__')
    },
    [stack, mockImgs, selectedId, isHitOnLayer],
  )

  const moveDraggedLayer = useCallback(
    (e) => {
      if (!dragRef.current || !previewRef.current) return
      const rect = previewRef.current.getBoundingClientRect()
      const px = ((e.clientX - rect.left) / rect.width) * 100
      const py = ((e.clientY - rect.top) / rect.height) * 100
      const layer = stack.find((l) => l.id === dragRef.current.id)
      const bounds = getLayerPositionBounds(layer, mockImgs, aspect)
      const nx = clamp(px - dragRef.current.ox, bounds.xMin, bounds.xMax)
      const ny = clamp(py - dragRef.current.oy, bounds.yMin, bounds.yMax)
      updateLayer(dragRef.current.id, { x: nx, y: ny })
    },
    [aspect, mockImgs, stack, updateLayer],
  )

  const onStageMouseMove = useCallback(
    (e) => {
      moveDraggedLayer(e)
    },
    [moveDraggedLayer],
  )

  const onStageMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  useEffect(() => {
    function onWindowMouseMove(e) {
      if (!dragRef.current) return
      moveDraggedLayer(e)
    }
    function onWindowMouseUp() {
      dragRef.current = null
    }
    window.addEventListener('mousemove', onWindowMouseMove)
    window.addEventListener('mouseup', onWindowMouseUp)
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove)
      window.removeEventListener('mouseup', onWindowMouseUp)
    }
  }, [moveDraggedLayer])

  const onDropFiles = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDropHint('')
      const f = e.dataTransfer?.files?.[0]
      if (!f || !f.type.startsWith('image/')) {
        setDropHint('Drop an image file')
        setTimeout(() => setDropHint(''), 2500)
        return
      }
      const r = new FileReader()
      r.onload = () => {
        if (typeof r.result === 'string') {
          addImageFromDataUrl(r.result)
        }
      }
      r.readAsDataURL(f)
    },
    [addImageFromDataUrl],
  )

  const noBg = bgMode === 'none'
  const previewBackground = noBg
    ? 'transparent'
    : bgMode === 'gradient'
      ? `linear-gradient(${gradAngle}deg, ${gradStart} 0%, ${gradEnd} 100%)`
      : bgColor
  const patternCss = !noBg && bgPattern && bgPattern !== 'none' ? CANVAS_PATTERN_CSS[bgPattern] : ''
  const patternSize = !noBg && bgPattern && bgPattern !== 'none' ? CANVAS_PATTERN_SIZE[bgPattern] : ''

  const runExport = useCallback(async () => {
    if (!mockImgs?.with) return
    setExporting(true)
    try {
      await ensureTextFontsReady(stack)

      const W = Math.round(fmt.width * EXPORT_SCALE)
      const H = Math.round(fmt.height * EXPORT_SCALE)
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d', { alpha: true })
      if (!ctx) throw new Error('No 2d context')
      paintBackground(ctx, W, H, bgMode, bgColor, gradStart, gradEnd, gradAngle)

      if (bgImageUrl) {
        try {
          const bgi = await loadImage(bgImageUrl)
          ctx.save()
          ctx.globalAlpha = clamp(bgImageOpacity, 0, 1)
          drawCoverImage(ctx, W, H, bgi, bgImageScale, bgImagePanY)
          ctx.restore()
        } catch {
          /* skip broken bg image */
        }
      }

      drawPatternOverlay(ctx, W, H, bgPattern)

      for (const layer of stack) {
        if (!isLayerVisible(layer)) continue
        if (layer.type === 'mockup') {
          const img = getMockupBitmap(layer, mockImgs)
          if (!img) continue
          drawStoreImageLayer(ctx, img, layer, W, H, EXPORT_SCALE)
        } else if (layer.type === 'image') {
          try {
            const im = await loadImage(layer.src)
            drawStoreImageLayer(ctx, im, layer, W, H, EXPORT_SCALE)
          } catch {
            /* skip */
          }
        } else if (layer.type === 'text' && String(layer.text || '').trim()) {
          const fontPx = Math.max(12, (H * (layer.fontSizePct ?? 3.5)) / 100)
          const fam = (layer.fontFamily || 'Inter').replace(/"/g, '\\"')
          ctx.save()
          ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1)
          ctx.font = `${layer.fontWeight || 600} ${fontPx}px "${fam}", ui-sans-serif, system-ui, sans-serif`
          const align = layer.align || 'center'
          ctx.textBaseline = 'top'
          const tx = (W * layer.x) / 100
          const ty = (H * layer.y) / 100
          const lineH = fontPx * TEXT_LINE_HEIGHT
          const maxWrapW = getTextMaxWidthPx(layer, W)
          const lines = expandTextLinesForExport(ctx, String(layer.text), maxWrapW)
          const widths = lines.map((ln) => ctx.measureText(ln || ' ').width)
          const blockW = Math.max(...widths, 1)
          const totalH = lines.length * lineH
          ctx.fillStyle = getTextCanvasFill(ctx, layer, tx, ty, blockW, totalH)
          let y = ty - totalH / 2
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i] || ' '
            let x = tx
            if (align === 'center') {
              ctx.textAlign = 'center'
              x = tx
            } else if (align === 'left') {
              ctx.textAlign = 'left'
              x = tx - blockW / 2
            } else {
              ctx.textAlign = 'right'
              x = tx + blockW / 2
            }
            ctx.fillText(line, x, y)
            y += lineH
          }
          ctx.restore()
        }
      }

      const doc = {
        format: fmt,
        storeBg: { bgMode, bgColor, gradStart, gradEnd, gradAngle, bgPattern, bgImageScale, bgImagePanY },
        stack: stack.map((l) => (l.type === 'image' ? { ...l, src: '[data]' } : l)),
      }
      console.info('[store-editor] canvas_doc', doc)

      const a = document.createElement('a')
      a.download = `${suggestedBaseName}_store_${fmt.width}x${fmt.height}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    } catch (err) {
      console.error(err)
      alert(err?.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }, [
    mockImgs,
    fmt,
    bgMode,
    bgColor,
    gradStart,
    gradEnd,
    gradAngle,
    bgPattern,
    bgImageUrl,
    bgImageScale,
    bgImagePanY,
    bgImageOpacity,
    stack,
    suggestedBaseName,
  ])

  const listFromTop = [...stack].reverse()
  const formatOptgroups = getStoreFormatOptgroups()

  const rightRailTitle =
    selectedId === '__bg__'
      ? 'ARTBOARD'
      : selected?.type === 'text'
        ? 'TYPOGRAPHY'
        : selected?.type === 'mockup'
          ? 'DEVICE'
          : selected?.type === 'image'
            ? 'IMAGE'
            : 'PROPERTIES'

  return (
    <div
      className="store-editor-root"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <header className="se-header">
        <div className="se-header-left">
          <div className="se-logo-mark" aria-hidden>
            M
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="se-app-name">Store screenshots</div>
            <div className="se-app-sub">
              {fmt.width}×{fmt.height} · drag layers · drop images · export PNG locally
            </div>
          </div>
        </div>
        <div className="se-header-actions">
          <a href={getMarketingHomeUrl()} className="se-btn-link" title="Home">
            <Home size={15} strokeWidth={2.1} />
            Home
          </a>
          <button
            type="button"
            className="se-btn-primary"
            disabled={!mockImgs || exporting}
            onClick={() => void runExport()}
          >
            <Download size={15} strokeWidth={2.25} />
            {exporting ? 'Exporting…' : 'Download PNG'}
          </button>
          <button type="button" className="se-btn-close" onClick={onRequestClose} title="Close">
            <X size={18} color="currentColor" strokeWidth={2} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left: library - add content, format, layers */}
        <aside className="se-sidebar">
          <div className="se-section-title">ADD TO CANVAS</div>
          <p style={{ fontSize: 11, color: 'var(--text3)', margin: '0 0 10px', lineHeight: 1.45 }}>
            Build your shot here. The right panel shows properties for whatever is selected (or the artboard background).
          </p>
          <button
            type="button"
            onClick={addTextLayer}
            className="se-secondary-btn se-accent-outline-btn"
            style={{ marginBottom: 8 }}
          >
            <Plus size={14} strokeWidth={2.25} /> Add text
          </button>
          <input
            ref={addImageFileRef}
            type="file"
            accept="image/*"
            className="se-sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f || !f.type.startsWith('image/')) return
              const r = new FileReader()
              r.onload = () => {
                if (typeof r.result === 'string') addImageFromDataUrl(r.result)
              }
              r.readAsDataURL(f)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => addImageFileRef.current?.click()}
            className="se-secondary-btn"
            style={{ marginBottom: 6 }}
          >
            <ImagePlus size={14} strokeWidth={2} /> Add image…
          </button>
          <p style={{ fontSize: 11, color: 'var(--text3)', margin: '0 0 8px', lineHeight: 1.45 }}>
            Adds a plain image layer to the canvas (no dialog).
          </p>
          <button
            type="button"
            disabled={!mockImgs || Boolean(loadError)}
            onClick={() => setCropModalOpen(true)}
            className="se-secondary-btn se-accent-outline-btn"
            style={{ marginBottom: 10 }}
          >
            <Crop size={14} strokeWidth={2.25} /> Crop and Corner Radius
          </button>
          <p style={{ fontSize: 11, color: 'var(--text3)', margin: '0 0 10px', lineHeight: 1.45 }}>
            Upload any image, crop it, set corner radius, then Apply — it appears centered on the canvas as a new layer.
          </p>

          <div className="se-divider" />

          <div className="se-section-title">FORMAT</div>
          <label style={{ fontSize: 11, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Export size</label>
          <select
            className="se-select"
            value={formatKey}
            onChange={(e) => setFormatKey(e.target.value)}
            style={{ marginBottom: formatKey === CUSTOM_FORMAT_KEY ? 12 : 10 }}
          >
            {formatOptgroups.map((g) => (
              <optgroup key={g.category} label={g.label}>
                {g.formats.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label} ({f.width}×{f.height})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {formatKey === CUSTOM_FORMAT_KEY ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--text2)' }}>
                Width
                <input
                  type="number"
                  min={400}
                  max={4096}
                  value={customW}
                  onChange={(e) => setCustomW(Number(e.target.value))}
                  className="se-input"
                  style={{ marginTop: 6 }}
                />
              </label>
              <label style={{ fontSize: 11, color: 'var(--text2)' }}>
                Height
                <input
                  type="number"
                  min={400}
                  max={4096}
                  value={customH}
                  onChange={(e) => setCustomH(Number(e.target.value))}
                  className="se-input"
                  style={{ marginTop: 6 }}
                />
              </label>
            </div>
          ) : null}
          <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.45, margin: 0 }}>
            Defaults to Phone 9:16 (1080×1920). Presets match store specs; Custom sets exact pixels.
          </p>

          <div className="se-divider" />

          <div className="se-section-title">LAYERS</div>
          <p style={{ fontSize: 11, color: 'var(--text2)', margin: '0 0 10px', lineHeight: 1.4 }}>
            Top = front. Click a row to select; use arrows to change stacking.
          </p>
          {listFromTop.map((layer) => {
            const stackIdx = stack.findIndex((l) => l.id === layer.id)
            const atFront = stackIdx === stack.length - 1
            const atBack = stackIdx === 0
            const rowLabel = getLayerRowLabel(layer, stack)
            return (
              <div
                key={layer.id}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 8,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(layer.id)}
                  className={`se-layer-row-btn${selectedId === layer.id ? ' se-selected' : ''}`}
                  style={{ opacity: isLayerVisible(layer) ? 1 : 0.45, flex: 1, minWidth: 0 }}
                >
                  {rowLabel}
                  {!isLayerVisible(layer) ? ' · hidden' : ''}
                </button>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                  <button
                    type="button"
                    disabled={atFront}
                    onClick={() => setStack((s) => moveStackUp(s, layer.id))}
                    className="se-layer-order-btn"
                    title="Bring forward"
                    aria-label="Bring forward"
                  >
                    <ChevronUp size={16} strokeWidth={2.25} />
                  </button>
                  <button
                    type="button"
                    disabled={atBack}
                    onClick={() => setStack((s) => moveStackDown(s, layer.id))}
                    className="se-layer-order-btn"
                    title="Send backward"
                    aria-label="Send backward"
                  >
                    <ChevronDown size={16} strokeWidth={2.25} />
                  </button>
                </div>
              </div>
            )
          })}
        </aside>

        {/* Center: stage */}
        <div
          ref={stageRef}
          className="se-stage"
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
          }}
          onDrop={onDropFiles}
        >
          {loadError ? (
            <div style={{ color: 'var(--red)' }}>{loadError}</div>
          ) : (
            <div
              ref={previewRef}
              className="se-preview-surface"
              onMouseDown={onStageMouseDown}
              onMouseMove={onStageMouseMove}
              onMouseUp={onStageMouseUp}
              style={{
                width: previewW,
                height: previewH,
                border: noBg
                  ? 'none'
                  : selectedId && selectedId !== '__bg__'
                    ? '1px solid var(--border3)'
                    : `2px solid rgba(99, 102, 241, 0.35)`,
                background: previewBackground,
                overflow: noBg ? 'visible' : 'hidden',
                borderRadius: noBg ? 0 : 8,
                boxShadow: noBg ? 'none' : '0 20px 60px rgba(0,0,0,0.45)',
              }}
            >
              {bgImageUrl ? (
                <img
                  src={bgImageUrl}
                  alt=""
                  draggable={false}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: `50% ${bgImagePanY}%`,
                    transform: `scale(${bgImageScale})`,
                    opacity: bgImageOpacity,
                    pointerEvents: 'none',
                  }}
                />
              ) : null}
              {patternCss ? (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: patternCss,
                    backgroundSize: patternSize,
                    opacity: 0.85,
                    pointerEvents: 'none',
                  }}
                />
              ) : null}

              {stack.map((layer) => {
                if (!isLayerVisible(layer)) return null
                if (layer.type === 'mockup') {
                  const img = getMockupBitmap(layer, mockImgs)
                  if (!img) return null
                  const wPct = layer.wPct
                  const nw = img.naturalWidth || img.width
                  const nh = img.naturalHeight || img.height
                  const car = nw && nh ? getLayerCroppedAspect(layer, nw, nh) : nh / Math.max(nw, 1)
                  const hPct = wPct * car * aspect
                  const rot = layer.rotation ?? 0
                  const shOn = layer.shadowOn
                  const sb = layer.shadowBlur ?? 24
                  const sx = layer.shadowOffsetX ?? 0
                  const sy = layer.shadowOffsetY ?? 12
                  const sop = clamp(layer.shadowOpacity ?? 0.35, 0, 1)
                  const dropFilter = shOn ? `drop-shadow(${sx}px ${sy}px ${sb}px rgba(0,0,0,${sop}))` : undefined
                  const mwPx = (previewW * wPct) / 100
                  const inner = nw && nh ? getImageLayerPreviewBox(layer, nw, nh, mwPx) : null
                  const br = inner
                    ? Math.min(inner.cornerRadiusPx, inner.mw / 2, inner.mh / 2, 999)
                    : 6
                  const mockSrc = layer.useSceneBg ? initialMockupWithSceneUrl : initialMockupDeviceOnlyUrl
                  return (
                    <div
                      key={layer.id}
                      style={{
                        position: 'absolute',
                        left: `${layer.x}%`,
                        top: `${layer.y}%`,
                        width: `${wPct}%`,
                        height: `${hPct}%`,
                        transform: `translate(-50%, -50%) rotate(${rot}deg)`,
                        filter: dropFilter,
                        pointerEvents: 'auto',
                        cursor: 'grab',
                        borderRadius: 0,
                        outline: 'none',
                      }}
                    >
                      <div
                        className="se-mockup-wrap"
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: br,
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          className="se-mockup-img"
                          src={mockSrc}
                          alt=""
                          draggable={false}
                          style={
                            inner?.layout
                              ? {
                                  position: 'absolute',
                                  width: inner.layout.width,
                                  height: inner.layout.height,
                                  left: inner.layout.left,
                                  top: inner.layout.top,
                                  objectFit: 'fill',
                                }
                              : undefined
                          }
                        />
                      </div>
                    </div>
                  )
                }
                if (layer.type === 'image') {
                  const imgRot = layer.rotation ?? 0
                  const nat = imgNaturalById[layer.id]
                  const mwPx = (previewW * (layer.wPct ?? 22)) / 100
                  let aspectStr = '16 / 9'
                  if (nat?.w && nat?.h) {
                    const { sw, sh } = normRectToSourcePixels(
                      nat.w,
                      nat.h,
                      resolveImageCropRect(layer, nat.w, nat.h),
                    )
                    aspectStr = `${sw} / ${sh}`
                  }
                  const inner =
                    nat?.w && nat?.h ? getImageLayerPreviewBox(layer, nat.w, nat.h, mwPx) : null
                  const br = inner
                    ? Math.min(inner.cornerRadiusPx, inner.mw / 2, inner.mh / 2, 999)
                    : 4
                  const imageDropFilter = getLayerDropShadowFilter(layer)
                  return (
                    <div
                      key={layer.id}
                      style={{
                        position: 'absolute',
                        left: `${layer.x}%`,
                        top: `${layer.y}%`,
                        width: `${layer.wPct}%`,
                        transform: `translate(-50%, -50%) rotate(${imgRot}deg)`,
                        opacity: layer.opacity ?? 1,
                        filter: imageDropFilter,
                        pointerEvents: 'auto',
                        cursor: 'grab',
                        outline: 'none',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: aspectStr,
                          overflow: 'hidden',
                          borderRadius: br,
                        }}
                      >
                        <img
                          src={layer.src}
                          alt=""
                          draggable={false}
                          onLoad={(e) => {
                            const el = e.currentTarget
                            setImgNaturalById((m) => ({
                              ...m,
                              [layer.id]: { w: el.naturalWidth, h: el.naturalHeight },
                            }))
                          }}
                          style={
                            inner?.layout
                              ? {
                                  position: 'absolute',
                                  width: inner.layout.width,
                                  height: inner.layout.height,
                                  left: inner.layout.left,
                                  top: inner.layout.top,
                                  display: 'block',
                                }
                              : { width: '100%', height: 'auto', display: 'block' }
                          }
                        />
                      </div>
                    </div>
                  )
                }
                if (layer.type === 'text') {
                  const fsPx = Math.max(10, (previewH * (layer.fontSizePct ?? 3.5)) / 100)
                  const hasFixedTextWidth = hasExplicitTextWidth(layer)
                  const textMaxWidthPx = hasExplicitTextWidth(layer)
                    ? (previewW * clamp(layer.maxWidthPct, 20, 98)) / 100
                    : null
                  const gradientFill = layer.fillMode === 'gradient'
                    ? `linear-gradient(${layer.gradientAngle ?? 90}deg, ${layer.gradientStart || layer.color || '#f8fafc'} 0%, ${layer.gradientEnd || layer.color || '#cbd5e1'} 100%)`
                    : null
                  return (
                    <div
                      key={layer.id}
                      ref={(el) => {
                        if (el) textLayerRootRef.current[layer.id] = el
                        else delete textLayerRootRef.current[layer.id]
                      }}
                      style={{
                        position: 'absolute',
                        left: `${layer.x}%`,
                        top: `${layer.y}%`,
                        transform: 'translate(-50%, -50%)',
                        padding: '14px 18px',
                        margin: 0,
                        cursor: 'grab',
                        pointerEvents: 'auto',
                        outline: 'none',
                        borderRadius: 4,
                        boxSizing: 'content-box',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-block',
                          width: textMaxWidthPx ? `${textMaxWidthPx}px` : 'auto',
                          maxWidth: textMaxWidthPx ? `${textMaxWidthPx}px` : 'none',
                          textAlign: layer.align || 'center',
                          fontSize: fsPx,
                          lineHeight: TEXT_LINE_HEIGHT,
                          fontFamily: `"${layer.fontFamily || 'Inter'}", system-ui, sans-serif`,
                          fontWeight: layer.fontWeight || 600,
                          color: gradientFill ? 'transparent' : layer.color || '#fff',
                          opacity: clamp(layer.opacity ?? 1, 0, 1),
                          whiteSpace: hasFixedTextWidth ? 'pre-wrap' : 'pre',
                          wordBreak: hasFixedTextWidth ? 'break-word' : 'normal',
                          overflowWrap: hasFixedTextWidth ? 'anywhere' : 'normal',
                          backgroundImage: gradientFill || 'none',
                          backgroundClip: gradientFill ? 'text' : 'border-box',
                          WebkitBackgroundClip: gradientFill ? 'text' : 'border-box',
                          WebkitTextFillColor: gradientFill ? 'transparent' : undefined,
                        }}
                      >
                        {layer.text}
                      </div>
                    </div>
                  )
                }
                return null
              })}

              {mockLayer && mockImgs ? (
                <div
                  className="se-mono"
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 9,
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    pointerEvents: 'none',
                    opacity: 0.85,
                    maxWidth: 'calc(100% - 16px)',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <GripHorizontal size={12} strokeWidth={2} /> Drag layers · drop images on the canvas
                </div>
              ) : null}
              {dropHint ? (
                <div
                  className="se-mono"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    background: 'rgba(0,0,0,0.78)',
                    color: 'var(--red)',
                    padding: '10px 16px',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                >
                  {dropHint}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right: contextual properties (Figma-style) */}
        <aside className="se-rail">
          <div className="se-section-title" style={{ marginBottom: 6 }}>{rightRailTitle}</div>
          {selectedId === '__bg__' ? (
            <p style={{ fontSize: 11, color: 'var(--text3)', margin: '0 0 12px', lineHeight: 1.45 }}>
              Scene fill, pattern, and optional background image. Click the canvas or a layer to switch panels.
            </p>
          ) : (
            <p style={{ fontSize: 11, color: 'var(--text3)', margin: '0 0 12px', lineHeight: 1.45 }}>
              Click the artboard (outside layers) anytime to return to background settings.
            </p>
          )}

          <div className="se-rail-inner">
          {selectedId === '__bg__' ? (
            <>
              <div style={{ fontWeight: 700, letterSpacing: 1, color: '#94a3b8', marginBottom: 12, fontSize: 11 }}>BACKGROUND</div>
              <label style={{ display: 'block', color: '#64748b', marginBottom: 6 }}>Background type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, marginBottom: 10 }}>
                {[
                  { id: 'none', label: 'None' },
                  { id: 'solid', label: 'Solid color' },
                  { id: 'gradient', label: 'Gradient' },
                ].map((mode) => {
                  const active = bgMode === mode.id
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      className="se-chip-btn"
                      onClick={() => setBgMode(mode.id)}
                      style={{
                        minHeight: 32,
                        borderColor: active ? ACCENT : undefined,
                        background: active ? 'rgba(99, 102, 241, 0.12)' : undefined,
                        color: active ? '#e2e8f0' : undefined,
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {mode.label}
                    </button>
                  )
                })}
              </div>
              <p style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.45, margin: '0 0 10px' }}>
                Choose a solid color or a gradient here before adding patterns or a background image.
              </p>
              {bgMode === 'solid' ? (
                <label style={{ marginBottom: 10, display: 'block' }}>
                  <span style={{ color: '#64748b' }}>Color</span>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ display: 'block', height: 36, marginTop: 4, border: 'none' }} />
                </label>
              ) : bgMode === 'gradient' ? (
                <>
                  <label style={{ display: 'block', marginBottom: 8 }}>
                    <span style={{ color: '#64748b' }}>Start</span>
                    <input type="color" value={gradStart} onChange={(e) => setGradStart(e.target.value)} style={{ display: 'block' }} />
                  </label>
                  <label style={{ display: 'block', marginBottom: 8 }}>
                    <span style={{ color: '#64748b' }}>End</span>
                    <input type="color" value={gradEnd} onChange={(e) => setGradEnd(e.target.value)} style={{ display: 'block' }} />
                  </label>
                  <label style={{ display: 'block', marginBottom: 10 }}>
                    <span style={{ color: '#64748b' }}>Angle ({gradAngle}°)</span>
                    <input type="range" min={0} max={360} value={gradAngle} onChange={(e) => setGradAngle(Number(e.target.value))} style={{ width: '100%' }} />
                  </label>
                </>
              ) : null}
              {!noBg && <label style={{ display: 'block', color: '#64748b', marginBottom: 4 }}>Pattern</label>}
              {!noBg && (
                <>
                  <select
                    className="se-select"
                    value={bgPattern || ''}
                    onChange={(e) => setBgPattern(e.target.value)}
                    style={{ marginBottom: 12 }}
                  >
                    <option value="">None</option>
                    <option value="dots">Dots</option>
                    <option value="lines">Lines</option>
                    <option value="grid">Grid</option>
                    <option value="waves">Waves</option>
                  </select>
                  <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>BACKGROUND IMAGE</div>
                  <button
                    type="button"
                    onClick={() => bgFileRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: 8,
                      borderRadius: 8,
                      border: '1px solid #334155',
                      background: '#04050d',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      marginBottom: 8,
                    }}
                  >
                    Upload image…
                  </button>
                  {bgImageUrl ? (
                    <button type="button" onClick={() => setBgImageUrl('')} style={{ width: '100%', marginBottom: 8, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Remove BG image
                    </button>
                  ) : null}
                  <label style={{ display: 'block', color: '#64748b', marginBottom: 4 }}>BG scale</label>
                  <input type="range" min={0.5} max={2} step={0.05} value={bgImageScale} onChange={(e) => setBgImageScale(Number(e.target.value))} style={{ width: '100%', marginBottom: 10 }} />
                  <label style={{ display: 'block', color: '#64748b', marginBottom: 4 }}>BG vertical pan (%)</label>
                  <input type="range" min={0} max={100} value={bgImagePanY} onChange={(e) => setBgImagePanY(Number(e.target.value))} style={{ width: '100%', marginBottom: 10 }} />
                  <label style={{ display: 'block', color: '#64748b', marginBottom: 4 }}>
                    BG image opacity ({Math.round(bgImageOpacity * 100)}%)
                  </label>
                  <input type="range" min={0} max={1} step={0.01} value={bgImageOpacity} onChange={(e) => setBgImageOpacity(Number(e.target.value))} style={{ width: '100%' }} />
                </>
              )}
              <input
                ref={bgFileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  const r = new FileReader()
                  r.onload = () => {
                    if (typeof r.result === 'string') setBgImageUrl(r.result)
                  }
                  r.readAsDataURL(f)
                  e.target.value = ''
                }}
              />
            </>
          ) : selected?.type === 'mockup' ? (
            <>
              <div style={{ fontWeight: 700, letterSpacing: 1, color: '#94a3b8', marginBottom: 12, fontSize: 11 }}>DEVICE</div>
              {!sameCapture ? (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, color: '#e2e8f0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selected.useSceneBg === true}
                      onChange={(e) => updateLayer(selected.id, { useSceneBg: e.target.checked })}
                    />
                    Include generator scene background
                  </label>
                  <p style={{ color: '#64748b', fontSize: 11, lineHeight: 1.5, marginBottom: 12 }}>
                    Turn off to use only the device (no sidebar gradient/solid from the mockup generator).
                  </p>
                </>
              ) : (
                <p style={{ color: '#64748b', fontSize: 11, lineHeight: 1.5, marginBottom: 12 }}>
                  Mockup was opened without a generator scene; only the device frame is available.
                </p>
              )}
              <p style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.45, margin: '0 0 12px' }}>
                Extra pictures with crop and rounded corners: use <strong style={{ color: 'var(--text2)' }}>Crop and Corner Radius</strong> in the left column (upload there).
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={isLayerVisible(selected)}
                  onChange={(e) => updateLayer(selected.id, { visible: e.target.checked })}
                />
                {isLayerVisible(selected) ? <Eye size={14} /> : <EyeOff size={14} />}
                Show device in preview & export
              </label>
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>
                Device size — {clamp(selected.wPct ?? DEFAULT_MOCKUP_WIDTH_PCT, MOCKUP_WIDTH_MIN_PCT, MOCKUP_WIDTH_MAX_PCT)}% of canvas
              </label>
              <input
                type="range"
                min={MOCKUP_WIDTH_MIN_PCT}
                max={MOCKUP_WIDTH_MAX_PCT}
                step={1}
                value={clamp(selected.wPct ?? DEFAULT_MOCKUP_WIDTH_PCT, MOCKUP_WIDTH_MIN_PCT, MOCKUP_WIDTH_MAX_PCT)}
                onChange={(e) => updateLayer(selected.id, { wPct: clamp(Number(e.target.value), MOCKUP_WIDTH_MIN_PCT, MOCKUP_WIDTH_MAX_PCT) })}
                style={{ width: '100%', marginBottom: 4 }}
              />
              <p style={{ fontSize: 10, color: 'var(--text3)', margin: '0 0 10px', lineHeight: 1.4 }}>
                Auto-sized for the current export size. Drag the slider to adjust.
              </p>
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Rotation ({selected.rotation ?? 0}°)</label>
              <input
                type="range"
                min={-90}
                max={90}
                step={0.5}
                value={selected.rotation ?? 0}
                onChange={(e) => updateLayer(selected.id, { rotation: Number(e.target.value) })}
                style={{ width: '100%', marginBottom: 12 }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={Boolean(selected.shadowOn)}
                  onChange={(e) => updateLayer(selected.id, { shadowOn: e.target.checked })}
                />
                Drop shadow (device only — off by default)
              </label>
              {selected.shadowOn ? (
                <>
                  <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Shadow blur ({selected.shadowBlur ?? 24}px)</label>
                  <input
                    type="range"
                    min={0}
                    max={220}
                    value={selected.shadowBlur ?? 24}
                    onChange={(e) => updateLayer(selected.id, { shadowBlur: Number(e.target.value) })}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Shadow offset X ({selected.shadowOffsetX ?? 0}px)</label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selected.shadowOffsetX ?? 0}
                    onChange={(e) => updateLayer(selected.id, { shadowOffsetX: Number(e.target.value) })}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Shadow offset Y ({selected.shadowOffsetY ?? 12}px)</label>
                  <input
                    type="range"
                    min={-180}
                    max={220}
                    value={selected.shadowOffsetY ?? 12}
                    onChange={(e) => updateLayer(selected.id, { shadowOffsetY: Number(e.target.value) })}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Shadow opacity ({Math.round((selected.shadowOpacity ?? 0.35) * 100)}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={selected.shadowOpacity ?? 0.35}
                    onChange={(e) => updateLayer(selected.id, { shadowOpacity: Number(e.target.value) })}
                    style={{ width: '100%', marginBottom: 12 }}
                  />
                </>
              ) : null}
              <button
                type="button"
                onClick={() => duplicateLayer(selected.id)}
                className="se-secondary-btn"
                style={{ marginBottom: 8 }}
              >
                <Copy size={14} /> Duplicate device
              </button>
              <p style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.45, margin: '0 0 8px' }}>
                Duplicate sits behind this device in the stack; use ↑ / ↓ in the layer list to reorder. Same screenshot — for a second image, export and re-open, or add an image layer.
              </p>
              {stack.filter((l) => l.type === 'mockup').length > 1 ? (
                <button
                  type="button"
                  onClick={() => deleteLayer(selected.id)}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid #7f1d1d',
                    background: '#1c0a0a',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  Remove this device
                </button>
              ) : null}
            </>
          ) : selected?.type === 'image' ? (
            <>
              <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 12, fontSize: 11 }}>IMAGE</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={isLayerVisible(selected)}
                  onChange={(e) => updateLayer(selected.id, { visible: e.target.checked })}
                />
                {isLayerVisible(selected) ? <Eye size={14} /> : <EyeOff size={14} />}
                Visible
              </label>
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Scale ({clamp(selected.wPct ?? 22, IMAGE_WIDTH_MIN_PCT, IMAGE_WIDTH_MAX_PCT)}%)</label>
              <input
                type="range"
                min={IMAGE_WIDTH_MIN_PCT}
                max={IMAGE_WIDTH_MAX_PCT}
                step={1}
                value={clamp(selected.wPct ?? 22, IMAGE_WIDTH_MIN_PCT, IMAGE_WIDTH_MAX_PCT)}
                onChange={(e) => updateLayer(selected.id, { wPct: clamp(Number(e.target.value), IMAGE_WIDTH_MIN_PCT, IMAGE_WIDTH_MAX_PCT) })}
                style={{ width: '100%', marginBottom: 10 }}
              />
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Opacity</label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={selected.opacity ?? 1}
                onChange={(e) => updateLayer(selected.id, { opacity: Number(e.target.value) })}
                style={{ width: '100%', marginBottom: 12 }}
              />
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>
                Rotation ({selected.rotation ?? 0}°)
              </label>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={selected.rotation ?? 0}
                onChange={(e) => updateLayer(selected.id, { rotation: Number(e.target.value) })}
                style={{ width: '100%', marginBottom: 6 }}
              />
              <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
                {[{ label: 'Reset', deg: 0 }, { label: '90°', deg: 90 }, { label: '-90°', deg: -90 }, { label: '180°', deg: 180 }].map(({ label, deg }) => (
                  <button
                    key={label}
                    type="button"
                    className="se-chip-btn"
                    style={{ flex: 1, minWidth: 0, fontSize: 10, padding: '4px 6px' }}
                    onClick={() => updateLayer(selected.id, { rotation: deg })}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={Boolean(selected.shadowOn)}
                  onChange={(e) => updateLayer(selected.id, { shadowOn: e.target.checked })}
                />
                Drop shadow
              </label>
              {selected.shadowOn ? (
                <>
                  <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Shadow blur ({selected.shadowBlur ?? 24}px)</label>
                  <input
                    type="range"
                    min={0}
                    max={220}
                    value={selected.shadowBlur ?? 24}
                    onChange={(e) => updateLayer(selected.id, { shadowBlur: Number(e.target.value) })}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Shadow offset X ({selected.shadowOffsetX ?? 0}px)</label>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={selected.shadowOffsetX ?? 0}
                    onChange={(e) => updateLayer(selected.id, { shadowOffsetX: Number(e.target.value) })}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Shadow offset Y ({selected.shadowOffsetY ?? 12}px)</label>
                  <input
                    type="range"
                    min={-180}
                    max={220}
                    value={selected.shadowOffsetY ?? 12}
                    onChange={(e) => updateLayer(selected.id, { shadowOffsetY: Number(e.target.value) })}
                    style={{ width: '100%', marginBottom: 8 }}
                  />
                  <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Shadow opacity ({Math.round((selected.shadowOpacity ?? 0.35) * 100)}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={selected.shadowOpacity ?? 0.35}
                    onChange={(e) => updateLayer(selected.id, { shadowOpacity: Number(e.target.value) })}
                    style={{ width: '100%', marginBottom: 12 }}
                  />
                </>
              ) : null}
              <input
                ref={replaceImageFileRef}
                type="file"
                accept="image/*"
                className="se-sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f || !f.type.startsWith('image/')) return
                  const r = new FileReader()
                  r.onload = () => {
                    if (typeof r.result === 'string') {
                      updateLayer(selected.id, {
                        src: r.result,
                        imageCropRect: getDefaultImageCropRect(),
                        imageCrop: undefined,
                        imageCropRefW: undefined,
                        imageCropRefH: undefined,
                      })
                    }
                  }
                  r.readAsDataURL(f)
                  e.target.value = ''
                }}
              />
              <button
                type="button"
                onClick={() => replaceImageFileRef.current?.click()}
                className="se-secondary-btn"
                style={{ marginBottom: 6 }}
              >
                <ImagePlus size={14} /> Replace image file…
              </button>
              <p style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.45, margin: '0 0 8px' }}>
                To add a <strong style={{ color: 'var(--text2)' }}>new</strong> image with upload, crop, and corner radius, use <strong style={{ color: 'var(--text2)' }}>Crop and Corner Radius</strong> in the left column.
              </p>
              <button
                type="button"
                onClick={() => duplicateLayer(selected.id)}
                className="se-secondary-btn"
                style={{ marginBottom: 8 }}
              >
                <Copy size={14} /> Duplicate layer
              </button>
              <button
                type="button"
                onClick={() => deleteLayer(selected.id)}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #7f1d1d', background: '#1c0a0a', color: '#f87171', cursor: 'pointer' }}
              >
                Delete layer
              </button>
            </>
          ) : selected?.type === 'text' ? (
            <>
              <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 12, fontSize: 11 }}>TEXT</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text)', cursor: 'pointer', fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={isLayerVisible(selected)}
                  onChange={(e) => updateLayer(selected.id, { visible: e.target.checked })}
                />
                {isLayerVisible(selected) ? <Eye size={14} /> : <EyeOff size={14} />}
                Visible
              </label>
              <textarea
                value={selected.text || ''}
                onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                rows={4}
                className="se-input"
                style={{
                  width: '100%',
                  marginBottom: 10,
                  minHeight: 88,
                  resize: 'vertical',
                }}
              />
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Fill</label>
              <select
                className="se-select"
                value={selected.fillMode || 'solid'}
                onChange={(e) => {
                  const nextMode = e.target.value
                  updateLayer(selected.id, nextMode === 'gradient'
                    ? {
                        fillMode: 'gradient',
                        gradientStart: selected.gradientStart || selected.color || '#f8fafc',
                        gradientEnd: selected.gradientEnd || '#cbd5e1',
                        gradientAngle: typeof selected.gradientAngle === 'number' ? selected.gradientAngle : 90,
                      }
                    : { fillMode: 'solid' })
                }}
                style={{ marginBottom: 8 }}
              >
                <option value="solid">Solid color</option>
                <option value="gradient">Gradient</option>
              </select>
              {selected.fillMode === 'gradient' ? (
                <>
                  <label style={{ display: 'block', marginBottom: 8 }}>
                    <span style={{ color: '#64748b' }}>Gradient start</span>
                    <input
                      type="color"
                      value={selected.gradientStart || selected.color || '#f8fafc'}
                      onChange={(e) => updateLayer(selected.id, { gradientStart: e.target.value })}
                      style={{ display: 'block', marginTop: 4 }}
                    />
                  </label>
                  <label style={{ display: 'block', marginBottom: 8 }}>
                    <span style={{ color: '#64748b' }}>Gradient end</span>
                    <input
                      type="color"
                      value={selected.gradientEnd || selected.color || '#cbd5e1'}
                      onChange={(e) => updateLayer(selected.id, { gradientEnd: e.target.value })}
                      style={{ display: 'block', marginTop: 4 }}
                    />
                  </label>
                  <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>
                    Gradient angle ({Math.round(selected.gradientAngle ?? 90)}°)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={selected.gradientAngle ?? 90}
                    onChange={(e) => updateLayer(selected.id, { gradientAngle: Number(e.target.value) })}
                    style={{ width: '100%', marginBottom: 10 }}
                  />
                </>
              ) : (
                <label style={{ display: 'block', marginBottom: 10 }}>
                  <span style={{ color: '#64748b' }}>Color</span>
                  <input
                    type="color"
                    value={selected.color || '#ffffff'}
                    onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
                    style={{ display: 'block', marginTop: 4 }}
                  />
                </label>
              )}
              <label style={{ color: '#64748b', marginBottom: 6, display: 'block' }}>Font size</label>
              {(() => {
                const h = fmt.height
                const minPx = 12
                const maxPx = TEXT_FONT_MAX_PX
                const px = Math.round((h * (selected.fontSizePct ?? 3.5)) / 100)
                const v = Math.max(minPx, Math.min(maxPx, px))
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <input
                      type="range"
                      min={minPx}
                      max={maxPx}
                      step={1}
                      value={v}
                      onChange={(e) =>
                        updateLayer(selected.id, { fontSizePct: (Number(e.target.value) / h) * 100 })
                      }
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <span className="se-mono" style={{ flexShrink: 0, fontSize: 11, color: 'var(--text2)', minWidth: '3.5rem', textAlign: 'right' }}>
                      {v}px
                    </span>
                  </div>
                )
              })()}
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Font family</label>
              <select
                className="se-select"
                value={selected.fontFamily || 'Inter'}
                onChange={(e) => updateLayer(selected.id, { fontFamily: e.target.value })}
                style={{ marginBottom: 10 }}
              >
                {STORE_TEXT_FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Font weight</label>
              <select
                className="se-select"
                value={String(selected.fontWeight ?? 600)}
                onChange={(e) => updateLayer(selected.id, { fontWeight: Number(e.target.value) })}
                style={{ marginBottom: 8 }}
              >
                <option value="400">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra bold (800)</option>
                <option value="900">Black (900)</option>
              </select>
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Opacity</label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={selected.opacity ?? 1}
                onChange={(e) => updateLayer(selected.id, { opacity: Number(e.target.value) })}
                style={{ width: '100%', marginBottom: 8 }}
              />
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Align</label>
              <select
                className="se-select"
                value={selected.align || 'center'}
                onChange={(e) => updateLayer(selected.id, { align: e.target.value })}
                style={{ marginBottom: 8 }}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
              <label style={{ color: '#64748b', marginBottom: 4, display: 'block' }}>Text width</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <span style={{ color: 'var(--text2)', fontSize: 11 }}>
                  {hasExplicitTextWidth(selected)
                    ? `${Math.round(selected.maxWidthPct)}% of canvas`
                    : 'Free text'}
                </span>
                <button
                  type="button"
                  className="se-chip-btn"
                  onClick={() => updateLayer(selected.id, { maxWidthPct: null })}
                  disabled={!hasExplicitTextWidth(selected)}
                >
                  Free text
                </button>
              </div>
              <input
                type="range"
                min={35}
                max={98}
                step={1}
                value={hasExplicitTextWidth(selected) ? selected.maxWidthPct : 92}
                onChange={(e) => updateLayer(selected.id, { maxWidthPct: Number(e.target.value) })}
                style={{ width: '100%', marginBottom: 10 }}
              />
              <p style={{ fontSize: 10, color: 'var(--text3)', lineHeight: 1.45, margin: '0 0 10px' }}>
                Free text stays horizontal until you add a line break. Set wrap width only when you want the editor to wrap lines for you.
              </p>
              <button
                type="button"
                onClick={() => duplicateLayer(selected.id)}
                className="se-secondary-btn"
                style={{ marginBottom: 8 }}
              >
                <Copy size={14} /> Duplicate layer
              </button>
              <button
                type="button"
                onClick={() => deleteLayer(selected.id)}
                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #7f1d1d', background: '#1c0a0a', color: '#f87171', cursor: 'pointer' }}
              >
                Delete layer
              </button>
            </>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, margin: 0 }}>
              Select a layer on the canvas or from the list.
            </p>
          )}
          </div>

          <p className="se-mono" style={{ color: 'var(--text3)', marginTop: 12, lineHeight: 1.5, marginBottom: 0, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            Export: {EXPORT_SCALE}× → {fmt.width * EXPORT_SCALE}×{fmt.height * EXPORT_SCALE}px PNG · local only
          </p>
        </aside>
      </div>

      {cropModalOpen ? (
        <StoreCropCornerModal
          open={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          onApply={(payload) => {
            addImageFromDataUrl(payload.dataUrl, {
              imageCropRect: payload.imageCropRect,
              imageCornerRadiusRatio: payload.imageCornerRadiusRatio,
            })
            setCropModalOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
