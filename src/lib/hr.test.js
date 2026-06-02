import { describe, it, expect } from 'vitest'
import { getZone, isZone2, zone2Compliance } from './hr.js'

const MIN = 108
const MAX = 144
const MAXHR = 180

describe('heart rate', () => {
  it('getZone buckets by %max, null HR -> null', () => {
    expect(getZone(90, MAXHR)).toBe(1) // 0.50
    expect(getZone(108, MAXHR)).toBe(2) // 0.60
    expect(getZone(144, MAXHR)).toBe(4) // 0.80
    expect(getZone(180, MAXHR)).toBe(5) // 1.00
    expect(getZone(null, MAXHR)).toBeNull()
  })

  it('isZone2 is inclusive at the band boundaries', () => {
    expect(isZone2(108, MIN, MAX)).toBe(true)
    expect(isZone2(144, MIN, MAX)).toBe(true)
    expect(isZone2(145, MIN, MAX)).toBe(false)
    expect(isZone2(null, MIN, MAX)).toBe(false)
  })

  it('zone2Compliance maps to dot states', () => {
    expect(zone2Compliance(108, MIN, MAX)).toBe('in')
    expect(zone2Compliance(144, MIN, MAX)).toBe('in')
    expect(zone2Compliance(107, MIN, MAX)).toBe('border') // too easy
    expect(zone2Compliance(145, MIN, MAX)).toBe('over') // too hard
    expect(zone2Compliance(null, MIN, MAX)).toBe('no-data')
  })
})
