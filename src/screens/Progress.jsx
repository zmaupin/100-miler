import { storage } from '../lib/storage.js'
import { isConnected } from '../lib/stravaAuth.js'
import { todayKey } from '../lib/calendar.js'
import { Shell } from '../components/Shell.jsx'
import { Label } from '../components/ui.jsx'
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
      <Label className="mb-3">Progress</Label>
      <div className="space-y-4">
        <AerobicEfficiency activities={activities} />
        <Cumulative activities={activities} />
        <WeeklyVolume activities={activities} today={today} />
        <LongRun activities={activities} today={today} />
        <Zone2Compliance activities={activities} today={today} />
      </div>
    </Shell>
  )
}
