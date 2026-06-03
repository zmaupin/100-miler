import { Link } from 'react-router-dom'
import { storage } from '../lib/storage.js'
import { isConnected } from '../lib/stravaAuth.js'
import { todayKey } from '../lib/calendar.js'
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

  return (
    <main className="mx-auto max-w-md space-y-4 p-4 pb-20">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Progress</h1>
        <Link to="/" className="text-sm text-neutral-400 underline">
          Dashboard
        </Link>
      </header>

      {!connected ? (
        <p className="text-sm text-neutral-500">Connect Strava on the dashboard first.</p>
      ) : (
        <>
          <AerobicEfficiency activities={activities} />
          <Cumulative activities={activities} />
          <WeeklyVolume activities={activities} today={today} />
          <LongRun activities={activities} today={today} />
          <Zone2Compliance activities={activities} today={today} />
        </>
      )}
    </main>
  )
}
