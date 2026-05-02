import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import {
  clampNormRect,
  getDefaultImageCropRect,
  containFitRect,
  stagePxToNorm,
} from './storeRectCropMath.js'

const MIN = 0.02

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

function applyDragToRect(handle, nx, ny, r0, pn0) {
  let x = r0.x
  let y = r0.y
  let w = r0.w
  let h = r0.h
  const right = r0.x + r0.w
  const bottom = r0.y + r0.h

  if (handle === 'move') {
    x = clamp(r0.x + nx - pn0.nx, 0, 1 - r0.w)
    y = clamp(r0.y + ny - pn0.ny, 0, 1 - r0.h)
  } else if (handle === 'e') {
    w = clamp(nx - r0.x, MIN, 1 - r0.x)
  } else if (handle === 'w') {
    x = clamp(nx, 0, right - MIN)
    w = right - x
  } else if (handle === 's') {
    h = clamp(ny - r0.y, MIN, 1 - r0.y)
  } else if (handle === 'n') {
    y = clamp(ny, 0, bottom - MIN)
    h = bottom - y
  } else if (handle === 'se') {
    w = clamp(nx - r0.x, MIN, 1 - r0.x)
    h = clamp(ny - r0.y, MIN, 1 - r0.y)
  } else if (handle === 'sw') {
    x = clamp(nx, 0, right - MIN)
    w = right - x
    h = clamp(ny - r0.y, MIN, 1 - r0.y)
  } else if (handle === 'ne') {
    w = clamp(nx - r0.x, MIN, 1 - r0.x)
    y = clamp(ny, 0, bottom - MIN)
    h = bottom - y
  } else if (handle === 'nw') {
    x = clamp(nx, 0, right - MIN)
    w = right - x
    y = clamp(ny, 0, bottom - MIN)
    h = bottom - y
  }

  return clampNormRect({ x, y, w, h })
}

/**
 * Upload an image, then rectangular crop + corner radius; Apply returns data URL + crop state for a new layer.
 */
export default function StoreCropCornerModal({
  open,
  title = 'Crop and Corner Radius',
  onApply,
  onClose,
}) {
  const stageRef = useRef(null)
  const fileRef = useRef(null)
  const [box, setBox] = useState({ w: 520, h: 380 })
  const [dataUrl, setDataUrl] = useState(null)
  const [natW, setNatW] = useState(0)
  const [natH, setNatH] = useState(0)
  const [rect, setRect] = useState(() => getDefaultImageCropRect())
  const [cornerRatio, setCornerRatio] = useState(0)

  const dragRef = useRef(null)

  useEffect(() => {
    if (!open || !dataUrl) return
    const img = new Image()
    img.onload = () => {
      setNatW(img.naturalWidth || img.width)
      setNatH(img.naturalHeight || img.height)
      setRect(getDefaultImageCropRect())
      setCornerRatio(0)
    }
    img.src = dataUrl
  }, [open, dataUrl])

  useEffect(() => {
    if (!open || !dataUrl) return
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      setBox({ w: Math.max(1, r.width), h: Math.max(1, r.height) })
    })
    ro.observe(el)
    const r = el.getBoundingClientRect()
    setBox({ w: Math.max(1, r.width), h: Math.max(1, r.height) })
    return () => ro.disconnect()
  }, [open, dataUrl])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const normFromClient = (clientX, clientY) => {
      const el = stageRef.current
      if (!el || !natW || !natH) return { nx: 0, ny: 0 }
      const br = el.getBoundingClientRect()
      const c = containFitRect(natW, natH, Math.max(1, br.width), Math.max(1, br.height))
      return stagePxToNorm(clientX - br.left, clientY - br.top, c)
    }

    const onMove = (e) => {
      const d = dragRef.current
      if (!d) return
      const { nx, ny } = normFromClient(e.clientX, e.clientY)
      setRect(applyDragToRect(d.handle, nx, ny, d.r0, d.pn0))
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [open, natW, natH])

  const contain = containFitRect(natW, natH, box.w, box.h)
  const { ox, oy, iw, ih } = contain

  const rectPx = useMemo(() => {
    if (!iw || !ih) return { rx: 0, ry: 0, rw: 0, rh: 0 }
    return {
      rx: ox + rect.x * iw,
      ry: oy + rect.y * ih,
      rw: rect.w * iw,
      rh: rect.h * ih,
    }
  }, [ox, oy, iw, ih, rect])

  const previewRadiusPx = cornerRatio * 0.5 * Math.min(rectPx.rw || 0, rectPx.rh || 0)

  const readFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    setNatW(0)
    setNatH(0)
    setRect(getDefaultImageCropRect())
    setCornerRatio(0)
    dragRef.current = null
    const r = new FileReader()
    r.onload = () => {
      if (typeof r.result === 'string') setDataUrl(r.result)
    }
    r.readAsDataURL(file)
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      const f = e.dataTransfer?.files?.[0]
      if (f) readFile(f)
    },
    [readFile],
  )

  const onPointerDownMarquee = useCallback(
    (e, handle) => {
      if (!iw || !ih) return
      e.preventDefault()
      e.stopPropagation()
      const el = stageRef.current
      if (!el) return
      const br = el.getBoundingClientRect()
      const c = containFitRect(natW, natH, br.width, br.height)
      const { nx, ny } = stagePxToNorm(e.clientX - br.left, e.clientY - br.top, c)
      dragRef.current = {
        handle,
        r0: { ...rect },
        pn0: { nx, ny },
      }
    },
    [iw, ih, natW, natH, rect],
  )

  const handleApply = () => {
    if (!dataUrl || !natW || !natH) return
    onApply({
      dataUrl,
      imageCropRect: clampNormRect(rect),
      imageCornerRadiusRatio: clamp(cornerRatio, 0, 1),
    })
  }

  if (!open) return null

  const showCropUi = Boolean(dataUrl && natW && natH)

  return (
    <div
      className="se-modal-backdrop se-cropcorner-backdrop"
      role="presentation"
      aria-label="Close dialog"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="se-modal-card se-cropcorner-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="se-cropcorner-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="se-modal-head">
          <h2 id="se-cropcorner-title" className="se-modal-title">
            {title}
          </h2>
          <button type="button" className="se-modal-x" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {!showCropUi ? (
          <p className="se-modal-lead">
            Upload an image first. Then drag the rectangle to crop it and adjust corner rounding. Apply adds it to the
            canvas center. Press Esc or click outside to cancel.
          </p>
        ) : (
          <p className="se-modal-lead">
            Drag the rectangle to choose what stays. Resize from edges or corners. Corner rounding applies to the cropped
            result.
          </p>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="se-sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) readFile(f)
            e.target.value = ''
          }}
        />

        <div ref={stageRef} className="se-cropcorner-stage">
          {!dataUrl ? (
            <button
              type="button"
              className="se-drop-zone se-cropcorner-upload-zone"
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={28} strokeWidth={2} />
              <span>Upload image</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text3)' }}>
                Drop a file here or click to browse
              </span>
            </button>
          ) : !natW ? (
            <div className="se-cropcorner-loading">Loading image…</div>
          ) : (
            <>
              <img src={dataUrl} alt="" className="se-cropcorner-base-img" draggable={false} />
              <div
                className="se-cropcorner-marquee"
                style={{
                  left: rectPx.rx,
                  top: rectPx.ry,
                  width: rectPx.rw,
                  height: rectPx.rh,
                  borderRadius: Math.min(previewRadiusPx, rectPx.rw / 2, rectPx.rh / 2),
                }}
                onPointerDown={(e) => onPointerDownMarquee(e, 'move')}
              >
                {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    className={`se-cropcorner-handle se-cropcorner-handle--${h}`}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      onPointerDownMarquee(e, h)
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {showCropUi ? (
          <>
            <button type="button" className="se-secondary-btn se-modal-repick" onClick={() => fileRef.current?.click()}>
              Choose different image…
            </button>
            <div className="se-crop-row">
              <span>Corner radius</span>
              <span className="se-crop-val">{Math.round(cornerRatio * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(cornerRatio * 100)}
              onChange={(e) => setCornerRatio(clamp(Number(e.target.value) / 100, 0, 1))}
              className="se-crop-range"
            />
          </>
        ) : null}

        <div className="se-modal-actions">
          <button type="button" className="se-secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="se-primary-btn" disabled={!showCropUi} onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
