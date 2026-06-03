// Pure data shaping for the Progress charts. Everything here is testable without a
// DOM; the chart components just render what these return.

import { weekStartKey, localDateKey, addDays, todayKey } from './calendar.js'
import { metersToMiles, metersToFeet } from './conversions.js'
import { isRunType } from './activities.js'
import { isZone2 } from './hr.js'
import { getPhase } from './plan.js'
import { longRunOfWeek } from './longrun.js'
import { estimateDistanceFromTime } from './aggregates.js'

// Inclusive list of Monday keys spanning two dates.
export function weeksBetween(startKey, endKey) {
  const out = []
  const last = weekStartKey(endKey)
  for (let wk = weekStartKey(startKey); wk <= last; wk = addDays(wk, 7)) out.push(wk)
  return out
}

// The most recent n Monday keys, oldest first, ending at today's week.
export function lastNWeeks(n, today = todayKey()) {
  const end = weekStartKey(today)
  const out = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -7 * i))
  return out
}

function groupByWeek(activities) {
  const m = new Map()
  for (const a of activities) {
    const k = localDateKey(a)
    if (!k) continue
    const wk = weekStartKey(k)
    if (!m.has(wk)) m.set(wk, [])
    m.get(wk).push(a)
  }
  return m
}

// Running totals over time (one point per activity, oldest first).
export function cumulativeSeries(activities) {
  const sorted = [...activities]
    .filter((a) => localDateKey(a))
    .sort((a, b) => (a.start_date < b.start_date ? -1 : 1))
  let miles = 0
  let elevFt = 0
  return sorted.map((a) => {
    miles += metersToMiles(a.distance)
    elevFt += metersToFeet(a.total_elevation_gain)
    return { date: localDateKey(a), miles, elevFt }
  })
}

// Per-week miles + elevation for the last n weeks, tagged with the phase (for color).
export function weeklyVolumeSeries(activities, today = todayKey(), n = 16) {
  const byWeek = groupByWeek(activities)
  return lastNWeeks(n, today).map((wk) => {
    const acts = byWeek.get(wk) || []
    return {
      weekStart: wk,
      miles: acts.reduce((s, a) => s + metersToMiles(a.distance), 0),
      elevFt: acts.reduce((s, a) => s + metersToFeet(a.total_elevation_gain), 0),
      phaseId: getPhase(wk).id,
    }
  })
}

// The week's long run as distance. Phase 1 is time-based, so distance is ESTIMATED
// from moving time (flagged for hollow markers); later phases use real distance.
export function longRunProgressionSeries(activities, startKey, today = todayKey()) {
  const byWeek = groupByWeek(activities)
  return weeksBetween(startKey, today).map((wk) => {
    const phase = getPhase(wk)
    const lr = longRunOfWeek(byWeek.get(wk) || [], phase)
    if (!lr) return { weekStart: wk, miles: null, estimated: false }
    const timeBased = phase.longRunThresholdMin != null
    const miles = timeBased
      ? estimateDistanceFromTime(lr.moving_time / 60)
      : metersToMiles(lr.distance)
    return { weekStart: wk, miles, estimated: timeBased }
  })
}

// Weekly % of HR-bearing runs in Zone 2, last n weeks. null when no HR runs that week.
export function zone2ComplianceSeries(activities, min, max, today = todayKey(), n = 16) {
  const byWeek = groupByWeek(activities)
  return lastNWeeks(n, today).map((wk) => {
    const withHR = (byWeek.get(wk) || []).filter(
      (a) => isRunType(a) && a.average_heartrate != null,
    )
    const pct = withHR.length
      ? (withHR.filter((a) => isZone2(a.average_heartrate, min, max)).length / withHR.length) * 100
      : null
    return { weekStart: wk, pct }
  })
}

// Attach a least-squares trend value per point, fit over the non-null values.
export function attachTrend(series, key = 'pace') {
  const pts = series.map((d, i) => ({ x: i, y: d[key] })).filter((p) => p.y != null)
  if (pts.length < 2) return series.map((d) => ({ ...d, trend: null }))
  const n = pts.length
  const sx = pts.reduce((s, p) => s + p.x, 0)
  const sy = pts.reduce((s, p) => s + p.y, 0)
  const sxx = pts.reduce((s, p) => s + p.x * p.x, 0)
  const sxy = pts.reduce((s, p) => s + p.x * p.y, 0)
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  const intercept = (sy - slope * sx) / n
  return series.map((d, i) => ({ ...d, trend: intercept + slope * i }))
}
