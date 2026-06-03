import { Panel, Label } from './ui.jsx'
import { weekStreak, longestWeekStreak, currentWeekProgress } from '../lib/streak.js'
import { weeklyMileage } from '../lib/aggregates.js'
import { weekStartKey } from '../lib/calendar.js'
import { getPlan } from '../lib/profile.js'

// Merges the week-streak and this-week progress (they shared the same done/planned).
export function WeekStatus({ activities, today }) {
  const plan = getPlan()
  const weeks = weekStreak(activities, plan, today)
  const longest = longestWeekStreak(activities, plan, today)
  const { done, planned } = currentWeekProgress(activities, plan, today)
  const miles = weeklyMileage(activities, weekStartKey(today))

  const total = Math.max(planned, done) // overflow shown if you ran more than planned
  const dots = Array.from({ length: total }, (_, i) => i < done)

  return (
    <Panel>
      <div className="flex items-end justify-between">
        <div>
          <Label>Weeks on plan</Label>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-stat font-extrabold tnum leading-none text-accent">{weeks}</span>
            <span className="font-mono text-xs text-faint">streak</span>
          </div>
        </div>
        <div className="text-right font-mono text-[0.625rem] uppercase tracking-wide text-faint">
          Best <span className="tnum text-ink">{longest}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {dots.map((filled, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full ${filled ? 'bg-good' : 'border border-line'}`}
            />
          ))}
        </div>
        <div className="font-mono text-xs text-muted">
          <span className="tnum text-ink">{done}/{planned}</span> runs ·{' '}
          <span className="tnum text-ink">{miles.toFixed(1)}</span> mi
        </div>
      </div>
      <Label className="mt-2">This week</Label>
    </Panel>
  )
}
