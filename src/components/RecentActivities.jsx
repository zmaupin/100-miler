import { useState } from 'react'
import { Panel, Label, Zone2 } from './ui.jsx'
import { formatShortDate } from '../lib/calendar.js'
import { metersToMiles, metersToFeet, mpsToMinPerMile, secondsToClock } from '../lib/conversions.js'
import { zone2Compliance } from '../lib/hr.js'
import { getNote, setNote } from '../lib/notes.js'
import { ATHLETE } from '../lib/constants.js'

export function RecentActivities({ activities }) {
  const recent = [...activities]
    .sort((a, b) => (a.start_date < b.start_date ? 1 : -1))
    .slice(0, 5)

  return (
    <Panel className="p-0">
      <div className="px-4 pt-4">
        <Label>Recent</Label>
      </div>
      {recent.length === 0 ? (
        <p className="px-4 pb-4 pt-2 text-sm text-faint">No activities yet — go run.</p>
      ) : (
        <ul className="mt-1 divide-y divide-line">
          {recent.map((a) => (
            <ActivityRow key={a.id} a={a} />
          ))}
        </ul>
      )}
    </Panel>
  )
}

function ActivityRow({ a }) {
  const [open, setOpen] = useState(false)
  const [note, setNoteState] = useState(() => getNote(a.id))

  const miles = metersToMiles(a.distance)
  const zone = zone2Compliance(a.average_heartrate, ATHLETE.zone2Min, ATHLETE.zone2Max)

  return (
    <li className="px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium text-ink">{a.name}</div>
          <div className="font-mono text-[0.625rem] uppercase tracking-wide text-faint">
            {formatShortDate(a)} · {a.type}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-semibold tnum text-ink">
            {miles.toFixed(1)} <span className="text-xs font-normal text-faint">mi</span>
          </div>
          <div className="font-mono text-[0.625rem] tnum text-faint">
            {secondsToClock(a.moving_time)} · {mpsToMinPerMile(a.average_speed)}/mi
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Zone2 state={zone} />
          <span className="font-mono text-[0.625rem] uppercase tracking-wide text-faint">
            {a.average_heartrate ? `${Math.round(a.average_heartrate)} bpm` : 'no hr'} ·{' '}
            {Math.round(metersToFeet(a.total_elevation_gain))} ft
          </span>
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-mono text-[0.625rem] uppercase tracking-wide text-faint transition-colors hover:text-muted"
        >
          {note && !open ? 'Note ✓' : open ? 'Close' : 'Note'}
        </button>
      </div>

      {open && (
        <textarea
          value={note}
          onChange={(e) => {
            setNoteState(e.target.value)
            setNote(a.id, e.target.value)
          }}
          placeholder="How did it feel?"
          rows={2}
          className="mt-2 w-full resize-none rounded-lg border border-line bg-surface-2 p-2 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
        />
      )}
    </li>
  )
}
