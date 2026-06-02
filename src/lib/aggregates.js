// Lifetime + windowed aggregates and the chart series.

import { metersToMiles, metersToFeet, METERS_PER_MILE } from './conversions.js'
import { isRunType } from './activities.js'
import { isZone2 } from './hr.js'
import { weekStartKey, localDateKey, addDays } from './calendar.js'

export function totalMiles(activities) {
  return activities.reduce((s, a) => s + metersToMiles(a.distance), 0)
}

export function totalElevationFeet(activities) {
  return activities.reduce((s, a) => s + metersToFeet(a.total_elevation_gain), 0)
}

export function totalTimeHours(activities) {
  return activities.reduce((s, a) => s + (a.moving_time || 0), 0) / 3600
}

export function weeklyMileage(activities, weekStartK) {
  return activities
    .filter((a) => {
      const k = localDateKey(a)
      return k != null && weekStartKey(k) === weekStartK
    })
    .reduce((s, a) => s + metersToMiles(a.distance), 0)
}

// % of that week's runs (with HR data) whose avg HR is in Zone 2. null if no HR runs.
// Runs without HR are excluded from the denominator rather than counted as failures.
export function zone2ComplianceRate(weekActs, min, max) {
  const withHR = weekActs.filter((a) => isRunType(a) && a.average_heartrate != null)
  if (withHR.length === 0) return null
  const inZone = withHR.filter((a) => isZone2(a.average_heartrate, min, max)).length
  return (inZone / withHR.length) * 100
}

// Phase 1 long runs are time-based; the long-run chart axis is distance. Estimate
// distance from moving time at a conservative trail pace (~15 min/mi). Mark these
// points as estimated in the UI.
export function estimateDistanceFromTime(minutes) {
  return minutes / 15
}

// Weekly avg pace (min/mile, numeric) for Zone 2 runs with HR + speed. Returns a
// continuous weekly series with null gaps for weeks that had no qualifying run, so
// the trend line doesn't fabricate a straight segment across empty weeks.
export function aerobicEfficiencySeries(activities, min, max) {
  const byWeek = new Map()
  for (const a of activities) {
    if (!isRunType(a) || a.average_heartrate == null) continue
    if (!isZone2(a.average_heartrate, min, max)) continue
    if (!a.average_speed || a.average_speed <= 0) continue
    const k = localDateKey(a)
    if (!k) continue
    const wk = weekStartKey(k)
    const paceMinPerMile = METERS_PER_MILE / a.average_speed / 60
    const e = byWeek.get(wk) || { sum: 0, n: 0 }
    e.sum += paceMinPerMile
    e.n += 1
    byWeek.set(wk, e)
  }
  if (byWeek.size === 0) return []

  const weeks = [...byWeek.keys()].sort()
  const end = weeks[weeks.length - 1]
  const out = []
  for (let wk = weeks[0]; wk <= end; wk = addDays(wk, 7)) {
    const e = byWeek.get(wk)
    out.push({ weekStart: wk, pace: e ? e.sum / e.n : null })
  }
  return out
}
