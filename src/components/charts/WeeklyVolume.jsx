import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartCard, ChartBlock, AXIS, GRID, TOOLTIP, CHART_ANIM, shortAxisDate } from './common.jsx'
import { weeklyVolumeSeries } from '../../lib/charts.js'

const PHASE_COLOR = {
  1: 'var(--accent)',
  2: 'var(--phase-2)',
  3: 'var(--phase-3)',
  maintenance: 'var(--faint)',
}

// One card, two stacked bar charts (miles + elevation), last 16 weeks.
export function WeeklyVolume({ activities, today }) {
  const data = weeklyVolumeSeries(activities, today, 16)
  const thisWeek = data[data.length - 1]?.miles ?? 0

  return (
    <ChartCard
      title="Weekly Volume"
      value={thisWeek.toFixed(1)}
      unit="mi this wk"
      caption="Last 16 weeks, miles colored by phase."
    >
      <ChartBlock height={150} label="Miles">
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -8 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="weekStart" tickFormatter={shortAxisDate} minTickGap={16} {...AXIS} />
          <YAxis width={32} {...AXIS} />
          <Tooltip {...TOOLTIP} labelFormatter={shortAxisDate} formatter={(v) => `${Number(v).toFixed(1)} mi`} />
          <Bar dataKey="miles" radius={[2, 2, 0, 0]} isAnimationActive={CHART_ANIM}>
            {data.map((d, i) => (
              <Cell key={i} fill={PHASE_COLOR[d.phaseId] || 'var(--accent)'} />
            ))}
          </Bar>
        </BarChart>
      </ChartBlock>

      <ChartBlock height={120} label="Elevation (ft)">
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 4 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="weekStart" tickFormatter={shortAxisDate} minTickGap={16} {...AXIS} />
          <YAxis width={44} tickFormatter={(v) => Math.round(v).toLocaleString()} {...AXIS} />
          <Tooltip {...TOOLTIP} labelFormatter={shortAxisDate} formatter={(v) => `${Math.round(v).toLocaleString()} ft`} />
          <Bar dataKey="elevFt" fill="var(--good)" radius={[2, 2, 0, 0]} isAnimationActive={CHART_ANIM} />
        </BarChart>
      </ChartBlock>
    </ChartCard>
  )
}
