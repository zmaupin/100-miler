import { useState } from 'react'
import { useStravaData } from '../lib/useStravaData.js'
import { buildAuthorizeUrl } from '../lib/stravaAuth.js'
import { todayKey } from '../lib/calendar.js'
import { LEVELS } from '../lib/constants.js'
import { getLevelId, setLevel } from '../lib/profile.js'
import { Shell } from '../components/Shell.jsx'
import { QuitFighter } from '../components/QuitFighter.jsx'
import { Today } from '../components/Today.jsx'
import { Weather } from '../components/Weather.jsx'
import { NextRace } from '../components/NextRace.jsx'
import { WeekStatus } from '../components/WeekStatus.jsx'
import { LifetimeStats } from '../components/LifetimeStats.jsx'
import { RecentActivities } from '../components/RecentActivities.jsx'
import { LevelManager } from '../components/LevelManager.jsx'

function Connect() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <span className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-[3px] bg-accent" />
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">100 Mile Project</span>
      </span>
      <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-ink">
        Build the base.
        <br />
        Don’t break the chain.
      </h1>
      <p className="mt-3 text-muted">
        Connect Strava to begin. The app never asks you to log a run by hand.
      </p>
      <button
        type="button"
        onClick={() => {
          window.location.href = buildAuthorizeUrl()
        }}
        className="mt-8 rounded-lg bg-accent py-3.5 font-bold text-white transition-transform duration-150 ease-out active:scale-[0.98]"
      >
        Connect Strava
      </button>
    </div>
  )
}

function SyncStatus({ syncing, lastSyncAt, error, onSync }) {
  const dot = error ? 'bg-bad' : syncing ? 'bg-warn' : 'bg-good'
  const text = error
    ? 'Sync failed · retry'
    : syncing
      ? 'Syncing'
      : lastSyncAt
        ? new Date(lastSyncAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : 'Sync'
  return (
    <button
      type="button"
      onClick={onSync}
      disabled={syncing}
      aria-live="polite"
      title={error ? 'Sync failed — tap to retry, or Reconnect in Settings' : 'Sync now'}
      className={`flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-wide transition-colors disabled:opacity-60 ${
        error ? 'text-bad' : 'text-faint hover:text-muted'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot} ${syncing ? 'animate-pulse' : ''}`} />
      {text}
    </button>
  )
}

// First-load placeholder so zeros don't flash before the first sync lands.
function Skeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl border border-line bg-surface" />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { activities, lastSyncAt, syncing, error, runSync, connected } = useStravaData()
  const [levelId, setLevelId] = useState(getLevelId)
  if (!connected) return <Connect />

  const today = todayKey()
  const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0]

  return (
    <Shell status={<SyncStatus syncing={syncing} lastSyncAt={lastSyncAt} error={error} onSync={runSync} />}>
      {activities.length === 0 && syncing ? (
        <Skeleton />
      ) : (
      <div className="space-y-4">
        <QuitFighter activities={activities} today={today} />
        <Today activities={activities} today={today} level={level} />
        <Weather />
        <NextRace activities={activities} today={today} />
        <WeekStatus activities={activities} today={today} />
        <LifetimeStats activities={activities} />
        <RecentActivities activities={activities} />
        <LevelManager
          levelId={levelId}
          onChangeLevel={(id) => {
            setLevel(id)
            setLevelId(id)
          }}
        />
      </div>
      )}
    </Shell>
  )
}
