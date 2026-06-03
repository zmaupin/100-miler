// Reads/writes user profile state (settings, level) in localStorage with sane
// defaults from the hardcoded athlete context.

import { LEVELS, WEEKLY_PLAN, ATHLETE } from './constants.js'
import { storage } from './storage.js'
import { getPlannedRunCount } from './plan.js'
import { todayKey } from './calendar.js'

const EMPTY_CRITERIA = { zone2: false, recovery: false, noPain: false }

const DEFAULT_SETTINGS = {
  maxHR: ATHLETE.maxHR,
  zone2Min: ATHLETE.zone2Min,
  zone2Max: ATHLETE.zone2Max,
  zone2Override: false,
  trainingStartDate: ATHLETE.trainingStartDate,
  weekdayRunTarget: WEEKLY_PLAN.weekdayRuns,
}

// ── Settings ──
export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(storage.get('settings') || {}) }
}

export function setSettings(patch) {
  const next = { ...getSettings(), ...patch }
  storage.set('settings', next)
  return next
}

// The Zone 2 band every HR-aware view reads from (so the Max HR override applies).
export function getZones() {
  const s = getSettings()
  return { min: s.zone2Min, max: s.zone2Max, maxHR: s.maxHR }
}

export function getWeekdayRunTarget() {
  return getSettings().weekdayRunTarget
}

// Plan object consumed by the streak math.
export function getPlan() {
  return {
    trainingStartDate: getSettings().trainingStartDate,
    plannedRunCount: getPlannedRunCount(WEEKLY_PLAN, getWeekdayRunTarget()),
  }
}

// ── Level management ──
export function getLevelId() {
  return storage.get('currentLevel') || 1
}

export function getCurrentLevel() {
  return LEVELS.find((l) => l.id === getLevelId()) || LEVELS[0]
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
