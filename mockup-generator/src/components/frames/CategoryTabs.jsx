import { Smartphone, Tablet, Monitor, Watch } from 'lucide-react'

export default function CategoryTabs({ active, onChange }) {
  const tabs = [
    { id: 'mobile', label: 'Mobile', Icon: Smartphone },
    { id: 'tablet', label: 'Tablet', Icon: Tablet },
    { id: 'desktop', label: 'Desktop', Icon: Monitor },
    { id: 'watch', label: 'Watch', Icon: Watch }
  ]

  return (
    <div
      className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-1"
      role="tablist"
      aria-label="Device category"
    >
      {tabs.map((tab) => {
        const TabIcon = tab.Icon
        const isActive = active === tab.id

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-[var(--transition)]
              ${isActive
                ? 'border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm'
                : 'border border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }
            `}
          >
            <TabIcon size={14} strokeWidth={isActive ? 2.2 : 1.75} aria-hidden />
            <span className="truncate">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
