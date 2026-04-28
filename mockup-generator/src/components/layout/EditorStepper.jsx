const STEPS = [
  { id: 'editor-step-device', label: 'Device' },
  { id: 'editor-step-artwork', label: 'Photo' },
  { id: 'editor-step-scene', label: 'Scene' },
  { id: 'editor-step-export', label: 'Export' },
]

export default function EditorStepper({ hasFrame, hasArtwork, canExport }) {
  function goTo(stepId) {
    document.getElementById(stepId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const states = [
    hasFrame,
    hasArtwork,
    hasFrame && hasArtwork,
    canExport,
  ]

  const firstOpenIndex = states.findIndex((complete) => !complete)
  const currentIndex = firstOpenIndex === -1 ? STEPS.length - 1 : firstOpenIndex

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Workflow steps">
      {STEPS.map((step, index) => {
        const done = states[index]
        const isCurrent = index === currentIndex
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => goTo(step.id)}
            title={`${step.label} — ${done ? 'Done' : isCurrent ? 'Your next focus' : 'Jump to this step'}`}
            aria-current={isCurrent ? 'step' : undefined}
            className={`
              flex min-h-9 min-w-[4.5rem] items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition-colors duration-[var(--transition)]
              focus-visible:outline-none
              ${done
                ? 'border-[var(--accent)]/40 bg-[var(--accent-subtle)] text-[var(--accent)]'
                : isCurrent
                  ? 'border-[var(--accent)]/70 bg-[var(--accent-subtle)] text-[var(--text-primary)] ring-1 ring-[var(--accent)]/30'
                  : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]'
              }
            `}
          >
            <span className="tabular-nums opacity-80">{index + 1}.</span>
            <span className="ml-0.5">{step.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
