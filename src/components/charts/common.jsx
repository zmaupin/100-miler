import { ResponsiveContainer } from 'recharts'
import { Card } from '../ui.jsx'

// Shared dark-theme chart styling.
export const AXIS = {
  stroke: '#525252',
  tick: { fontSize: 11, fill: '#737373' },
  tickLine: false,
  axisLine: { stroke: '#262626' },
}

export const GRID = { stroke: '#1f1f1f', strokeDasharray: '3 3', vertical: false }

export const TOOLTIP = {
  contentStyle: {
    background: '#0a0a0a',
    border: '1px solid #404040',
    borderRadius: 8,
    fontSize: 12,
    color: '#e5e5e5',
  },
  labelStyle: { color: '#a3a3a3' },
  cursor: { fill: '#ffffff10' },
}

// "2026-06-01" -> "6/1"
export function shortAxisDate(key) {
  if (!key || typeof key !== 'string') return key
  const [, mo, d] = key.split('-')
  return `${Number(mo)}/${Number(d)}`
}

export function ChartCard({ title, caption, height = 200, empty, children }) {
  return (
    <Card title={title}>
      {empty ? (
        <p className="py-8 text-center text-sm text-neutral-500">{empty}</p>
      ) : (
        <>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>{children}</ResponsiveContainer>
          </div>
          {caption && <p className="mt-2 text-xs leading-relaxed text-neutral-500">{caption}</p>}
        </>
      )}
    </Card>
  )
}
