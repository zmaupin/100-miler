// Proxies the Strava activities endpoint. Exists because Strava's API doesn't send
// CORS headers, so the browser can't call it directly. The access token is passed
// through from the client's Authorization header — never logged, never stored here.

const ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities'
const PER_PAGE = 200

export const handler = async (event) => {
  const auth = event.headers.authorization || event.headers.Authorization
  if (!auth) return json(401, { error: 'missing_token' })

  const { after, page, per_page } = event.queryStringParameters || {}
  const url = new URL(ACTIVITIES_URL)
  if (after) url.searchParams.set('after', after)
  url.searchParams.set('page', page || '1')
  url.searchParams.set('per_page', per_page || String(PER_PAGE))

  try {
    const res = await fetch(url, { headers: { Authorization: auth } })
    const data = await res.json()
    if (!res.ok) return json(res.status, { error: 'strava_activities_failed', detail: data })
    return json(200, data)
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
