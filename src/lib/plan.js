// Plan awareness. Phases are contiguous, so getPhase() never returns undefined.

import { PHASES, MAINTENANCE_PHASE, WEEKLY_PLAN } from './constants.js'
import { dowOfKey, todayKey } from './calendar.js'

function toKey(date) {
  if (date instanceof Date) return todayKey(date)
  return String(date).slice(0, 10)
}

// Always returns a phase. After the plan ends -> Maintenance sentinel. Before it
// starts (shouldn't happen in practice) -> Phase 1, so the UI never goes blank.
export function getPhase(date) {
  const key = toKey(date)
  const last = PHASES[PHASES.length - 1]
  if (key > last.end) return MAINTENANCE_PHASE
  if (key < PHASES[0].start) return PHASES[0]
  return PHASES.find((p) => key >= p.start && key <= p.end) ?? MAINTENANCE_PHASE
}

// What the plan calls for on a given date, by day of week (local).
export function getTodaysPlan(date, phase, level) {
  const dow = dowOfKey(toKey(date)) // 0=Sun..6=Sat
  switch (dow) {
    case 2: // Tue
    case 4: // Thu
      return { type: 'run', kind: 'zone2', label: `Zone 2 run, ~${level.weekdayMin} min` }
    case 6: // Sat
      return { type: 'run', kind: 'long', label: `Long run, ${level.longRunMin} min` }
    case 0: // Sun
      return { type: 'rest', kind: 'rest', label: 'Rest or easy walk' }
    default: // Mon/Wed/Fri
      return { type: 'strength', kind: 'strength', label: 'Strength day (+ optional easy run)' }
  }
}

// weekday target flexes the planned count; long runs stay at WEEKLY_PLAN.longRuns.
export function getPlannedRunCount(weeklyPlan = WEEKLY_PLAN, weekdayRunTarget = weeklyPlan.weekdayRuns) {
  return weekdayRunTarget + weeklyPlan.longRuns
}
