// Shared HUD primitives. Numbers are the interface: big, tabular, high-contrast.

export function Panel({ children, className = '', as: Tag = 'section' }) {
  return <Tag className={`rounded-xl border border-line bg-surface p-4 ${className}`}>{children}</Tag>
}

export function Label({ children, className = '' }) {
  return <div className={`label text-faint ${className}`}>{children}</div>
}

// Oversized metric: tabular number + small mono unit + mono label.
export function Metric({ value, unit, label, tone = 'ink', size = 'stat' }) {
  return (
    <div>
      <div
        className={`flex items-baseline gap-1 font-extrabold tnum leading-none ${
          tone === 'accent' ? 'text-accent' : 'text-ink'
        }`}
      >
        <span className={size === 'hero' ? 'text-hero' : 'text-stat'}>{value}</span>
        {unit && <span className="font-mono text-sm font-medium text-faint">{unit}</span>}
      </div>
      {label && <div className="label mt-1.5 text-faint">{label}</div>}
    </div>
  )
}

const ZONE = {
  in: { dot: 'bg-good', text: 'text-good', label: 'IN' },
  border: { dot: 'bg-warn', text: 'text-warn', label: 'EASY' },
  over: { dot: 'bg-bad', text: 'text-bad', label: 'OVER' },
  'no-data': { dot: 'bg-faint', text: 'text-faint', label: '—' },
}

// Zone 2 status carries a label, not color alone.
export function Zone2({ state, showText = true }) {
  const z = ZONE[state] || ZONE['no-data']
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${z.dot}`} />
      {showText && (
        <span className={`font-mono text-[0.625rem] font-medium tracking-wide ${z.text}`}>
          {z.label}
        </span>
      )}
    </span>
  )
}

export function ProgressBar({ pct, className = '' }) {
  const w = Math.max(0, Math.min(100, pct))
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-surface-2 ${className}`}>
      <div className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${w}%` }} />
    </div>
  )
}
