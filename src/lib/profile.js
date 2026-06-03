// Reads the user's current level + weekday target from storage with sane defaults.
// (Level management and Settings UIs come in later steps; these keys may not exist yet.)

import { LEVELS, WEEKLY_PLAN, ATHLETE } from './constants.js'
import { storage } from './storage.js'
import { getPlannedRunCount } from './plan.js'
import { todayKey } from './calendar.js'

const EMPTY_CRITERIA = { zone2: false, recovery: false, noPain: false }

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

// ── Level management ──
export function getLevelId() {
  return storage.get('currentLevel') || 1
}

export function setLevel(id) {
  storage.set('currentLevel', id)
  const history = getLevelHistory()
  if (history[history.length - 1]?.level !== id) {
    storage.set('levelHistory', [...history, { level: id, enteredDate: todayKey() }])
  }
}

export function getLevelHistory() {
  return storage.get('levelHistory') || [{ level: 1, enteredDate: ATHLETE.trainingStartDate }]
}

export function getExitCriteria(levelId) {
  return (storage.get('exitCriteria') || {})[levelId] || { ...EMPTY_CRITERIA }
}

export function setExitCriterion(levelId, key, value) {
  const all = storage.get('exitCriteria') || {}
  all[levelId] = { ...EMPTY_CRITERIA, ...all[levelId], [key]: value }
  storage.set('exitCriteria', all)
}
