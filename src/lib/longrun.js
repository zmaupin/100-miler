// Long run = the longest run of the (Monday-start) week that ALSO clears the phase's
// long-run threshold. Not "Saturday > 60 min": hardcoding a weekday contradicts the
// app's premise that the plan must bend. A Sunday long run counts; a recovery week
// with no qualifying run correctly has no long run.
//
// Phase 1's threshold is time-based (minutes); Phases 2–3 are distance-based (miles).
// "Longest" is measured in the phase's native unit so it agrees with the threshold.

import { weekStartKey, localDateKey } from './calendar.js'
import { isRunType } from './activities.js'
import { metersToMiles } from './conversions.js'

export function weekActivities(activities, weekStartK) {
  return activities.filter((a) => {
    const k = localDateKey(a)
    return k != null && weekStartKey(k) === weekStartK
  })
}

function clearsThreshold(activity, phase) {
  if (phase.longRunThresholdMin != null) {
    return activity.moving_time / 60 >= phase.longRunThresholdMin
  }
  return metersToMiles(activity.distance) >= phase.longRunThresholdMi
}

function longMetric(activity, phase) {
  return phase.longRunThresholdMin != null ? activity.moving_time : activity.distance
}

// The week's long run, or null if no run clears the threshold.
export function longRunOfWeek(weekActs, phase) {
  const qualifying = weekActs.filter((a) => isRunType(a) && clearsThreshold(a, phase))
  if (qualifying.length === 0) return null
  return qualifying.reduce((best, a) =>
    longMetric(a, phase) > longMetric(best, phase) ? a : best,
  )
}

// Needs week context + phase — it's not a property of a lone activity.
export function isLongRun(activity, weekActs, phase) {
  const lr = longRunOfWeek(weekActs, phase)
  return lr != null && lr.id === activity.id
}
