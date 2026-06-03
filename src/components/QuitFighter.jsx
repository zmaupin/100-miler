import { useState } from 'react'
import { quitFighterStatus } from '../lib/quitfighter.js'
import { fullWeekday, formatShortDate } from '../lib/calendar.js'
import { totalMiles, totalElevationFeet } from '../lib/aggregates.js'
import { weekStreak } from '../lib/streak.js'
import { getPlan } from '../lib/profile.js'

// The one loud element. Renders only when momentum is at risk; otherwise silent.
export function QuitFighter({ activities, today }) {
  const [nudged, setNudged] = useState(false)
  const { triggered, days, lastRunKey } = quitFighterStatus(activities, today)
  if (!triggered) return null

  const since = days <= 6 ? fullWeekday(lastRunKey) : formatShortDate(lastRunKey)
  const miles = Math.round(totalMiles(activities))
  const elev = Math.round(totalElevationFeet(activities)).toLocaleString()
  const weeks = weekStreak(activities, getPlan(), today)

  return (
    <section
      className="animate-enter animate-attention mb-4 rounded-xl border border-accent p-4"
      style={{ background: 'color-mix(in oklch, var(--accent) 13%, var(--surface))' }}
    >
      <div className="label text-accent">Momentum at risk</div>
      <p className="mt-2 text-lg font-bold leading-snug text-ink">
        <span className="tnum">{miles}</span> miles, <span className="tnum">{elev}</span> ft since June. Don’t let it go cold.
      </p>
      <p className="mt-2 text-sm text-muted">
        No run since <span className="font-semibold text-ink">{since}</span> ·{' '}
        <span className="tnum">{days}</span> days
        {weeks > 0 && (
          <>
            {' '}· <span className="tnum text-ink">{weeks}</span> {weeks === 1 ? 'week' : 'weeks'} on plan on the line
          </>
        )}
      </p>
      <button
        type="button"
        onClick={() => setNudged(true)}
        className="mt-3 w-full rounded-lg bg-accent py-3 font-bold text-white transition-transform duration-150 ease-out active:scale-[0.98]"
      >
        MVD — one mile keeps it alive
      </button>
      {nudged && (
        <p className="mt-2 text-center text-sm font-medium text-accent">
          Shoes on. Out the door. One mile. That’s the whole task.
        </p>
      )}
    </section>
  )
}
