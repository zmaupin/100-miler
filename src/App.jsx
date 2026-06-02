import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { buildAuthorizeUrl, exchangeCode } from './lib/stravaAuth.js'
import { useStravaData } from './lib/useStravaData.js'

// Pre-connect empty state.
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

// Minimal dashboard shell — proves OAuth + sync end to end. Real sections land next.
function Dashboard() {
  const { activities, lastSyncAt, syncing, error, runSync, connected } = useStravaData()
  if (!connected) return <Connect />

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">100 Mile Project</h1>
        <Link to="/progress" className="text-sm text-neutral-400 underline">
          Progress
        </Link>
      </header>

      <p className="mt-3 text-sm text-neutral-400">
        {activities.length} activities cached
        {syncing
          ? ' · syncing…'
          : lastSyncAt
            ? ` · last sync ${new Date(lastSyncAt).toLocaleTimeString()}`
            : ''}
      </p>
      {error && <p className="mt-2 text-sm text-red-400">Sync error: {error}</p>}

      <button
        type="button"
        onClick={runSync}
        disabled={syncing}
        className="mt-4 rounded-lg border border-neutral-700 px-3 py-2 text-sm disabled:opacity-50"
      >
        Sync
      </button>

      <p className="mt-8 text-xs text-neutral-600">Dashboard sections come online next.</p>
    </main>
  )
}

// Strava redirects here with ?code & ?state. Exchange, then land on the dashboard.
function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const denied = params.get('error')
    if (denied) {
      setError(denied)
      return
    }
    const code = params.get('code')
    const state = params.get('state')
    if (!code) {
      setError('missing_code')
      return
    }
    exchangeCode(code, state)
      .then(() => navigate('/', { replace: true }))
      .catch((e) => setError(e?.message || 'exchange_failed'))
  }, [params, navigate])

  return (
    <main className="mx-auto max-w-md p-6">
      {error ? (
        <>
          <p className="text-red-400">Couldn’t connect: {error}</p>
          <Link to="/" className="mt-4 inline-block text-sm text-neutral-400 underline">
            Back
          </Link>
        </>
      ) : (
        <p className="text-neutral-400">Connecting to Strava…</p>
      )}
    </main>
  )
}

function Progress() {
  return (
    <main className="mx-auto max-w-md p-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <Link to="/" className="text-sm text-neutral-400 underline">
          Dashboard
        </Link>
      </header>
      <p className="mt-3 text-sm text-neutral-500">Charts come online next.</p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
