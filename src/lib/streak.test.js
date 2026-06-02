import { describe, it, expect } from 'vitest'
import {
  weekIsKept,
  weekStreak,
  longestWeekStreak,
  currentWeekProgress,
} from './streak.js'
import { addDays } from './calendar.js'
import { runOn, act } from './_fixtures.js'

// Three runs (Tue/Thu/Sat) in the week whose Monday is `weekMon`.
function keptWeek(weekMon) {
  return [
    runOn(addDays(weekMon, 1)),
    runOn(addDays(weekMon, 3)),
    runOn(addDays(weekMon, 5)),
  ]
}
// Two runs only — not kept under a planned count of 3.
function shortWeek(weekMon) {
  return [runOn(addDays(weekMon, 1)), runOn(addDays(weekMon, 3))]
}

const PLAN = { trainingStartDate: '2026-06-01', plannedRunCount: 3 }

describe('weekIsKept', () => {
  it('needs >= plannedRunCount RUNS; walks do not count', () => {
    expect(weekIsKept(keptWeek('2026-06-01'), 3)).toBe(true) // exactly 3
    const twoRunsPlusWalk = [
      ...shortWeek('2026-06-01'),
      act({ type: 'Walk', start_date_local: '2026-06-07T07:00:00Z' }),
    ]
    expect(weekIsKept(twoRunsPlusWalk, 3)).toBe(false)
  })
})

describe('weekStreak — completed weeks only, current week never breaks it', () => {
  it('counts consecutive kept completed weeks', () => {
    const acts = [...keptWeek('2026-06-01'), ...keptWeek('2026-06-08'), ...keptWeek('2026-06-15')]
    // today is in the 2026-06-22 week, which has no runs yet — must not break the streak
    expect(weekStreak(acts, PLAN, '2026-06-24')).toBe(3)
  })

  it('a missed completed week ends the streak', () => {
    const acts = [...keptWeek('2026-06-01'), ...shortWeek('2026-06-08'), ...keptWeek('2026-06-15')]
    expect(weekStreak(acts, PLAN, '2026-06-24')).toBe(1) // only 2026-06-15
  })
})

describe('longestWeekStreak vs current streak diverge correctly', () => {
  it('finds the longest historical run of kept weeks', () => {
    // K K K broken K  over weeks 06-01..06-29; today in 07-06 week
    const acts = [
      ...keptWeek('2026-06-01'),
      ...keptWeek('2026-06-08'),
      ...keptWeek('2026-06-15'),
      ...shortWeek('2026-06-22'),
      ...keptWeek('2026-06-29'),
    ]
    expect(longestWeekStreak(acts, PLAN, '2026-07-06')).toBe(3)
    expect(weekStreak(acts, PLAN, '2026-07-06')).toBe(1) // 06-29 kept, 06-22 broken
  })
})

describe('currentWeekProgress', () => {
  it('reports done/planned for the in-progress week', () => {
    const acts = [...keptWeek('2026-06-15'), runOn('2026-06-23')] // one run in the 06-22 week
    expect(currentWeekProgress(acts, PLAN, '2026-06-24')).toEqual({ done: 1, planned: 3 })
  })
})

describe('per-week planned count avoids retroactive collapse', () => {
  it('plannedRunCount can be a function of the week', () => {
    const acts = [...keptWeek('2026-06-08'), ...keptWeek('2026-06-15')] // 3 runs each
    const plan = {
      trainingStartDate: '2026-06-01',
      plannedRunCount: (wk) => (wk === '2026-06-15' ? 4 : 3),
    }
    // 06-15 now needs 4 but has 3 -> not kept -> streak stops immediately
    expect(weekStreak(acts, plan, '2026-06-24')).toBe(0)
  })
})
