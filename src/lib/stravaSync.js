// Incremental sync. The two things that actually matter (per the spec): dedupe by
// id on every merge, and a cursor that trails the newest activity by a buffer so a
// backdated / late upload is never skipped. Rate limits are a non-issue for one
// athlete. Pure helpers are exported and unit-tested; the networked parts are thin.

import { getValidAccessToken } from './stravaAuth.js'
import { storage } from './storage.js'
import { ATHLETE } from './constants.js'

export const SYNC_INTERVAL_MS = 30 * 60 * 1000
export const CURSOR_BUFFER_DAYS = 7
const PER_PAGE = 200

// The trimmed shape we persist — never raw Strava objects (keeps a multi-year cache small).
const FIELDS = [
  'id',
  'name',
  'type',
  'start_date',
  'start_date_local',
  'distance',
  'moving_time',
  'elapsed_time',
  'total_elevation_gain',
  'average_heartrate',
  'max_heartrate',
  'average_speed',
  'suffer_score',
]

export function trimActivity(raw) {
  const out = {}
  for (const f of FIELDS) out[f] = raw[f] ?? null
  return out
}

// Merge incoming into existing, dedupe by id (incoming wins — it's fresher),
// return sorted oldest-first by start_date.
export function mergeActivities(existing, incoming) {
  const byId = new Map()
  for (const a of existing) byId.set(a.id, a)
  for (const a of incoming) byId.set(a.id, a)
  return [...byId.values()].sort((a, b) =>
    a.start_date < b.start_date ? -1 : a.start_date > b.start_date ? 1 : 0,
  )
}

// Unix seconds for the start of the training-start day (first-sync `after`).
export function initialAfter(trainingStart = ATHLETE.trainingStartDate) {
  return Math.floor(Date.parse(`${trainingStart}T00:00:00Z`) / 1000)
}

// Cursor = newest activity's start_date minus a buffer, so the next sync re-scans the
// recent window (cheap, thanks to dedupe) and catches anything uploaded late.
export function computeCursor(activities, fallback, bufferDays = CURSOR_BUFFER_DAYS) {
  if (!activities.length) return fallback
  const maxStart = Math.max(...activities.map((a) => Date.parse(a.start_date) / 1000))
  return Math.floor(maxStart - bufferDays * 86400)
}

export function shouldSync(lastSyncAt, now = Date.now()) {
  if (!lastSyncAt) return true
  return now - lastSyncAt >= SYNC_INTERVAL_MS
}

async function fetchActivityPage(after, page) {
  const token = await getValidAccessToken()
  const params = new URLSearchParams({
    after: String(after),
    page: String(page),
    per_page: String(PER_PAGE),
  })
  const res = await fetch(`/api/strava/activities?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`activities_fetch_failed_${res.status}`)
  return res.json()
}

// First sync paginates from the training start; later syncs paginate from the cursor.
// Either way we merge + dedupe, then advance the cursor and stamp lastSyncAt.
export async function syncActivities() {
  const existing = storage.get('activities') || []
  const after = storage.get('syncCursor') ?? initialAfter()

  const incoming = []
  for (let page = 1; ; page++) {
    const batch = await fetchActivityPage(after, page)
    for (const raw of batch) incoming.push(trimActivity(raw))
    if (batch.length < PER_PAGE) break
  }

  const merged = mergeActivities(existing, incoming)
  storage.set('activities', merged)
  storage.set('syncCursor', computeCursor(merged, initialAfter()))
  storage.set('lastSyncAt', Date.now())
  return merged
}
