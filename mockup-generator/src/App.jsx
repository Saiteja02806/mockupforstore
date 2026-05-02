import { useCallback, useEffect, useRef, useState } from 'react'
import MarketingHome from './MarketingHome'
import { AlertCircle, Home } from 'lucide-react'
import { getInitialAppPage, homeNavProps } from './utils/siteLinks'
import MockupCanvas from './components/canvas/MockupCanvas'
import UploadZone from './components/upload/UploadZone'
import DownloadButton from './components/export/DownloadButton'
import StoreEditorLaunchButton from './components/export/StoreEditorLaunchButton'
import FrameGrid from './components/frames/FrameGrid'
import ImageAdjustPanel from './components/canvas/ImageAdjustPanel'
import VectorStatusBarPanel from './components/canvas/VectorStatusBarPanel'
import { useMockupStore } from './store/mockupStore'
import {
  getEffectiveFrameLayout,
  getFramesByCategory,
  isRasterFrame,
  supportsVectorStatusBar,
} from './data/frames'
import {
  fileToImageElement,
  getBackgroundStyle,
  placeImage,
  removeUserImage,
  removeVectorStatusBar,
  setImageDisplayMode,
  syncVectorStatusBar,
  syncFabricCanvasToLayout,
} from './utils/canvasHelpers'
import { downloadAsPNG } from './utils/exportHelpers'
import { getDisplayFrameLabel } from './utils/frameLabels'

const BG_PRESETS = [
  { id: 'ink',      color: '#09090b', label: 'Ink' },
  { id: 'slate',    color: '#16181d', label: 'Slate' },
  { id: 'paper',    color: '#f5f5f5', label: 'Paper' },
  { id: 'white',    color: '#ffffff', label: 'White' },
  { id: 'mist',     color: '#e7ecf3', label: 'Mist' },
  { id: 'navy',     color: '#20304d', label: 'Navy' },
  { id: 'ocean',    color: '#0c4a6e', label: 'Ocean' },
  { id: 'forest',   color: '#1f4d3c', label: 'Forest' },
  { id: 'berry',    color: '#5b1735', label: 'Berry' },
  { id: 'violet',   color: '#1f174a', label: 'Violet' },
  { id: 'bronze',   color: '#2c2418', label: 'Bronze' },
  { id: 'graphite', color: '#201f24', label: 'Graphite' },
]

const BG_GRADIENT_PRESETS = [
  { id: 'aurora',  label: 'Aurora',      type: 'linear', angle: 145, colors: ['#0b0c10', '#1a1c2e'] },
  { id: 'ocean',   label: 'Ocean fade',  type: 'linear', angle: 145, colors: ['#0a1426', '#0d3d5a'] },
  { id: 'forest',  label: 'Forest fade', type: 'linear', angle: 145, colors: ['#0a1c12', '#0d3e26'] },
  { id: 'rose',    label: 'Rose fade',   type: 'linear', angle: 145, colors: ['#1c0810', '#48161e'] },
  { id: 'paper',   label: 'Paper fade',  type: 'linear', angle: 160, colors: ['#ffffff', '#e8eaf0'] },
  { id: 'mist',    label: 'Mist fade',   type: 'linear', angle: 160, colors: ['#c8d8f2', '#e8f0ff'] },
  { id: 'sunset',  label: 'Sunset',      type: 'linear', angle: 135, colors: ['#1a0533', '#f97316'] },
  { id: 'indigo',  label: 'Indigo',      type: 'linear', angle: 145, colors: ['#0f0c29', '#302b63'] },
]

const SIDEBAR_MIN_WIDTH     = Math.round(220 * 1.2)
const SIDEBAR_MAX_WIDTH     = Math.round(420 * 1.2)
const SIDEBAR_DEFAULT_WIDTH = Math.round(264 * 1.2)

function SLabel({ children }) {
  return <span className="studio-sblbl">{children}</span>
}

function SceneModeBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`studio-fit-btn${active ? ' studio-fit-btn--on' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function SliderRow({ label, min, max, step = 1, value, onChange, unit = '' }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text2)' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text3)', fontVariantNumeric: 'tabular-nums' }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
        aria-label={label}
      />
    </div>
  )
}

/* ─── Section label ──────────────────────────────────────────────────── */
/* ─── Scene mode buttons ─────────────────────────────────────────────── */
/* ─── Slider row ─────────────────────────────────────────────────────── */
/* ═══ Main StudioApp ════════════════════════════════════════════════════ */
function StudioApp({ onGoHome } = {}) {
  const canvasRef      = useRef(null)

  const [sidebarWidth,   setSidebarWidth]   = useState(SIDEBAR_DEFAULT_WIDTH)

  const isDraggingRef     = useRef(false)
  const dragStartXRef     = useRef(0)
  const dragStartWidthRef = useRef(SIDEBAR_DEFAULT_WIDTH)

  const {
    activeCategory, setActiveCategory,
    selectedFrame,  setSelectedFrame,
    userImageFile,  setUserImageFile,
    imageFitMode,   setImageFitMode,
    backgroundColor, setBackgroundColor,
    bgGradient,      setBgGradient,
    frameColorVariant,
    frameShadowStrength,
    vectorStatusBarEnabled, vectorStatusBarTime, vectorStatusBarColor,
    vectorStatusBarTimeOffsetX, vectorStatusBarTimeOffsetY,
    vectorStatusBarIconsOffsetX, vectorStatusBarIconsOffsetY,
    rasterIntrinsic,
    canvasLayoutGeneration,
    isLoading, error,
  } = useMockupStore()

  const categoryFrames = getFramesByCategory(activeCategory)
  const previewLayout  = selectedFrame ? getEffectiveFrameLayout(selectedFrame, rasterIntrinsic) : null

  const sceneMode = bgGradient ? 'gradient' : 'solid'
  const previewBgStyle = getBackgroundStyle(backgroundColor, bgGradient)

  /* ── Auto-select first frame on category change ── */
  useEffect(() => {
    const frames = getFramesByCategory(activeCategory)
    if (frames.length > 0) setSelectedFrame(frames[0])
  }, [activeCategory, setSelectedFrame])

  /* ── Force fill for raster frames ── */
  useEffect(() => {
    if (!selectedFrame) return
    if (isRasterFrame(selectedFrame)) setImageFitMode('fill')
  }, [selectedFrame, setImageFitMode])

  /* ── Place / re-place image on canvas ── */
  useEffect(() => {
    if (!userImageFile || !selectedFrame || !canvasRef.current) return
    if (isRasterFrame(selectedFrame) && rasterIntrinsic?.frameId !== selectedFrame.id) return

    let cancelled = false
    const genAtStart = useMockupStore.getState().canvasLayoutGeneration
    fileToImageElement(userImageFile).then((imageElement) => {
      if (cancelled) return
      const canvas = canvasRef.current
      if (!canvas) return
      const frame = useMockupStore.getState().selectedFrame
      if (!frame || frame.id !== selectedFrame.id) return
      const intrinsic = useMockupStore.getState().rasterIntrinsic
      if (isRasterFrame(frame) && intrinsic?.frameId !== frame.id) return
      const layout = getEffectiveFrameLayout(frame, intrinsic)
      if (!layout.screenArea) return
      if (useMockupStore.getState().canvasLayoutGeneration !== genAtStart) return
      syncFabricCanvasToLayout(canvas, layout)
      placeImage(canvas, imageElement, layout.screenArea, useMockupStore.getState().imageFitMode)
    })
    return () => { cancelled = true }
  }, [selectedFrame, userImageFile, rasterIntrinsic, canvasLayoutGeneration])

  /* ── Sync fit mode ── */
  useEffect(() => {
    if (!canvasRef.current?._userImage || !selectedFrame) return
    const layout = getEffectiveFrameLayout(selectedFrame, rasterIntrinsic)
    syncFabricCanvasToLayout(canvasRef.current, layout)
    setImageDisplayMode(canvasRef.current, layout.screenArea, imageFitMode)
  }, [imageFitMode, selectedFrame, rasterIntrinsic, canvasLayoutGeneration])

  /* ── Sync status bar ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !selectedFrame) return
    if (!supportsVectorStatusBar(selectedFrame) || !vectorStatusBarEnabled) {
      removeVectorStatusBar(canvas)
      return
    }
    const layout = getEffectiveFrameLayout(selectedFrame, rasterIntrinsic)
    if (!layout.screenArea) { removeVectorStatusBar(canvas); return }
    syncVectorStatusBar(canvas, layout.screenArea, {
      timeValue:       vectorStatusBarTime,
      color:           vectorStatusBarColor === 'black' ? '#111111' : '#ffffff',
      timeOffsetXPct:  vectorStatusBarTimeOffsetX,
      timeOffsetYPct:  vectorStatusBarTimeOffsetY,
      iconsOffsetXPct: vectorStatusBarIconsOffsetX,
      iconsOffsetYPct: vectorStatusBarIconsOffsetY,
    })
  }, [
    selectedFrame, rasterIntrinsic, canvasLayoutGeneration, userImageFile,
    vectorStatusBarEnabled, vectorStatusBarTime, vectorStatusBarColor,
    vectorStatusBarTimeOffsetX, vectorStatusBarTimeOffsetY,
    vectorStatusBarIconsOffsetX, vectorStatusBarIconsOffsetY,
  ])

  const handleCanvasReady = useCallback((canvas) => { canvasRef.current = canvas }, [])

  const buildExportOptions = useCallback(() => ({
    fabricCanvas:        canvasRef.current,
    selectedFrame,
    frameColorVariant,
    frameShadowStrength,
    backgroundColor,
    bgGradient,
  }), [backgroundColor, bgGradient, frameColorVariant, frameShadowStrength, selectedFrame])

  const exportSectionActive = Boolean(selectedFrame && !isLoading)

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvasRef.current?._userImage) {
        const active = canvasRef.current.getActiveObject()
        if (active === canvasRef.current._userImage) {
          e.preventDefault()
          removeUserImage(canvasRef.current)
          setUserImageFile(null)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (canvasRef.current && userImageFile && selectedFrame) {
          void downloadAsPNG(buildExportOptions(), selectedFrame.id || 'mockup')
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [buildExportOptions, selectedFrame, setUserImageFile, userImageFile])

  /* ── Sidebar drag-resize ── */
  function onResizeMouseDown(e) {
    e.preventDefault()
    isDraggingRef.current       = true
    dragStartXRef.current       = e.clientX
    dragStartWidthRef.current   = sidebarWidth
    function onMouseMove(ev) {
      if (!isDraggingRef.current) return
      const delta = ev.clientX - dragStartXRef.current
      setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, dragStartWidthRef.current + delta)))
    }
    function onMouseUp() {
      isDraggingRef.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  /* ── Gradient helpers ── */
  /* ── Batch processing ── */
  /* ── Status indicators ── */
  function applyGradientPreset(preset) {
    setBgGradient({ type: preset.type, angle: preset.angle, colors: [...preset.colors] })
  }

  function isGradientPresetActive(preset) {
    if (!bgGradient) return false
    return (
      bgGradient.type === preset.type &&
      bgGradient.angle === preset.angle &&
      Array.isArray(bgGradient.colors) &&
      bgGradient.colors.length === preset.colors.length &&
      bgGradient.colors.every((c, i) => c === preset.colors[i])
    )
  }

  function setCustomGradientColor(index, color) {
    if (!bgGradient) return
    const colors = [...bgGradient.colors]
    colors[index] = color
    setBgGradient({ ...bgGradient, colors })
  }

  const placed     = Boolean(userImageFile)
  const dotClass   = placed ? 'studio-sdot studio-sdot--placed' : selectedFrame ? 'studio-sdot studio-sdot--ready' : 'studio-sdot'
  const studioStatus = placed ? 'Image placed' : selectedFrame ? 'Frame ready' : 'Select a frame'

  /* ── Right-sidebar sections ── */
  /* ═══ Tilt transform for preview ══ */
  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <div className="studio-app-root">

      {/* ── Header ── */}
      <header className="studio-app-header">
        <a
          {...homeNavProps(onGoHome)}
          title="Go to home screen"
          style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none', color:'inherit' }}
        >
          <div className="studio-app-logo">M</div>
          <span className="studio-app-title">Mockup Studio</span>
        </a>
        <span className="sp" />
        <div className="studio-status-chip">
          <div className={dotClass} />
          <span>{studioStatus}</span>
        </div>
        <div className="studio-dim-pill">
          {previewLayout ? `${previewLayout.canvasWidth} × ${previewLayout.canvasHeight}` : '—'}
        </div>
        <a
          {...homeNavProps(onGoHome)}
          title="Home"
          style={{
            display:'inline-flex', alignItems:'center', gap:6, height:28, padding:'0 10px',
            borderRadius:7, border:'1px solid var(--border2)', background:'var(--panel2)',
            color:'var(--text2)', fontSize:11, fontWeight:600, textDecoration:'none', cursor:'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background='var(--panel3)'; e.currentTarget.style.color='var(--text)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background='var(--panel2)'; e.currentTarget.style.color='var(--text2)' }}
        >
          <Home size={14} />Home
        </a>
      </header>

      {/* ── Body ── */}
      <div className="studio-body">

        {/* ── Left sidebar: Step 1 device ── */}
        <aside className="studio-sidebar" aria-label="Device selector" style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
          <div className="studio-sidebar-scroll">
            <div className="studio-sbs">
              <div className="studio-shdr">
                <div className={`studio-snum${selectedFrame ? ' studio-snum--on' : ''}`}>1</div>
                <div>
                  <div className="studio-stitle">Choose device</div>
                  <div className="studio-sdesc">Pick category and frame</div>
                </div>
              </div>
              <div className="studio-catg">
                {[
                  { id:'mobile',  label:'Mobile',  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="2" width="10" height="20" rx="2"/></svg> },
                  { id:'tablet',  label:'Tablet',  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/></svg> },
                  { id:'desktop', label:'Desktop', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
                  { id:'watch',   label:'Watch',   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="7" width="6" height="10" rx="1"/><path d="M9 7V5h6v2M9 17v2h6v-2"/></svg> },
                ].map(({ id, label, icon }) => (
                  <button key={id} type="button"
                    className={`studio-cbtn${activeCategory === id ? ' studio-cbtn--on' : ''}`}
                    onClick={() => setActiveCategory(id)}
                  >{icon}{label}</button>
                ))}
              </div>
              <FrameGrid frames={categoryFrames} selectedId={selectedFrame?.id} onSelect={setSelectedFrame} />
            </div>
          </div>
        </aside>

        <div className="studio-resize-handle" onMouseDown={onResizeMouseDown}
          title="Drag to resize sidebar" role="separator" aria-label="Resize sidebar" />

        {/* ── Canvas area ── */}
        <main id="preview-main" className="studio-cvmain" aria-label="Live preview">
          <div className="studio-cvview">
            {/* Background layer */}
            <div className="studio-cvbg" style={previewBgStyle} />

            {selectedFrame ? (
              <>
                {isLoading && <div className="studio-loading"><div className="studio-spinner" /></div>}
                <MockupCanvas onCanvasReady={handleCanvasReady} />
              </>
            ) : (
              <div className="studio-emptyhint">
                <div className="studio-ehicon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5">
                    <rect x="7" y="2" width="10" height="20" rx="2"/>
                  </svg>
                </div>
                <div className="studio-ehtitle">Select a device frame</div>
                <div className="studio-ehsub">Choose from the sidebar on the left</div>
              </div>
            )}

          </div>

          <div className="studio-preview-footer">
            <span style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span className={dotClass} style={{ width:4, height:4 }} />
              <span>{placed ? 'Image placed' : selectedFrame ? 'Frame ready' : 'Ready'}</span>
            </span>
            {selectedFrame && (
              <span style={{ maxWidth:'55%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:12, color:'var(--text-muted)' }}>
                {getDisplayFrameLabel(selectedFrame)}{userImageFile ? ` · ${imageFitMode === 'fit' ? 'full image' : 'fill screen'}` : ''}
              </span>
            )}
          </div>
        </main>

        {/* ── Right sidebar ── */}
        <aside className="studio-rightbar" aria-label="Store editor, export, artwork, and background controls">
          <div className="studio-rightbar-scroll">

            {/* Store editor — first; works with frame only (no screenshot required) */}
            <div className="studio-sbs">
              <SLabel>App / Play Store</SLabel>
              <StoreEditorLaunchButton
                buildExportOptions={buildExportOptions}
                disabled={!selectedFrame || isLoading}
                suggestedBaseName={(userImageFile?.name || selectedFrame?.id || 'mockup').replace(/\.[^.]+$/, '')}
              />
              <p className="studio-sdesc" style={{ marginTop: 8, lineHeight: 1.45 }}>
                Image crop and rounded corners for store compositions live in this editor — not in step 3 on the mockup
                canvas.
              </p>
            </div>

            <div className="studio-sbd" />

            {/* Step 2 — Export */}
            <div className="studio-sbs">
              <div className="studio-shdr">
                <div className={`studio-snum${exportSectionActive ? ' studio-snum--on' : ''}`}>2</div>
                <div>
                  <div className="studio-stitle">Export mockup</div>
                  <div className="studio-sdesc">Download full-res PNG or JPG</div>
                </div>
              </div>
              <VectorStatusBarPanel selectedFrame={selectedFrame} />
              <DownloadButton
                canvasRef={canvasRef}
                selectedFrame={selectedFrame}
                frameName={selectedFrame?.id}
                frameColorVariant={frameColorVariant}
                frameShadowStrength={frameShadowStrength}
                backgroundColor={backgroundColor}
                bgGradient={bgGradient}
                disabled={!userImageFile}
              />
              {error && (
                <div className="studio-error" style={{ marginTop:8 }}>
                  <AlertCircle size={12} /><span>{error}</span>
                </div>
              )}
            </div>

            <div className="studio-sbd" />

            {/* Step 3 — Upload */}
            <div className="studio-sbs">
              <div className="studio-shdr">
                <div className={`studio-snum${userImageFile ? ' studio-snum--on' : ''}`}>3</div>
                <div>
                  <div className="studio-stitle">Add artwork</div>
                  <div className="studio-sdesc">Placed inside the screen area</div>
                </div>
              </div>
              <UploadZone />
              {userImageFile && (
                <ImageAdjustPanel
                  key={`${userImageFile.name}-${userImageFile.lastModified}`}
                  canvasRef={canvasRef}
                />
              )}
            </div>

            <div className="studio-sbd" />

            {/* Step 4 - Background */}
            <div className="studio-sbs">
              <div className="studio-shdr">
                <div className={`studio-snum${selectedFrame ? ' studio-snum--on' : ''}`}>4</div>
                <div>
                  <div className="studio-stitle">Background</div>
                  <div className="studio-sdesc">Solid colors and gradients</div>
                </div>
              </div>

              <SLabel>Scene mode</SLabel>
              <div className="studio-fit-row">
                <SceneModeBtn active={sceneMode === 'solid'} onClick={() => setBgGradient(null)}>Solid</SceneModeBtn>
                <SceneModeBtn
                  active={sceneMode === 'gradient'}
                  onClick={() => {
                    if (!bgGradient) applyGradientPreset(BG_GRADIENT_PRESETS[0])
                  }}
                >
                  Gradient
                </SceneModeBtn>
              </div>

              {sceneMode === 'solid' ? (
                <>
                  <SLabel>Colors</SLabel>
                  <div className="studio-swg">
                    {BG_PRESETS.map((p) => (
                      <div
                        key={p.id}
                        className={`studio-sw${backgroundColor === p.color ? ' studio-sw--on' : ''}`}
                        style={{ background: p.color }}
                        title={p.label}
                        role="button"
                        tabIndex={0}
                        onClick={() => setBackgroundColor(p.color)}
                        onKeyDown={(e) => e.key === 'Enter' && setBackgroundColor(p.color)}
                        aria-label={`Background: ${p.label}`}
                        aria-pressed={backgroundColor === p.color}
                      />
                    ))}
                  </div>
                  <SLabel>Custom hex</SLabel>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      style={{ width: 32, height: 28, cursor: 'pointer', borderRadius: 6, border: '1px solid var(--border2)', background: 'none', padding: 2 }}
                    />
                    <input
                      className="studio-custinput"
                      type="text"
                      placeholder="#09090b"
                      maxLength={7}
                      value={backgroundColor.startsWith('#') ? backgroundColor : ''}
                      onChange={(e) => {
                        const v = e.target.value.trim()
                        if (/^#[0-9a-f]{6}$/i.test(v)) setBackgroundColor(v)
                      }}
                    />
                  </div>
                </>
              ) : null}

              {sceneMode === 'gradient' ? (
                <>
                  <SLabel>Gradient presets</SLabel>
                  <div className="studio-grg">
                    {BG_GRADIENT_PRESETS.map((p) => (
                      <div
                        key={p.id}
                        className={`studio-grsw${isGradientPresetActive(p) ? ' studio-grsw--on' : ''}`}
                        style={{ background: `linear-gradient(${p.angle}deg, ${p.colors.join(', ')})` }}
                        title={p.label}
                        role="button"
                        tabIndex={0}
                        onClick={() => applyGradientPreset(p)}
                        onKeyDown={(e) => e.key === 'Enter' && applyGradientPreset(p)}
                      />
                    ))}
                  </div>
                  {bgGradient ? (
                    <div className="studio-grad-editor">
                      <SLabel>Custom gradient</SLabel>
                      <div className="studio-grad-preview" style={{ background: `linear-gradient(${bgGradient.angle}deg, ${bgGradient.colors.join(', ')})` }} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Color A</div>
                          <input
                            type="color"
                            value={bgGradient.colors[0] || '#000000'}
                            onChange={(e) => setCustomGradientColor(0, e.target.value)}
                            style={{ width: '100%', height: 30, cursor: 'pointer', borderRadius: 6, border: '1px solid var(--border2)', background: 'none', padding: 2 }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 4 }}>Color B</div>
                          <input
                            type="color"
                            value={bgGradient.colors[1] || '#ffffff'}
                            onChange={(e) => setCustomGradientColor(1, e.target.value)}
                            style={{ width: '100%', height: 30, cursor: 'pointer', borderRadius: 6, border: '1px solid var(--border2)', background: 'none', padding: 2 }}
                          />
                        </div>
                      </div>
                      <SliderRow
                        label="Angle"
                        min={0}
                        max={360}
                        value={bgGradient.angle}
                        onChange={(v) => setBgGradient({ ...bgGradient, angle: v })}
                        unit="°"
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

          </div>
        </aside>
      </div>
    </div>
  )
}

/* ═══ Root app ════════════════════════════════════════════════════════════ */
export default function App() {
  const [mode, setMode] = useState(() => getInitialAppPage())

  const goHome = useCallback(() => {
    if (typeof window !== 'undefined') window.history.pushState(null, '', window.location.pathname || '/')
    setMode('landing')
  }, [])

  const enterStudio = useCallback(() => {
    if (typeof window !== 'undefined' && window.location.hash !== '#studio') window.history.pushState(null, '', '#studio')
    setMode('studio')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('marketing-mode', mode === 'landing')
    return () => document.documentElement.classList.remove('marketing-mode')
  }, [mode])

  useEffect(() => {
    const sync = () => setMode(getInitialAppPage())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync) }
  }, [])

  if (mode === 'landing') return <MarketingHome onEnterStudio={enterStudio} />
  return <StudioApp onGoHome={goHome} />
}
