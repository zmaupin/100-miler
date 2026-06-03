import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartCard, ChartBlock, AXIS, GRID, TOOLTIP, CHART_ANIM, shortAxisDate } from './common.jsx'
import { aerobicEfficiencySeries } from '../../lib/aggregates.js'
import { attachTrend } from '../../lib/charts.js'
import { getZones } from '../../lib/profile.js'

// min/mile (numeric) -> "M:SS"
function fmtPace(p) {
  const m = Math.floor(p)
  const s = Math.round((p - m) * 60)
  return s === 60 ? `${m + 1}:00` : `${m}:${String(s).padStart(2, '0')}`
}

// The hero chart: pace at Zone 2 HR over time. Falling pace = aerobic base building.
export function AerobicEfficiency({ activities }) {
  const { min, max } = getZones()
  const base = aerobicEfficiencySeries(activities, min, max)
  const withPace = base.filter((d) => d.pace != null)

  if (withPace.length < 4) {
    return (
      <ChartCard
        title="Aerobic Efficiency"
        empty="Needs ~4 weeks of Zone 2 runs before the trend shows. Keep going."
      />
    )
  }

  const data = attachTrend(base, 'pace')
  const latest = withPace[withPace.length - 1].pace

  return (
    <ChartCard
      title="Aerobic Efficiency"
      value={fmtPace(latest)}
      unit="/mi"
      caption="Pace at Zone 2 HR, lower is faster. From each run’s average HR, so expect noise; trust the trend over months, not any single week."
    >
      <ChartBlock height={216}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -8 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="weekStart" tickFormatter={shortAxisDate} minTickGap={28} {...AXIS} />
          <YAxis width={36} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(1)} {...AXIS} />
          <Tooltip
            {...TOOLTIP}
            labelFormatter={shortAxisDate}
            formatter={(v) => (v == null ? '—' : `${fmtPace(Number(v))} /mi`)}
          />
          <Line
            type="monotone"
            dataKey="trend"
            name="Trend"
            stroke="var(--faint)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={CHART_ANIM}
          />
          <Line
            type="monotone"
            dataKey="pace"
            name="Pace"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={{ r: 2, fill: 'var(--accent)' }}
            connectNulls={false}
            isAnimationActive={CHART_ANIM}
          />
        </LineChart>
      </ChartBlock>
    </ChartCard>
  )
}
