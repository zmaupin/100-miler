import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { ChartCard, ChartBlock, AXIS, GRID, TOOLTIP, CHART_ANIM, shortAxisDate } from './common.jsx'
import { zone2ComplianceSeries } from '../../lib/charts.js'
import { getZones } from '../../lib/profile.js'

// Are you actually training easy? Green >= 80% goal, red below.
export function Zone2Compliance({ activities, today }) {
  const { min, max } = getZones()
  const data = zone2ComplianceSeries(activities, min, max, today, 16)
  const withPct = data.filter((d) => d.pct != null)
  if (withPct.length === 0) {
    return <ChartCard title="Zone 2 Compliance" empty="Needs runs with heart-rate data." />
  }
  const latest = Math.round(withPct[withPct.length - 1].pct)

  return (
    <ChartCard
      title="Zone 2 Compliance"
      value={latest}
      unit="% latest"
      caption="% of each week’s HR runs in Zone 2. Goal: 80%."
    >
      <ChartBlock height={176}>
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -16 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="weekStart" tickFormatter={shortAxisDate} minTickGap={16} {...AXIS} />
          <YAxis width={32} domain={[0, 100]} {...AXIS} />
          <Tooltip
            {...TOOLTIP}
            labelFormatter={shortAxisDate}
            formatter={(v) => (v == null ? '—' : `${Math.round(v)}%`)}
          />
          <ReferenceLine y={80} stroke="var(--faint)" strokeDasharray="4 4" />
          <Bar dataKey="pct" radius={[2, 2, 0, 0]} isAnimationActive={CHART_ANIM}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.pct == null ? 'transparent' : d.pct >= 80 ? 'var(--good)' : 'var(--bad)'} />
            ))}
          </Bar>
        </BarChart>
      </ChartBlock>
    </ChartCard>
  )
}
