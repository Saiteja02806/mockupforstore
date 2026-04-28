import StudioStepHeader from './StudioStepHeader'

export default function EditorSection({
  id,
  title,
  subtitle,
  children,
  className = '',
  emphasis = false,
  step = null,
  stepActive = false,
}) {
  const cardClass = emphasis ? 'editor-section-card editor-section-card--emphasis' : 'editor-section-card'
  return (
    <section id={id} className={`${cardClass} space-y-4 ${className}`}>
      {step != null ? (
        <StudioStepHeader step={step} active={stepActive} title={title} subtitle={subtitle} />
      ) : (
        <header className="space-y-1.5">
          <h2 className="text-[0.9375rem] font-semibold leading-snug tracking-tight text-[var(--text-primary)]">{title}</h2>
          {subtitle ? (
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </header>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}
