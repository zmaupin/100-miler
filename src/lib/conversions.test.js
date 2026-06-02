import { describe, it, expect } from 'vitest'
import {
  metersToMiles,
  metersToFeet,
  mpsToMinPerMile,
  secondsToHHMM,
  secondsToClock,
} from './conversions.js'

describe('conversions', () => {
  it('meters -> miles', () => {
    expect(metersToMiles(1609.344)).toBeCloseTo(1, 10)
    expect(metersToMiles(0)).toBe(0)
    expect(metersToMiles(null)).toBe(0)
  })

  it('meters -> feet', () => {
    expect(metersToFeet(1000)).toBeCloseTo(3280.84, 2)
  })

  it('m/s -> min/mile MM:SS', () => {
    expect(mpsToMinPerMile(2.68224)).toBe('10:00') // 600 s/mi
    expect(mpsToMinPerMile(0)).toBe('—')
    expect(mpsToMinPerMile(null)).toBe('—')
  })

  it('seconds -> H:MM', () => {
    expect(secondsToHHMM(3725)).toBe('1:02')
    expect(secondsToHHMM(0)).toBe('0:00')
  })

  it('seconds -> H:MM:SS (M:SS under an hour)', () => {
    expect(secondsToClock(3725)).toBe('1:02:05')
    expect(secondsToClock(125)).toBe('2:05')
  })
})
