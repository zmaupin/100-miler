import { Card } from './ui.jsx'
import { getNextRace, daysUntil } from '../lib/races.js'
import { longestRunMiles } from '../lib/aggregates.js'
import { formatShortDate } from '../lib/calendar.js'
import { FUTURE_LADDER } from '../lib/constants.js'

export function NextRace({ activities, today }) {
  const race = getNextRace(today)

  // End-of-plan fallback (full treatment is a later build step).
  if (!race) {
    return (
      <Card title="Next Goal">
        <div className="text-lg font-semibold text-neutral-100">{FUTURE_LADDER[0]}</div>
        <div className="text-sm text-neutral-500">Date TBD — pick the next rung.</div>
      </Card>
    )
  }

  const days = daysUntil(race.date, today)
  const longest = longestRunMiles(activities)
  const pct = Math.max(0, Math.min(100, (longest / race.distanceMi) * 100))

  return (
    <Card title="Next Race">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold leading-tight text-neutral-100">
            {race.name}
          </div>
          <div className="text-sm text-neutral-500">
            {formatShortDate(race.date)} · {race.distanceMi} mi · {race.surface}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-4xl font-bold leading-none tabular-nums text-orange-500">{days}</div>
          <div className="text-[11px] uppercase tracking-wide text-neutral-500">
            {days === 1 ? 'day' : 'days'} out
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>Longest run {longest.toFixed(1)} mi</span>
          <span>{race.distanceMi} mi</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full rounded-full bg-orange-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-3 text-sm text-neutral-400">
        Est. {race.estMin}–{race.estMax} min · {race.notes}
      </div>
    </Card>
  )
}
