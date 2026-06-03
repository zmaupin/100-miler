// Reads the user's current level + weekday target from storage with sane defaults.
// (Level management and Settings UIs come in later steps; these keys may not exist yet.)

import { LEVELS, WEEKLY_PLAN, ATHLETE } from './constants.js'
import { storage } from './storage.js'
import { getPlannedRunCount } from './plan.js'

export function getCurrentLevel() {
  const id = storage.get('currentLevel') || 1
  return LEVELS.find((l) => l.id === id) || LEVELS[0]
}

export function getWeekdayRunTarget() {
  const settings = storage.get('settings')
  return settings?.weekdayRunTarget || WEEKLY_PLAN.weekdayRuns
}

// Plan object consumed by the streak math.
export function getPlan() {
  return {
    trainingStartDate: ATHLETE.trainingStartDate,
    plannedRunCount: getPlannedRunCount(WEEKLY_PLAN, getWeekdayRunTarget()),
  }
}
