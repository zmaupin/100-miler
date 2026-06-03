import { Link } from 'react-router-dom'
import { Panel, Label } from './ui.jsx'
import { getPhase, getTodaysPlan } from '../lib/plan.js'
import { formatShortDate, localDateKey } from '../lib/calendar.js'
import { getCurrentLevel } from '../lib/profile.js'
import { isMVD } from '../lib/activities.js'

const KIND_LABEL = { zone2: 'Zone 2 run', long: 'Long run', strength: 'Strength', rest: 'Rest' }

export function Today({ activities, today, level }) {
  const phase = getPhase(today)
  const lvl = level || getCurrentLevel()
  const plan = getTodaysPlan(today, phase, lvl)
  const logged = activities.some((a) => localDateKey(a) === today && isMVD(a))
  const isRun = plan.type === 'run'

  return (
    <Panel>
      <div className="flex items-start justify-between">
        <div>
          <Label>Today</Label>
          <div className="mt-1 text-xl font-bold tracking-tight text-ink">{formatShortDate(today)}</div>
          <div className="mt-0.5 font-mono text-xs text-faint">
            {phase.name} · L{lvl.id} {lvl.name}
          </div>
        </div>
        {logged && (
          <span className="rounded-full border border-good px-2 py-1 font-mono text-[0.625rem] uppercase tracking-wide text-good">
            ✓ Logged
          </span>
        )}
      </div>

      <div className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5">
        <div className={`label ${isRun ? 'text-accent' : 'text-faint'}`}>{KIND_LABEL[plan.kind] || 'Plan'}</div>
        <div className={`mt-0.5 font-semibold ${isRun ? 'text-ink' : 'text-muted'}`}>{plan.label}</div>
        {plan.type === 'strength' && (
          <Link
            to="/strength"
            className="mt-1.5 inline-block font-mono text-[0.625rem] uppercase tracking-wide text-accent"
          >
            Log strength →
          </Link>
        )}
      </div>

      <p className="mt-2.5 text-xs text-faint">Bad day? One mile counts.</p>
    </Panel>
  )
}
