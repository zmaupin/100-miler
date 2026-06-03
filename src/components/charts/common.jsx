import { ResponsiveContainer } from 'recharts'
import { Panel, Label } from '../ui.jsx'

// Shared dark-theme chart styling, driven by the design tokens. De-cluttered:
// horizontal gridlines only, hairline lines, mono ticks.
export const AXIS = {
  stroke: 'var(--faint)',
  tick: { fontSize: 10, fill: 'var(--faint)', fontFamily: 'JetBrains Mono Variable, monospace' },
  tickLine: false,
  axisLine: { stroke: 'var(--line)' },
}

export const GRID = { stroke: 'var(--line)', strokeDasharray: '2 4', vertical: false }

export const TOOLTIP = {
  contentStyle: {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 10,
    fontSize: 12,
    color: 'var(--ink)',
  },
  labelStyle: { color: 'var(--faint)', fontFamily: 'JetBrains Mono Variable, monospace', fontSize: 11 },
  cursor: { fill: 'color-mix(in oklch, var(--ink) 6%, transparent)' },
}

// Chart entrance animation, off when the user prefers reduced motion.
export const CHART_ANIM =
  typeof window !== 'undefined'
    ? !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    : false

// "2026-06-01" -> "6/1"
export function shortAxisDate(key) {
  if (!key || typeof key !== 'string') return key
  const [, mo, d] = key.split('-')
  return `${Number(mo)}/${Number(d)}`
}

// Card chrome: title (left) + an optional headline readout (right), then the chart
// body, then a caption. The readout makes each chart a scannable HUD tile.
export function ChartCard({ title, value, unit, caption, empty, children }) {
  return (
    <Panel>
      <div className="flex items-baseline justify-between gap-3">
        <Label>{title}</Label>
        {value != null && (
          <span className="flex items-baseline gap-1">
            <span className="text-xl font-bold leading-none tnum text-ink">{value}</span>
            {unit && <span className="font-mono text-[0.625rem] text-faint">{unit}</span>}
          </span>
        )}
      </div>
      {empty ? (
        <p className="py-8 text-center text-sm text-faint">{empty}</p>
      ) : (
        <>
          {children}
          {caption && <p className="mt-2.5 text-xs leading-relaxed text-faint">{caption}</p>}
        </>
      )}
    </Panel>
  )
}

// A sized, responsive chart area with an optional sub-label (for multi-chart cards).
export function ChartBlock({ height = 200, label, children }) {
  return (
    <div className="mt-3">
      {label && <div className="label mb-1 text-faint">{label}</div>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  )
}
