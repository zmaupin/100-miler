import { useEffect, useState } from 'react'
import { Card } from './ui.jsx'
import { fetchMorningForecast } from '../lib/weather.js'
import { addDays, todayKey } from '../lib/calendar.js'

// Lowers the friction of deciding to run: tomorrow's 7 AM at the home trail.
export function Weather() {
  const [fc, setFc] = useState(null)

  useEffect(() => {
    let alive = true
    fetchMorningForecast(addDays(todayKey(), 1))
      .then((f) => alive && setFc(f))
      .catch(() => {}) // non-critical — just don't render
    return () => {
      alive = false
    }
  }, [])

  if (!fc) return null // silent while loading or on failure

  const note = fc.hot
    ? 'Hot one tomorrow — hydrate, go early.'
    : fc.wet
      ? 'Wet start — the trail’ll be greasy.'
      : 'Good morning to run.'

  return (
    <Card title="Tomorrow Morning at Chewacla">
      <div className="text-sm text-neutral-200">
        7 AM: {Math.round(fc.tempF)}°F, {fc.condition}.
      </div>
      <div className={`mt-1 text-sm ${fc.hot ? 'text-orange-400' : 'text-neutral-400'}`}>{note}</div>
    </Card>
  )
}
