// Refreshes an expired access token. Strava may ROTATE the refresh token, so the
// client must persist whatever comes back here (it does — see stravaAuth.js).

const TOKEN_URL = 'https://www.strava.com/oauth/token'

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' })

  let refresh_token
  try {
    ;({ refresh_token } = JSON.parse(event.body || '{}'))
  } catch {
    return json(400, { error: 'bad_json' })
  }
  if (!refresh_token) return json(400, { error: 'missing_refresh_token' })

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token',
      }),
    })
    const data = await res.json()
    if (!res.ok) return json(res.status, { error: 'strava_refresh_failed', detail: data })

    return json(200, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
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
