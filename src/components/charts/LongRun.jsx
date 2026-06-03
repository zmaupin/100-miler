import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { ChartCard, AXIS, GRID, TOOLTIP, shortAxisDate } from './common.jsx'
import { longRunProgressionSeries } from '../../lib/charts.js'
import { ATHLETE } from '../../lib/constants.js'

const RACE_LINES = [
  { y: 3.1, label: '5K' },
  { y: 9.3, label: '15K' },
  { y: 13.1, label: 'HM' },
]

// Hollow marker = Phase 1 distance estimated from time; filled = real distance.
function LongRunDot(props) {
  const { cx, cy, payload } = props
  if (cx == null || cy == null || payload?.miles == null) return null
  return payload.estimated ? (
    <circle cx={cx} cy={cy} r={3} fill="#0a0a0a" stroke="var(--accent)" strokeWidth={1.5} />
  ) : (
    <circle cx={cx} cy={cy} r={3} fill="var(--accent)" />
  )
}

export function LongRun({ activities, today }) {
  const data = longRunProgressionSeries(activities, ATHLETE.trainingStartDate, today)
  if (!data.some((d) => d.miles != null)) {
    return <ChartCard title="Long Run Progression" empty="No long runs yet." />
  }
  const maxMiles = Math.max(...data.map((d) => d.miles || 0))

  return (
    <ChartCard
      title="Long Run Progression"
      height={220}
      caption="Hollow points = Phase 1 distance estimated from time. Dashed lines = race distances."
    >
      <LineChart data={data} margin={{ top: 5, right: 16, bottom: 0, left: -8 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="weekStart" tickFormatter={shortAxisDate} minTickGap={20} {...AXIS} />
        <YAxis width={32} domain={[0, Math.max(14, Math.ceil(maxMiles))]} {...AXIS} />
        <Tooltip
          {...TOOLTIP}
          labelFormatter={shortAxisDate}
          formatter={(v) => (v == null ? '—' : `${Number(v).toFixed(1)} mi`)}
        />
        {RACE_LINES.map((r) => (
          <ReferenceLine
            key={r.label}
            y={r.y}
            stroke="#3f3f46"
            strokeDasharray="4 4"
            label={{ value: r.label, position: 'right', fill: '#71717a', fontSize: 10 }}
          />
        ))}
        <Line
          type="monotone"
          dataKey="miles"
          stroke="var(--accent)"
          strokeWidth={2}
          connectNulls
          dot={<LongRunDot />}
        />
      </LineChart>
    </ChartCard>
  )
}
