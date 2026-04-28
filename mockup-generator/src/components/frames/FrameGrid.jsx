import { useMemo, useState } from 'react'
import { getFrameThumbnailSrc } from '../../data/frames'
import { getDisplayFrameLabel } from '../../utils/frameLabels'

export default function FrameGrid({ frames, selectedId, onSelect }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return frames
    return frames.filter(
      (frame) =>
        frame.label?.toLowerCase().includes(q) ||
        String(frame.id || '')
          .toLowerCase()
          .includes(q)
    )
  }, [frames, query])

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="block flex-shrink-0">
        <span className="sr-only">Filter frames</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter frames…"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-xs text-[var(--text-muted)]">No frames match &ldquo;{query.trim()}&rdquo;</p>
      ) : (
        <div className="grid w-full grid-cols-2 gap-3 md:gap-4">
          {filtered.map((frame) => {
            const isSelected = selectedId === frame.id
            return (
              <button
                key={frame.id}
                type="button"
                onClick={() => onSelect(frame)}
                className={`
              group relative flex flex-col items-center gap-2 rounded-xl border p-3
              transition-all duration-[var(--transition)]
              ${isSelected
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_15px_rgba(99,102,241,0.12)] ring-1 ring-[var(--accent)]/40'
                : 'border-white/[0.025] bg-white/[0.01] hover:border-white/[0.06] hover:bg-white/[0.028]'
              }
            `}
              >
                <div
                  className={`
              flex w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--panel2)]
              bg-gradient-to-b from-[#f0f4ff]/50 to-[#e4eaf8]/50 ring-1 ring-inset ring-black/[0.07]
              ${frame.canvasWidth > 500 ? 'h-[5.25rem]' : 'h-[5.5rem]'}
            `}
                >
                  <img
                    src={getFrameThumbnailSrc(frame)}
                    alt=""
                    className={`
                  frame-picker-thumb max-w-full object-contain p-1 transition-opacity duration-[var(--transition)]
                  ${frame.canvasWidth > 500 ? 'max-h-[4.25rem]' : 'max-h-[5rem]'}
                  ${isSelected ? 'opacity-100' : 'opacity-95 group-hover:opacity-100'}
                `}
                  />
                </div>
                <span
                  className={`
              flex min-h-[2.5rem] w-full items-center justify-center text-center text-xs font-medium leading-snug
              ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}
            `}
                >
                  {getDisplayFrameLabel(frame)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
