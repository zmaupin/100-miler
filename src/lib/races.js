// Race lookups for the Next Race card.

import { RACES } from './constants.js'
import { keyDayNumber } from './calendar.js'

// The soonest race on or after today, or null once they're all past.
export function getNextRace(todayKey, races = RACES) {
  return (
    races
      .filter((r) => r.date >= todayKey) // 'YYYY-MM-DD' compares lexically
      .sort((a, b) => (a.date < b.date ? -1 : 1))[0] || null
  )
}

export function daysUntil(dateKey, todayKey) {
  return keyDayNumber(dateKey) - keyDayNumber(todayKey)
}
