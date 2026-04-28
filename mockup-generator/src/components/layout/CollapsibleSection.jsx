import { ChevronDown } from 'lucide-react'
import StudioStepHeader from './StudioStepHeader'

export default function CollapsibleSection({
  id,
  title,
  summary,
  defaultOpen = true,
  children,
  step = null,
  stepActive = false,
  stepSubtitle,
}) {
  return (
    <details id={id} open={defaultOpen} className="editor-section-card group">
      {step != null ? (
        <div className="mb-3">
          <StudioStepHeader
            step={step}
            active={stepActive}
            title={title}
            subtitle={stepSubtitle ?? 'Canvas background behind the device'}
          />
        </div>
      ) : null}
      <summary className="flex cursor-pointer list-none items-start justify-between gap-2 rounded-md py-0.5 marker:hidden outline-none [&::-webkit-details-marker]:hidden focus-visible:rounded-lg">
        <div className="min-w-0 flex-1 text-left">
          {step == null ? (
            <>
              <span className="block text-[0.9375rem] font-semibold leading-snug text-[var(--text-primary)]">{title}</span>
              <span className="mt-1 block truncate text-xs leading-relaxed text-[var(--text-muted)]" title={summary}>
                {summary}
              </span>
            </>
          ) : (
            <span className="block truncate text-xs font-medium leading-relaxed text-[var(--text-secondary)]" title={summary}>
              {summary}
            </span>
          )}
        </div>
        <ChevronDown
          size={18}
          className="mt-0.5 shrink-0 text-[var(--text-muted)] transition-transform duration-[var(--transition)] group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-3 space-y-3 border-t border-[var(--border)] pt-3">{children}</div>
    </details>
  )
}
