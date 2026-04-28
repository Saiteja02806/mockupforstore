import { useState, useEffect, useCallback } from 'react'
import { Sun, Contrast, RotateCcw, Trash2, Scaling, MoveHorizontal, MoveVertical } from 'lucide-react'
import { getEffectiveFrameLayout } from '../../data/frames'
import { useMockupStore } from '../../store/mockupStore'
import {
  applyImageFilters,
  getUserImageAdjustment,
  resetImagePosition,
  removeUserImage,
  setImageDisplayMode,
  setUserImageAxisRelativeScale,
  setUserImagePanRelative,
  setUserImageRelativeScale,
} from '../../utils/canvasHelpers'

const SCALE_MIN = 100
const SCALE_MAX = 300

function clampSliderValue(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(Number(value) || 0)))
}

export default function ImageAdjustPanel({ canvasRef }) {
  const {
    selectedFrame,
    userImageFile,
    setUserImageFile,
    imageFitMode,
    setImageFitMode,
    rasterIntrinsic,
    canvasLayoutGeneration,
  } = useMockupStore()
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [opacity, setOpacity] = useState(100)
  const [scalePercent, setScalePercent] = useState(100)
  const [scaleXPercent, setScaleXPercent] = useState(100)
  const [scaleYPercent, setScaleYPercent] = useState(100)
  const [panXPercent, setPanXPercent] = useState(0)
  const [panYPercent, setPanYPercent] = useState(0)

  useEffect(() => {
    if (!canvasRef.current?._userImage) return
    applyImageFilters(canvasRef.current, {
      brightness,
      contrast,
      opacity: opacity / 100,
    })
  }, [brightness, canvasRef, contrast, opacity])

  const getScreenArea = useCallback(() => {
    if (!selectedFrame) return null
    return getEffectiveFrameLayout(selectedFrame, rasterIntrinsic).screenArea
  }, [rasterIntrinsic, selectedFrame])

  const syncAdjustmentFromCanvas = useCallback(() => {
    const c = canvasRef.current
    const screenArea = getScreenArea()
    if (!c?._userImage || !screenArea) return
    const next = getUserImageAdjustment(c, screenArea, imageFitMode)
    setScalePercent(clampSliderValue(next.scalePercent, SCALE_MIN, SCALE_MAX))
    setScaleXPercent(clampSliderValue(next.scaleXPercent ?? next.scalePercent, SCALE_MIN, SCALE_MAX))
    setScaleYPercent(clampSliderValue(next.scaleYPercent ?? next.scalePercent, SCALE_MIN, SCALE_MAX))
    setPanXPercent(clampSliderValue(next.panXPercent, -100, 100))
    setPanYPercent(clampSliderValue(next.panYPercent, -100, 100))
  }, [canvasRef, getScreenArea, imageFitMode])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setScalePercent(100)
      setScaleXPercent(100)
      setScaleYPercent(100)
      setPanXPercent(0)
      setPanYPercent(0)
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedFrame?.id, canvasLayoutGeneration])

  useEffect(() => {
    const c = canvasRef.current
    if (!c?._userImage) return
    const onTransform = () => syncAdjustmentFromCanvas()
    c.on('object:moving', onTransform)
    c.on('object:scaling', onTransform)
    c.on('object:modified', onTransform)
    const frame = requestAnimationFrame(syncAdjustmentFromCanvas)
    return () => {
      cancelAnimationFrame(frame)
      c.off('object:moving', onTransform)
      c.off('object:scaling', onTransform)
      c.off('object:modified', onTransform)
    }
  }, [canvasRef, syncAdjustmentFromCanvas, userImageFile, canvasLayoutGeneration])

  function handleReset() {
    if (!canvasRef.current || !selectedFrame) return
    const screenArea = getScreenArea()
    if (!screenArea) return
    resetImagePosition(canvasRef.current, screenArea)
    setBrightness(0)
    setContrast(0)
    setOpacity(100)
    setScalePercent(100)
    setScaleXPercent(100)
    setScaleYPercent(100)
    setPanXPercent(0)
    setPanYPercent(0)
  }

  function handleRemove() {
    if (!canvasRef.current) return
    removeUserImage(canvasRef.current)
    setUserImageFile(null)
    setBrightness(0)
    setContrast(0)
    setOpacity(100)
    setScalePercent(100)
    setScaleXPercent(100)
    setScaleYPercent(100)
    setPanXPercent(0)
    setPanYPercent(0)
  }

  function handleDisplayMode(mode) {
    if (!canvasRef.current || !selectedFrame) return
    const screenArea = getScreenArea()
    if (!screenArea) return
    setImageFitMode(mode)
    setImageDisplayMode(canvasRef.current, screenArea, mode)
    setScalePercent(100)
    setScaleXPercent(100)
    setScaleYPercent(100)
    setPanXPercent(0)
    setPanYPercent(0)
  }

  function handleScaleSlider(percent) {
    if (!canvasRef.current || !selectedFrame) return
    const screenArea = getScreenArea()
    if (!screenArea) return
    const next = clampSliderValue(percent, SCALE_MIN, SCALE_MAX)
    setScalePercent(next)
    setScaleXPercent(next)
    setScaleYPercent(next)
    setUserImageRelativeScale(canvasRef.current, screenArea, imageFitMode, next)
    syncAdjustmentFromCanvas()
  }

  function handleAxisScaleSlider(axis, percent) {
    if (!canvasRef.current || !selectedFrame) return
    const screenArea = getScreenArea()
    if (!screenArea) return
    const next = clampSliderValue(percent, SCALE_MIN, SCALE_MAX)
    if (axis === 'x') {
      setScaleXPercent(next)
    } else {
      setScaleYPercent(next)
    }
    setUserImageAxisRelativeScale(canvasRef.current, screenArea, imageFitMode, axis, next)
    syncAdjustmentFromCanvas()
  }

  function handlePanSlider(axis, value) {
    if (!canvasRef.current || !selectedFrame) return
    const screenArea = getScreenArea()
    if (!screenArea) return
    const nextValue = clampSliderValue(value, -100, 100)
    const nextX = axis === 'x' ? nextValue : panXPercent
    const nextY = axis === 'y' ? nextValue : panYPercent
    setPanXPercent(nextX)
    setPanYPercent(nextY)
    setUserImagePanRelative(canvasRef.current, screenArea, nextX, nextY)
    syncAdjustmentFromCanvas()
  }

  if (!userImageFile) return null

  return (
    <div className="editor-control-well flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="editor-field-label">Image fit</span>
          <span className="max-w-[14rem] text-right text-[10px] leading-snug text-[var(--text-muted)]">
            Drag image to reposition. Use sliders for exact fitting.
          </span>
        </div>
        <div className="studio-fit-row">
          {[
            { id: 'fill', label: 'Fill screen' },
            { id: 'fit', label: 'Full image' },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleDisplayMode(id)}
              className={`studio-fit-btn${imageFitMode === id ? ' studio-fit-btn--on' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="studio-fit-hint">
          {imageFitMode === 'fit'
            ? 'Full image keeps everything visible and may show padding.'
            : 'Fill screen prevents gaps; move and size the crop below.'}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="editor-field-label">Size</span>
          <span className="text-[10px] tabular-nums text-[var(--text-muted)]">{scalePercent}%</span>
        </div>
        <div className="flex min-h-10 items-center gap-3">
          <Scaling size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
          <input
            type="range"
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={1}
            value={scalePercent}
            onChange={(e) => handleScaleSlider(Number(e.target.value))}
            className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
            aria-label="Image size relative to selected fit mode"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="editor-field-label">Crop fill</span>
          <span className="max-w-[13rem] text-right text-[10px] leading-snug text-[var(--text-muted)]">
            Expands artwork on one axis to remove inner padding.
          </span>
        </div>
        <div className="flex min-h-10 items-center gap-3">
          <MoveHorizontal size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
          <input
            type="range"
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={1}
            value={scaleXPercent}
            onChange={(e) => handleAxisScaleSlider('x', Number(e.target.value))}
            className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
            aria-label="Increase image width inside frame"
          />
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">{scaleXPercent}%</span>
        </div>
        <div className="flex min-h-10 items-center gap-3">
          <MoveVertical size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
          <input
            type="range"
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={1}
            value={scaleYPercent}
            onChange={(e) => handleAxisScaleSlider('y', Number(e.target.value))}
            className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
            aria-label="Increase image height inside frame"
          />
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">{scaleYPercent}%</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="editor-field-label">Move crop</span>
          <span className="text-[10px] text-[var(--text-muted)]">screen-relative</span>
        </div>
        <div className="flex min-h-10 items-center gap-3">
          <MoveHorizontal size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={panXPercent}
            onChange={(e) => handlePanSlider('x', Number(e.target.value))}
            className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
            aria-label="Move image horizontally inside frame"
          />
          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">{panXPercent}</span>
        </div>
        <div className="flex min-h-10 items-center gap-3">
          <MoveVertical size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={panYPercent}
            onChange={(e) => handlePanSlider('y', Number(e.target.value))}
            className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
            aria-label="Move image vertically inside frame"
          />
          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">{panYPercent}</span>
        </div>
      </div>

      <div className="flex min-h-10 items-center gap-3">
        <Sun size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
        <input
          type="range"
          min="-100"
          max="100"
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
        />
        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">{brightness}</span>
      </div>

      <div className="flex min-h-10 items-center gap-3">
        <Contrast size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden />
        <input
          type="range"
          min="-100"
          max="100"
          value={contrast}
          onChange={(e) => setContrast(Number(e.target.value))}
          className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
        />
        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">{contrast}</span>
      </div>

      <div className="flex min-h-10 items-center gap-3">
        <div
          className="h-3.5 w-3.5 shrink-0 rounded-full border border-[var(--border)]"
          style={{ opacity: opacity / 100, backgroundColor: 'var(--text-primary)' }}
          aria-hidden
        />
        <input
          type="range"
          min="10"
          max="100"
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
          className="flex-1 h-1 accent-[var(--accent)] cursor-pointer"
        />
        <span className="w-8 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">{opacity}%</span>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleReset}
          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-xs font-medium text-[var(--text-secondary)] transition-all duration-[var(--transition)] hover:bg-[var(--bg-hover)]"
        >
          <RotateCcw size={14} aria-hidden />
          Reset
        </button>
        <button
          type="button"
          onClick={handleRemove}
          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--error)]/25 bg-[var(--error)]/10 text-xs font-medium text-[var(--error)] transition-all duration-[var(--transition)] hover:bg-[var(--error)]/20"
        >
          <Trash2 size={14} aria-hidden />
          Remove
        </button>
      </div>
    </div>
  )
}
