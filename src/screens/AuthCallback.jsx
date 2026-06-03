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
