import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { ChartCard, AXIS, GRID, TOOLTIP, shortAxisDate } from './common.jsx'
import { zone2ComplianceSeries } from '../../lib/charts.js'
import { ATHLETE } from '../../lib/constants.js'

// Are you actually training easy? Green >= 80% goal, red below.
export function Zone2Compliance({ activities, today }) {
  const data = zone2ComplianceSeries(activities, ATHLETE.zone2Min, ATHLETE.zone2Max, today, 16)
  if (!data.some((d) => d.pct != null)) {
    return <ChartCard title="Zone 2 Compliance" empty="Needs runs with heart-rate data." />
  }

  return (
    <ChartCard
      title="Zone 2 Compliance"
      height={180}
      caption="% of each week’s HR runs in Zone 2. Goal: 80%."
    >
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -16 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="weekStart" tickFormatter={shortAxisDate} minTickGap={16} {...AXIS} />
        <YAxis width={32} domain={[0, 100]} {...AXIS} />
        <Tooltip
          {...TOOLTIP}
          labelFormatter={shortAxisDate}
          formatter={(v) => (v == null ? '—' : `${Math.round(v)}%`)}
        />
        <ReferenceLine y={80} stroke="#52525b" strokeDasharray="4 4" />
        <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.pct == null ? 'transparent' : d.pct >= 80 ? 'var(--good)' : 'var(--bad)'} />
          ))}
        </Bar>
      </BarChart>
    </ChartCard>
  )
}
