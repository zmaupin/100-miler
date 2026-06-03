import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartCard, AXIS, GRID, TOOLTIP, shortAxisDate } from './common.jsx'
import { aerobicEfficiencySeries } from '../../lib/aggregates.js'
import { attachTrend } from '../../lib/charts.js'
import { getZones } from '../../lib/profile.js'

// The hero chart: pace at Zone 2 HR over time. Falling pace = aerobic base building.
export function AerobicEfficiency({ activities }) {
  const { min, max } = getZones()
  const base = aerobicEfficiencySeries(activities, min, max)
  const points = base.filter((d) => d.pace != null).length

  if (points < 4) {
    return (
      <ChartCard
        title="Aerobic Efficiency"
        empty="Needs ~4 weeks of Zone 2 runs before the trend shows. Keep going."
      />
    )
  }

  const data = attachTrend(base, 'pace')

  return (
    <ChartCard
      title="Aerobic Efficiency"
      height={220}
      caption="Pace at Zone 2 HR — lower is faster. Based on each run’s average HR, so expect noise; trust the trend over months, not any single week."
    >
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -8 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="weekStart" tickFormatter={shortAxisDate} minTickGap={28} {...AXIS} />
        <YAxis width={36} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(1)} {...AXIS} />
        <Tooltip
          {...TOOLTIP}
          labelFormatter={shortAxisDate}
          formatter={(v) => (v == null ? '—' : `${Number(v).toFixed(2)} min/mi`)}
        />
        <Line
          type="monotone"
          dataKey="pace"
          name="Pace"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ r: 2, fill: 'var(--accent)' }}
          connectNulls={false}
        />
        <Line
          type="monotone"
          dataKey="trend"
          name="Trend"
          stroke="#737373"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
        />
      </LineChart>
    </ChartCard>
  )
}
