import { describe, it, expect } from 'vitest'
import {
  localDateKey,
  localDay,
  dowOfKey,
  weekStartKey,
  addDays,
  diffDays,
  daysSinceLastRun,
} from './calendar.js'
import { act, runOn } from './_fixtures.js'

// 2026-06-01 is a Monday; 2026-06-06 is a Saturday.
describe('calendar — start_date_local drives everything, host-tz independent', () => {
  it('a 6 AM Saturday local run buckets to Saturday regardless of the "Z" suffix', () => {
    expect(localDateKey(act({ start_date_local: '2026-06-06T06:00:00Z' }))).toBe('2026-06-06')
    expect(localDay(act({ start_date_local: '2026-06-06T06:00:00Z' }))).toBe(6) // Sat
    // Late-night and early-morning local times must NOT shift the calendar day.
    expect(localDateKey(act({ start_date_local: '2026-06-06T23:30:00Z' }))).toBe('2026-06-06')
    expect(localDateKey(act({ start_date_local: '2026-06-06T00:30:00Z' }))).toBe('2026-06-06')
  })

  it('Monday-start week bucketing', () => {
    expect(dowOfKey('2026-06-01')).toBe(1) // Mon
    expect(weekStartKey('2026-06-06')).toBe('2026-06-01') // Sat -> its Monday
    expect(weekStartKey('2026-06-07')).toBe('2026-06-01') // Sun stays in same block
    expect(weekStartKey('2026-06-08')).toBe('2026-06-08') // next Monday
  })

  it('date key arithmetic', () => {
    expect(addDays('2026-06-01', 7)).toBe('2026-06-08')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28') // 2026 is not a leap year
    expect(diffDays('2026-06-09', '2026-06-06')).toBe(3)
  })

  it('daysSinceLastRun counts runs only; hikes/walks do not reset it', () => {
    const activities = [
      runOn('2026-06-06'), // Sat run
      act({ type: 'Hike', start_date_local: '2026-06-08T07:00:00Z' }), // Mon hike
    ]
    expect(daysSinceLastRun(activities, '2026-06-09')).toBe(3) // Tue, 3 days since Sat run
    expect(daysSinceLastRun([], '2026-06-09')).toBe(Infinity)
  })
})
