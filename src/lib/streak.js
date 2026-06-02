// ONE streak: the week-streak. Plan adherence, not daily activity.
//
// - A week is "kept" if completed RUNS >= plannedRunCount (walks/hikes don't count).
// - Rest days and strength days never break it — they're simply not required runs.
// - Week starts Monday.
// - The current (partial) week CANNOT be broken — only completed weeks count toward
//   the streak. The current week is shown as in-progress, never failed.
//
// plan.plannedRunCount may be a number OR a function (weekStartKey) => number. The
// function form lets a per-week snapshot drive the math, so bumping the weekday
// target never retroactively collapses past weeks.

import { weekStartKey, localDateKey, addDays, todayKey } from './calendar.js'
import { isRunType } from './activities.js'

function runsInWeek(activities, weekStartK) {
  return activities.filter((a) => {
    if (!isRunType(a)) return false
    const k = localDateKey(a)
    return k != null && weekStartKey(k) === weekStartK
  })
}

function plannedCountFor(plan, weekStartK) {
  const p = plan.plannedRunCount
  return typeof p === 'function' ? p(weekStartK) : p
}

function earliestWeek(activities, plan) {
  const start =
    plan.trainingStartDate ||
    activities.map(localDateKey).filter(Boolean).sort()[0] ||
    todayKey()
  return weekStartKey(String(start).slice(0, 10))
}

export function weekIsKept(weekActs, plannedRunCount) {
  return weekActs.filter(isRunType).length >= plannedRunCount
}

// Consecutive COMPLETED kept weeks, counting back from the last completed week.
export function weekStreak(activities, plan, today = todayKey()) {
  const earliest = earliestWeek(activities, plan)
  let wk = addDays(weekStartKey(today), -7) // most recent completed week
  let streak = 0
  while (wk >= earliest) {
    if (runsInWeek(activities, wk).length >= plannedCountFor(plan, wk)) {
      streak += 1
      wk = addDays(wk, -7)
    } else {
      break
    }
  }
  return streak
}

// Longest run of consecutive kept weeks across all completed weeks.
export function longestWeekStreak(activities, plan, today = todayKey()) {
  const current = weekStartKey(today)
  let wk = earliestWeek(activities, plan)
  let best = 0
  let run = 0
  while (wk < current) {
    if (runsInWeek(activities, wk).length >= plannedCountFor(plan, wk)) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
    wk = addDays(wk, 7)
  }
  return best
}

// For the in-progress current week display: { done, planned }.
export function currentWeekProgress(activities, plan, today = todayKey()) {
  const current = weekStartKey(today)
  return {
    done: runsInWeek(activities, current).length,
    planned: plannedCountFor(plan, current),
  }
}
