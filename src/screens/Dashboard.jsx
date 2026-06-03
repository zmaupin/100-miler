import { Link } from 'react-router-dom'
import { useStravaData } from '../lib/useStravaData.js'
import { buildAuthorizeUrl } from '../lib/stravaAuth.js'
import { todayKey } from '../lib/calendar.js'
import { NextRace } from '../components/NextRace.jsx'
import { LifetimeStats } from '../components/LifetimeStats.jsx'
import { RecentActivities } from '../components/RecentActivities.jsx'

function Connect() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold tracking-tight">100 Mile Project</h1>
      <p className="mt-3 text-neutral-400">
        Connect Strava to begin. The app never asks you to log a run by hand.
      </p>
      <button
        type="button"
        onClick={() => {
          window.location.href = buildAuthorizeUrl()
        }}
        className="mt-6 rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white active:bg-orange-700"
      >
        Connect Strava
      </button>
    </main>
  )
}

function SyncBar({ syncing, lastSyncAt, error, onSync }) {
  return (
    <div className="flex items-center justify-between text-xs text-neutral-500">
      <span>
        {syncing
          ? 'Syncing…'
          : lastSyncAt
            ? `Synced ${new Date(lastSyncAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
            : 'Not synced yet'}
        {error && <span className="ml-2 text-red-400">· {error}</span>}
      </span>
      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        className="rounded border border-neutral-700 px-2 py-1 disabled:opacity-50"
      >
        Sync
      </button>
    </div>
  )
}

export default function Dashboard() {
  const { activities, lastSyncAt, syncing, error, runSync, connected } = useStravaData()
  if (!connected) return <Connect />

  const today = todayKey()

  return (
    <main className="mx-auto max-w-md space-y-4 p-4 pb-20">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">100 Mile Project</h1>
        <Link to="/progress" className="text-sm text-neutral-400 underline">
          Progress
        </Link>
      </header>

      <SyncBar syncing={syncing} lastSyncAt={lastSyncAt} error={error} onSync={runSync} />

      <NextRace activities={activities} today={today} />
      <LifetimeStats activities={activities} />
      <RecentActivities activities={activities} />

      <p className="pt-2 text-center text-xs text-neutral-600">
        Today · streak · this-week · weather · quit-fighter land next.
      </p>
    </main>
  )
}
