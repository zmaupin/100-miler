import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { ChartCard, AXIS, GRID, TOOLTIP, shortAxisDate } from './common.jsx'
import { cumulativeSeries } from '../../lib/charts.js'

const MILESTONES = [100, 250, 500]

// Two stacked single-axis charts (no dual-Y) — readable on a phone.
export function Cumulative({ activities }) {
  const data = cumulativeSeries(activities)
  if (data.length === 0) {
    return <ChartCard title="Cumulative Miles" empty="No activities yet — go run." />
  }
  const maxMiles = data[data.length - 1].miles
  const milestones = MILESTONES.filter((m) => m <= maxMiles)

  return (
    <>
      <ChartCard title="Cumulative Miles" height={180} caption="Since June 1">
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -8 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="date" tickFormatter={shortAxisDate} minTickGap={28} {...AXIS} />
          <YAxis width={36} {...AXIS} />
          <Tooltip
            {...TOOLTIP}
            labelFormatter={shortAxisDate}
            formatter={(v) => `${Number(v).toFixed(1)} mi`}
          />
          {milestones.map((m) => (
            <ReferenceLine
              key={m}
              y={m}
              stroke="#3f3f46"
              strokeDasharray="4 4"
              label={{ value: `${m}`, position: 'insideTopLeft', fill: '#71717a', fontSize: 10 }}
            />
          ))}
          <Line type="monotone" dataKey="miles" stroke="var(--accent)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Cumulative Elevation" height={160} caption="Feet climbed since June 1">
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 4 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="date" tickFormatter={shortAxisDate} minTickGap={28} {...AXIS} />
          <YAxis width={48} tickFormatter={(v) => Math.round(v).toLocaleString()} {...AXIS} />
          <Tooltip
            {...TOOLTIP}
            labelFormatter={shortAxisDate}
            formatter={(v) => `${Math.round(v).toLocaleString()} ft`}
          />
          <Line type="monotone" dataKey="elevFt" stroke="var(--good)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartCard>
    </>
  )
}
