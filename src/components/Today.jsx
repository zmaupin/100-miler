import { Card } from './ui.jsx'
import { getPhase, getTodaysPlan } from '../lib/plan.js'
import { formatShortDate, localDateKey } from '../lib/calendar.js'
import { getCurrentLevel } from '../lib/profile.js'
import { isMVD } from '../lib/activities.js'

export function Today({ activities, today }) {
  const phase = getPhase(today)
  const level = getCurrentLevel()
  const plan = getTodaysPlan(today, phase, level)
  const loggedToday = activities.some((a) => localDateKey(a) === today && isMVD(a))

  return (
    <Card title="Today">
      <div className="flex items-baseline justify-between">
        <div className="text-lg font-semibold text-neutral-100">{formatShortDate(today)}</div>
        {loggedToday && <span className="text-xs font-medium text-green-500">logged ✓</span>}
      </div>
      <div className="text-sm text-neutral-500">
        {phase.name} · Level {level.id} {level.name}
      </div>

      <div className="mt-3 rounded-lg bg-neutral-800/50 px-3 py-2">
        <div className="text-[11px] uppercase tracking-wide text-neutral-500">Plan</div>
        <div
          className={`font-medium ${plan.type === 'run' ? 'text-orange-400' : 'text-neutral-200'}`}
        >
          {plan.label}
        </div>
      </div>

      <p className="mt-2 text-xs text-neutral-500">Bad day? One mile counts.</p>
    </Card>
  )
}
