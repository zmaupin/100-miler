import { useState } from 'react'
import { quitFighterStatus } from '../lib/quitfighter.js'
import { fullWeekday, formatShortDate } from '../lib/calendar.js'
import { totalMiles, totalElevationFeet } from '../lib/aggregates.js'
import { weekStreak } from '../lib/streak.js'
import { getPlan } from '../lib/profile.js'

// Renders ONLY when momentum is at risk. Silent when things are fine.
export function QuitFighter({ activities, today }) {
  const [nudged, setNudged] = useState(false)
  const { triggered, days, lastRunKey } = quitFighterStatus(activities, today)
  if (!triggered) return null

  const since = days <= 6 ? fullWeekday(lastRunKey) : formatShortDate(lastRunKey)
  const miles = Math.round(totalMiles(activities))
  const elev = Math.round(totalElevationFeet(activities)).toLocaleString()
  const weeks = weekStreak(activities, getPlan(), today)

  return (
    <section className="rounded-xl border border-orange-600/60 bg-orange-950/30 p-4">
      <p className="text-base font-semibold leading-snug text-orange-100">
        You’ve logged {miles} miles and climbed {elev} ft since June. Don’t let it go cold.
      </p>
      <p className="mt-2 text-sm text-orange-200/80">
        You haven’t run since {since} — {days} days.
      </p>
      {weeks > 0 && (
        <p className="text-sm text-orange-200/80">
          {weeks} {weeks === 1 ? 'week' : 'weeks'} on plan on the line.
        </p>
      )}

      <button
        type="button"
        onClick={() => setNudged(true)}
        className="mt-3 w-full rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white active:bg-orange-700"
      >
        MVD — just one mile keeps it alive
      </button>
      {nudged && (
        <p className="mt-2 text-center text-sm text-orange-200/90">
          Shoes on. Out the door. One mile. That’s the whole task.
        </p>
      )}
    </section>
  )
}
