// Exchanges a Strava authorization code for tokens. The client secret lives only
// here (Netlify env), never in the frontend. Returns just what the client caches.

const TOKEN_URL = 'https://www.strava.com/oauth/token'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' })

  let code
  try {
    ;({ code } = JSON.parse(event.body || '{}'))
  } catch {
    return json(400, { error: 'bad_json' })
  }
  if (!code) return json(400, { error: 'missing_code' })

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })
    const data = await res.json()
    if (!res.ok) return json(res.status, { error: 'strava_exchange_failed', detail: data })

    // Single-user lock: when STRAVA_ALLOWED_ATHLETE_ID is set, only that athlete may
    // connect. Unset = open (so a missing env var never locks you out by accident).
    const allowed = process.env.STRAVA_ALLOWED_ATHLETE_ID
    if (allowed && String(data.athlete?.id) !== String(allowed)) {
      return json(403, { error: 'not_authorized' })
    }

    return json(200, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: data.athlete
        ? { id: data.athlete.id, firstname: data.athlete.firstname }
        : null,
    })
  } catch (e) {
    return json(502, { error: 'strava_unreachable', detail: String(e) })
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}
