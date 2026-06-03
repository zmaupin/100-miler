import { Panel, Label, ProgressBar } from './ui.jsx'
import { getNextRace, daysUntil } from '../lib/races.js'
import { longestRunMiles } from '../lib/aggregates.js'
import { formatShortDate } from '../lib/calendar.js'
import { FUTURE_LADDER } from '../lib/constants.js'

export function NextRace({ activities, today }) {
  const race = getNextRace(today)

  if (!race) {
    return (
      <Panel>
        <Label>Next goal</Label>
        <div className="mt-1 text-lg font-bold text-ink">{FUTURE_LADDER[0]}</div>
        <div className="text-sm text-faint">Date TBD — pick the next rung.</div>
      </Panel>
    )
  }

  const days = daysUntil(race.date, today)
  const longest = longestRunMiles(activities)
  const pct = (longest / race.distanceMi) * 100

  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Label>Next race</Label>
          <div className="mt-1 truncate text-base font-bold text-ink">{race.name}</div>
          <div className="font-mono text-xs text-faint">
            {formatShortDate(race.date)} · {race.distanceMi} mi
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-stat font-extrabold tnum leading-none text-accent">{days}</div>
          <div className="label mt-1">{days === 1 ? 'day' : 'days'} out</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between font-mono text-[0.625rem] tracking-wide text-faint">
          <span>LONGEST {longest.toFixed(1)} MI</span>
          <span>{race.distanceMi} MI</span>
        </div>
        <ProgressBar pct={pct} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted">
        Est. {race.estMin}–{race.estMax} min · {race.notes}
      </p>
    </Panel>
  )
}
