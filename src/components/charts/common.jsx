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

// "2026-06-01" -> "6/1"
export function shortAxisDate(key) {
  if (!key || typeof key !== 'string') return key
  const [, mo, d] = key.split('-')
  return `${Number(mo)}/${Number(d)}`
}

export function ChartCard({ title, caption, height = 200, empty, children }) {
  return (
    <Panel>
      <Label>{title}</Label>
      {empty ? (
        <p className="py-8 text-center text-sm text-faint">{empty}</p>
      ) : (
        <>
          <div className="mt-3" style={{ width: '100%', height }}>
            <ResponsiveContainer>{children}</ResponsiveContainer>
          </div>
          {caption && <p className="mt-2.5 text-xs leading-relaxed text-faint">{caption}</p>}
        </>
      )}
    </Panel>
  )
}
