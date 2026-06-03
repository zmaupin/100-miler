// Strava OAuth on the client. The Client ID is public; the secret never touches
// the frontend (the /api/strava/* functions hold it). Tokens live in localStorage —
// an accepted tradeoff for a single-user app (see the spec's security note).

import { storage } from './storage.js'

const AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize'
const SCOPE = 'activity:read_all'
const REFRESH_SKEW_SEC = 120 // refresh slightly before actual expiry

// Public identifier. Overridable via env for a separate prod app.
const CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || '254626'

// Derived from the current origin so it auto-adapts to localhost vs the deployed
// domain — the only requirement is that the domain is registered with the Strava app.
export function redirectUri() {
  return `${window.location.origin}/auth/callback`
}

export function buildAuthorizeUrl() {
  const state = crypto.randomUUID()
  storage.set('oauth_state', state)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: SCOPE,
    approval_prompt: 'auto',
    state,
  })
  return `${AUTHORIZE_URL}?${params}`
}

export async function exchangeCode(code, returnedState) {
  // CSRF: the state we sent must come back unchanged.
  const expected = storage.get('oauth_state')
  if (!returnedState || returnedState !== expected) throw new Error('oauth_state_mismatch')
  storage.remove('oauth_state')

  const res = await fetch('/api/strava/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'exchange_failed')
  }
  const tok = await res.json()
  saveTokens(tok)
  if (tok.athlete) storage.set('athlete', tok.athlete)
  return tok
}

function saveTokens({ access_token, refresh_token, expires_at }) {
  storage.set('strava_access_token', access_token)
  storage.set('strava_refresh_token', refresh_token)
  storage.set('strava_token_expires_at', expires_at)
}

// Single-flight refresh: concurrent callers (app-load sync + manual sync) await the
// SAME refresh rather than each firing one, which would let Strava's rotation
// invalidate the others.
let refreshPromise = null

export async function getValidAccessToken() {
  const access = storage.get('strava_access_token')
  const expiresAt = storage.get('strava_token_expires_at')
  if (access && expiresAt && nowSec() < expiresAt - REFRESH_SKEW_SEC) return access

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

async function refreshAccessToken() {
  const refresh_token = storage.get('strava_refresh_token')
  if (!refresh_token) throw new Error('not_connected')

  const res = await fetch('/api/strava/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  })
  if (!res.ok) throw new Error('refresh_failed')
  const tok = await res.json()
  saveTokens(tok) // persist the (possibly rotated) refresh token
  return tok.access_token
}

export function isConnected() {
  return !!storage.get('strava_refresh_token')
}

export function disconnect() {
  for (const k of ['strava_access_token', 'strava_refresh_token', 'strava_token_expires_at', 'athlete']) {
    storage.remove(k)
  }
}

function nowSec() {
  return Math.floor(Date.now() / 1000)
}
