import { describe, it, expect } from 'vitest'
import { quitFighterStatus } from './quitfighter.js'
import { runOn, act } from './_fixtures.js'

describe('quitFighterStatus', () => {
  it('stays silent with no runs (a fresh account is not slipping)', () => {
    expect(quitFighterStatus([], '2026-06-10').triggered).toBe(false)
    // a walk is not a run — still silent
    expect(
      quitFighterStatus([act({ type: 'Walk', start_date_local: '2026-06-09T07:00:00Z' })], '2026-06-10')
        .triggered,
    ).toBe(false)
  })

  it('stays silent inside the normal cadence (3-day gap)', () => {
    const s = quitFighterStatus([runOn('2026-06-06')], '2026-06-09') // Sat -> Tue = 3
    expect(s.days).toBe(3)
    expect(s.triggered).toBe(false)
  })

  it('fires at the threshold and reports the last run day', () => {
    const s = quitFighterStatus([runOn('2026-06-02'), runOn('2026-06-06')], '2026-06-10')
    expect(s.days).toBe(4)
    expect(s.triggered).toBe(true)
    expect(s.lastRunKey).toBe('2026-06-06')
  })
})
