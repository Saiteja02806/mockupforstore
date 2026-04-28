import { Star } from 'lucide-react'
import { supportsVectorStatusBar } from '../../data/frames'
import { useMockupStore } from '../../store/mockupStore'

function StatusPreviewGlyphs() {
  return (
    <div className="studio-vector-preview-icons" aria-hidden>
      <svg viewBox="0 0 29 23" className="studio-vector-preview-icon studio-vector-preview-icon--wifi">
        <path d="M0.8 6.6C4.4 2.6 9.1 0.5 14.7 0.5c5.4 0 10.2 2.1 13.8 6.1L15.1 21.9z" fill="currentColor" />
      </svg>
      <svg viewBox="-1 -1 21 21" className="studio-vector-preview-icon studio-vector-preview-icon--signal">
        <path d="M0 17L17 0h2v19H2c-1.1 0-2-.9-2-2Z" fill="currentColor" />
      </svg>
      <svg viewBox="-1 -1 15 21" className="studio-vector-preview-icon studio-vector-preview-icon--battery">
        <path d="M4.1 0h5.1v2.4h2.2c.9 0 1.6.7 1.6 1.6v13.4c0 .9-.7 1.6-1.6 1.6H1.6C.7 19 0 18.3 0 17.4V4c0-.9.7-1.6 1.6-1.6h2.5Z" fill="currentColor" />
      </svg>
    </div>
  )
}

export default function VectorStatusBarPanel({ selectedFrame }) {
  const {
    vectorStatusBarEnabled,
    setVectorStatusBarEnabled,
    vectorStatusBarTime,
    setVectorStatusBarTime,
    vectorStatusBarColor,
    setVectorStatusBarColor,
    vectorStatusBarTimeOffsetX,
    setVectorStatusBarTimeOffsetX,
    vectorStatusBarTimeOffsetY,
    setVectorStatusBarTimeOffsetY,
    vectorStatusBarIconsOffsetX,
    setVectorStatusBarIconsOffsetX,
    vectorStatusBarIconsOffsetY,
    setVectorStatusBarIconsOffsetY,
    resetVectorStatusBarPosition,
  } = useMockupStore()

  if (!supportsVectorStatusBar(selectedFrame)) return null

  const previewTime = vectorStatusBarTime || '12:30'
  const isBlack = vectorStatusBarColor === 'black'
  const previewColor = isBlack ? '#111111' : '#ffffff'

  return (
    <section className="studio-vector-card" aria-label="Vector status bar controls">
      <div className="studio-vector-head">
        <div className="studio-vector-meta">
          <span className="studio-vector-mark" aria-hidden>
            <Star size={11} fill="currentColor" />
          </span>
          <div>
            <div className="studio-vector-title">Status bar</div>
            <div className="studio-vector-copy">
              Vector only. Adds a lighter phone-style time and icon strip inside the frame.
            </div>
          </div>
        </div>
        <label className={`studio-vector-toggle${vectorStatusBarEnabled ? ' studio-vector-toggle--on' : ''}`}>
          <input
            type="checkbox"
            checked={vectorStatusBarEnabled}
            onChange={(e) => setVectorStatusBarEnabled(e.target.checked)}
          />
          <span>{vectorStatusBarEnabled ? 'On' : 'Off'}</span>
        </label>
      </div>

      {vectorStatusBarEnabled ? (
        <>
          <div className="studio-vector-body">
            <label className="studio-vector-field">
              <span className="studio-vector-field-label">Time</span>
              <input
                type="time"
                step="60"
                value={vectorStatusBarTime}
                onChange={(e) => setVectorStatusBarTime(e.target.value)}
                className="studio-vector-input"
              />
            </label>
            <div
              className={`studio-vector-preview${isBlack ? ' studio-vector-preview--black' : ''}`}
              style={{ '--studio-status-preview-color': previewColor }}
              aria-hidden
            >
              <span className="studio-vector-preview-time" style={{ color: previewColor }}>{previewTime}</span>
              <StatusPreviewGlyphs />
            </div>
          </div>
          <div className="studio-vector-tone-row" role="group" aria-label="Status bar color">
            {[
              { id: 'white', label: 'White' },
              { id: 'black', label: 'Black' },
            ].map((tone) => (
              <button
                key={tone.id}
                type="button"
                className={`studio-vector-tone-btn${vectorStatusBarColor === tone.id ? ' studio-vector-tone-btn--on' : ''}`}
                onClick={() => setVectorStatusBarColor(tone.id)}
              >
                {tone.label}
              </button>
            ))}
          </div>
          <details className="studio-vector-position-menu">
            <summary>
              <span>Position</span>
              <span className="studio-vector-position-summary">
                Time {vectorStatusBarTimeOffsetX}/{vectorStatusBarTimeOffsetY} · Icons {vectorStatusBarIconsOffsetX}/{vectorStatusBarIconsOffsetY}
              </span>
            </summary>
            <div className="studio-vector-position-grid">
              <div className="studio-vector-position-title">Time position</div>
              <label className="studio-vector-range">
                <span>Move X ({vectorStatusBarTimeOffsetX}%)</span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={vectorStatusBarTimeOffsetX}
                  onChange={(e) => setVectorStatusBarTimeOffsetX(e.target.value)}
                />
              </label>
              <label className="studio-vector-range">
                <span>Move Y ({vectorStatusBarTimeOffsetY}%)</span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={vectorStatusBarTimeOffsetY}
                  onChange={(e) => setVectorStatusBarTimeOffsetY(e.target.value)}
                />
              </label>
              <div className="studio-vector-position-title">Wi-Fi, signal, battery position</div>
              <label className="studio-vector-range">
                <span>Move X ({vectorStatusBarIconsOffsetX}%)</span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={vectorStatusBarIconsOffsetX}
                  onChange={(e) => setVectorStatusBarIconsOffsetX(e.target.value)}
                />
              </label>
              <label className="studio-vector-range">
                <span>Move Y ({vectorStatusBarIconsOffsetY}%)</span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={vectorStatusBarIconsOffsetY}
                  onChange={(e) => setVectorStatusBarIconsOffsetY(e.target.value)}
                />
              </label>
              <button type="button" className="studio-vector-reset" onClick={resetVectorStatusBarPosition}>
                Reset positions
              </button>
            </div>
          </details>
          <p className="studio-vector-note">Shown in preview and export with the same overlay.</p>
        </>
      ) : (
        <p className="studio-vector-note">Only appears on vector frames like borderless devices.</p>
      )}
    </section>
  )
}
