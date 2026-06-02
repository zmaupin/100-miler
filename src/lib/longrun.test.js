import { describe, it, expect } from 'vitest'
import { weekActivities, longRunOfWeek, isLongRun } from './longrun.js'
import { PHASES } from './constants.js'
import { runOn } from './_fixtures.js'

const P1 = PHASES[0] // time-based threshold: 50 min
const P2 = PHASES[1] // distance-based threshold: 5 mi
const WEEK = '2026-06-01'

const MIN = 60
const MI = 1609.344

describe('long run — longest run of the week clearing the phase threshold', () => {
  it('Phase 1 (time-based): picks the longest run past 50 min', () => {
    const tue = runOn('2026-06-02', { moving_time: 30 * MIN })
    const thu = runOn('2026-06-04', { moving_time: 40 * MIN })
    const sat = runOn('2026-06-06', { moving_time: 70 * MIN })
    const week = weekActivities([tue, thu, sat], WEEK)
    expect(longRunOfWeek(week, P1).id).toBe(sat.id)
    expect(isLongRun(sat, week, P1)).toBe(true)
    expect(isLongRun(thu, week, P1)).toBe(false)
  })

  it('a recovery week with nothing past threshold has no long run', () => {
    const week = weekActivities(
      [
        runOn('2026-06-02', { moving_time: 30 * MIN }),
        runOn('2026-06-04', { moving_time: 45 * MIN }),
      ],
      WEEK,
    )
    expect(longRunOfWeek(week, P1)).toBeNull()
  })

  it('a Sunday long run counts (not weekday-bound)', () => {
    const sun = runOn('2026-06-07', { moving_time: 75 * MIN })
    const week = weekActivities([runOn('2026-06-02', { moving_time: 30 * MIN }), sun], WEEK)
    expect(longRunOfWeek(week, P1).id).toBe(sun.id)
  })

  it('Phase 2 (distance-based): longest run past 5 mi, sub-threshold ignored', () => {
    const short = runOn('2026-06-02', { distance: 4 * MI })
    const mid = runOn('2026-06-04', { distance: 6 * MI })
    const long = runOn('2026-06-06', { distance: 7 * MI })
    const week = weekActivities([short, mid, long], WEEK)
    expect(longRunOfWeek(week, P2).id).toBe(long.id)
    expect(isLongRun(short, week, P2)).toBe(false)
  })
})
