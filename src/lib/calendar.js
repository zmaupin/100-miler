// ALL calendar logic derives from start_date_local.
//
// Strava quirk: start_date_local is the activity's WALL-CLOCK local time, formatted
// as ISO 8601 but suffixed with "Z". Parsing it with `new Date()` would treat it as
// UTC and shift it into the host's timezone, turning a 6 AM Saturday run into Friday
// or Sunday depending on offset — silently breaking long-run detection and streaks.
// So we parse Y/M/D/H/M components directly from the string and never let the host
// timezone interfere. Day-of-week is derived via a UTC noon anchor for stability.

import { isRunType } from './activities.js'

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/

function pad(n, w = 2) {
  return String(n).padStart(w, '0')
}

export function localParts(activityOrString) {
  const s =
    typeof activityOrString === 'string'
      ? activityOrString
      : activityOrString?.start_date_local
  const m = LOCAL_RE.exec(s || '')
  if (!m) return null
  return { y: +m[1], mo: +m[2], d: +m[3], hh: +m[4], mm: +m[5] }
}

// "YYYY-MM-DD" key for an activity's local date.
export function localDateKey(activity) {
  const p = localParts(activity)
  if (!p) return null
  return `${pad(p.y, 4)}-${pad(p.mo)}-${pad(p.d)}`
}

// 0=Sun..6=Sat for a "YYYY-MM-DD" key (host-tz independent).
export function dowOfKey(key) {
  const [y, mo, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, mo - 1, d, 12)).getUTCDay()
}

// 0=Sun..6=Sat for an activity, from its local date.
export function localDay(activity) {
  const key = localDateKey(activity)
  return key == null ? null : dowOfKey(key)
}

// Add n days to a "YYYY-MM-DD" key, returning a key.
export function addDays(key, n) {
  const [y, mo, d] = key.split('-').map(Number)
  const dt = new Date(Date.UTC(y, mo - 1, d) + n * 86400000)
  return `${pad(dt.getUTCFullYear(), 4)}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`
}

// Integer day index for a key, for O(1) day diffs.
export function keyDayNumber(key) {
  const [y, mo, d] = key.split('-').map(Number)
  return Math.floor(Date.UTC(y, mo - 1, d) / 86400000)
}

export function diffDays(aKey, bKey) {
  return keyDayNumber(aKey) - keyDayNumber(bKey)
}

// Monday-start week key ("YYYY-MM-DD" of that week's Monday).
export function weekStartKey(key) {
  const dow = dowOfKey(key) // 0=Sun..6=Sat
  const offset = (dow + 6) % 7 // Mon->0, Tue->1, ... Sun->6
  return addDays(key, -offset)
}

export function sameLocalDay(a, b) {
  return localDateKey(a) === localDateKey(b)
}

// "today" as a key from a Date (defaults to now, host-local — the athlete's phone).
export function todayKey(now = new Date()) {
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Runs only. Days from the most recent run's local date to `today`.
// Infinity if there are no runs yet. Hikes/walks do NOT reset it — this is a
// run-momentum guard for the quit-fighter.
export function daysSinceLastRun(activities, today = todayKey()) {
  const runKeys = activities
    .filter(isRunType)
    .map(localDateKey)
    .filter(Boolean)
    .sort()
  if (runKeys.length === 0) return Infinity
  return diffDays(today, runKeys[runKeys.length - 1])
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// "Sat, Jun 6" from an activity or a key — built from parts, so no tz drift.
export function formatShortDate(activityOrKey) {
  const key = typeof activityOrKey === 'string' ? activityOrKey : localDateKey(activityOrKey)
  if (!key) return ''
  const [, mo, d] = key.split('-').map(Number)
  return `${DOW[dowOfKey(key)]}, ${MONTHS[mo - 1]} ${d}`
}
