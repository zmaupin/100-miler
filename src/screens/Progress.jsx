import { storage } from '../lib/storage.js'
import { isConnected } from '../lib/stravaAuth.js'
import { todayKey } from '../lib/calendar.js'
import { Shell } from '../components/Shell.jsx'
import { AerobicEfficiency } from '../components/charts/AerobicEfficiency.jsx'
import { Cumulative } from '../components/charts/Cumulative.jsx'
import { WeeklyVolume } from '../components/charts/WeeklyVolume.jsx'
import { LongRun } from '../components/charts/LongRun.jsx'
import { Zone2Compliance } from '../components/charts/Zone2Compliance.jsx'

export default function Progress() {
  const connected = isConnected()
  // Read cached activities directly — navigating between screens never refetches.
  const activities = storage.get('activities') || []
  const today = todayKey()

  if (!connected) {
    return (
      <Shell>
        <p className="text-sm text-faint">Connect Strava on the dashboard first.</p>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-ink">Progress</h1>
        <p className="mt-0.5 text-sm text-faint">Proof the work is working.</p>
      </div>
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <AerobicEfficiency activities={activities} />
        </div>
        <Cumulative activities={activities} />
        <WeeklyVolume activities={activities} today={today} />
        <LongRun activities={activities} today={today} />
        <Zone2Compliance activities={activities} today={today} />
      </div>
    </Shell>
  )
}
