import { useState } from 'react'
import { Card, Zone2Dot } from './ui.jsx'
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
    <Card title="Recent">
      {recent.length === 0 ? (
        <p className="text-sm text-neutral-500">No activities yet — go run.</p>
      ) : (
        <ul className="-my-3 divide-y divide-neutral-800">
          {recent.map((a) => (
            <ActivityRow key={a.id} a={a} />
          ))}
        </ul>
      )}
    </Card>
  )
}

function ActivityRow({ a }) {
  const [open, setOpen] = useState(false)
  const [note, setNoteState] = useState(() => getNote(a.id))

  const miles = metersToMiles(a.distance)
  const elev = metersToFeet(a.total_elevation_gain)
  const zone = zone2Compliance(a.average_heartrate, ATHLETE.zone2Min, ATHLETE.zone2Max)

  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium text-neutral-100">{a.name}</div>
          <div className="text-xs text-neutral-500">
            {formatShortDate(a)} · {a.type}
          </div>
        </div>
        <div className="shrink-0 text-right text-sm tabular-nums text-neutral-300">
          {miles.toFixed(1)} mi · {secondsToClock(a.moving_time)}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <Zone2Dot state={zone} />
          {a.average_heartrate ? `${Math.round(a.average_heartrate)} bpm` : 'no HR'}
          <span className="text-neutral-700">·</span>
          {mpsToMinPerMile(a.average_speed)}/mi
          <span className="text-neutral-700">·</span>
          {Math.round(elev)} ft
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-neutral-400 underline-offset-2 hover:underline"
        >
          {note && !open ? 'note ✓' : open ? 'close' : 'note'}
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
          className="mt-2 w-full resize-none rounded-lg border border-neutral-800 bg-neutral-950 p-2 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
        />
      )}
    </li>
  )
}
