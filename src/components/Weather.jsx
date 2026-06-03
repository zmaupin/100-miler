import { useEffect, useState } from 'react'
import { fetchMorningForecast } from '../lib/weather.js'
import { addDays, todayKey } from '../lib/calendar.js'
import { Label } from './ui.jsx'

// Lowers the friction of deciding to run: tomorrow's 7 AM at the home trail.
export function Weather() {
  const [fc, setFc] = useState(null)

  useEffect(() => {
    let alive = true
    fetchMorningForecast(addDays(todayKey(), 1))
      .then((f) => alive && setFc(f))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (!fc) return null

  const note = fc.hot
    ? 'Hot — hydrate, go early.'
    : fc.wet
      ? 'Wet — trail’ll be greasy.'
      : 'Good morning to run.'

  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
      <div>
        <Label>Tomorrow · Chewacla · 7 AM</Label>
        <div className="mt-1 font-semibold text-ink">
          <span className="tnum">{Math.round(fc.tempF)}</span>°F{' '}
          <span className="font-normal text-muted">· {fc.condition}</span>
        </div>
      </div>
      <div className={`text-right text-sm ${fc.hot ? 'text-accent' : 'text-muted'}`}>{note}</div>
    </div>
  )
}
