import { describe, it, expect } from 'vitest'
import { getPhase, getTodaysPlan, getPlannedRunCount } from './plan.js'
import { PHASES, LEVELS, WEEKLY_PLAN } from './constants.js'

describe('getPhase — contiguous, always defined (including race days)', () => {
  it('resolves each boundary and the three race days', () => {
    expect(getPhase('2026-06-01').id).toBe(1)
    expect(getPhase('2026-09-13').id).toBe(1) // Chewacla 5K — end of Phase 1
    expect(getPhase('2026-09-14').id).toBe(2)
    expect(getPhase('2026-11-14').id).toBe(2) // Cathedral 15K — end of Phase 2
    expect(getPhase('2026-11-15').id).toBe(3)
    expect(getPhase('2027-04-24').id).toBe(3) // Choccolocco HM — end of Phase 3
  })

  it('never returns undefined off the ends', () => {
    expect(getPhase('2027-04-25').id).toBe('maintenance')
    expect(getPhase('2026-05-31').id).toBe(1) // clamp before start
  })
})

describe('getTodaysPlan — by local weekday', () => {
  const level = LEVELS[0]
  const phase = PHASES[0]
  it('maps weekdays to the right session', () => {
    expect(getTodaysPlan('2026-06-02', phase, level).kind).toBe('zone2') // Tue
    expect(getTodaysPlan('2026-06-04', phase, level).kind).toBe('zone2') // Thu
    expect(getTodaysPlan('2026-06-06', phase, level).kind).toBe('long') // Sat
    expect(getTodaysPlan('2026-06-01', phase, level).type).toBe('strength') // Mon
    expect(getTodaysPlan('2026-06-07', phase, level).type).toBe('rest') // Sun
  })
})

describe('getPlannedRunCount', () => {
  it('weekday target flexes the planned count', () => {
    expect(getPlannedRunCount(WEEKLY_PLAN, 2)).toBe(3)
    expect(getPlannedRunCount(WEEKLY_PLAN, 3)).toBe(4)
    expect(getPlannedRunCount()).toBe(3)
  })
})
