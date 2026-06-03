import { describe, it, expect } from 'vitest'
import { getNextRace, daysUntil } from './races.js'

describe('getNextRace', () => {
  it('returns the soonest race on or after today', () => {
    expect(getNextRace('2026-06-03').id).toBe('chewacla-5k')
    expect(getNextRace('2026-09-13').id).toBe('chewacla-5k') // race day still counts
    expect(getNextRace('2026-09-14').id).toBe('cathedral-15k')
    expect(getNextRace('2026-11-15').id).toBe('choccolocco-hm')
  })

  it('returns null once every race is past', () => {
    expect(getNextRace('2027-05-01')).toBeNull()
  })
})

describe('daysUntil', () => {
  it('counts whole days between keys', () => {
    expect(daysUntil('2026-09-13', '2026-06-03')).toBe(102)
    expect(daysUntil('2026-06-03', '2026-06-03')).toBe(0)
  })
})
