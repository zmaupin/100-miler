import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { exchangeCode } from '../lib/stravaAuth.js'

// Strava redirects here with ?code & ?state. Exchange, then land on the dashboard.
export default function AuthCallback() {
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
    <main className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6">
      {error ? (
        <>
          <p className="text-bad">Couldn’t connect: {error}</p>
          <Link
            to="/"
            className="mt-4 inline-block font-mono text-xs uppercase tracking-wide text-faint underline"
          >
            Back
          </Link>
        </>
      ) : (
        <p className="flex items-center gap-2 text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          Connecting to Strava…
        </p>
      )}
    </main>
  )
}
