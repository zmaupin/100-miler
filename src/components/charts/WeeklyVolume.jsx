import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartCard, AXIS, GRID, TOOLTIP, shortAxisDate } from './common.jsx'
import { weeklyVolumeSeries } from '../../lib/charts.js'

const PHASE_COLOR = { 1: 'var(--accent)', 2: '#38bdf8', 3: '#a78bfa', maintenance: '#737373' }

export function WeeklyVolume({ activities, today }) {
  const data = weeklyVolumeSeries(activities, today, 16)

  return (
    <>
      <ChartCard
        title="Weekly Volume"
        height={180}
        caption="Miles per week (last 16), colored by phase"
      >
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -8 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="weekStart" tickFormatter={shortAxisDate} minTickGap={16} {...AXIS} />
          <YAxis width={32} {...AXIS} />
          <Tooltip
            {...TOOLTIP}
            labelFormatter={shortAxisDate}
            formatter={(v) => `${Number(v).toFixed(1)} mi`}
          />
          <Bar dataKey="miles" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={PHASE_COLOR[d.phaseId] || 'var(--accent)'} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      <ChartCard title="Weekly Elevation" height={150} caption="Feet climbed per week">
        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 4 }}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="weekStart" tickFormatter={shortAxisDate} minTickGap={16} {...AXIS} />
          <YAxis width={44} tickFormatter={(v) => Math.round(v).toLocaleString()} {...AXIS} />
          <Tooltip
            {...TOOLTIP}
            labelFormatter={shortAxisDate}
            formatter={(v) => `${Math.round(v).toLocaleString()} ft`}
          />
          <Bar dataKey="elevFt" fill="var(--good)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartCard>
    </>
  )
}
