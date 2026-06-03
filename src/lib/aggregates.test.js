import { describe, it, expect } from 'vitest'
import {
  totalMiles,
  totalElevationFeet,
  totalTimeHours,
  weeklyMileage,
  zone2ComplianceRate,
  estimateDistanceFromTime,
  aerobicEfficiencySeries,
  longestRunMiles,
} from './aggregates.js'
import { runOn, act } from './_fixtures.js'

const MI = 1609.344
const MIN = 108
const MAX = 144

describe('lifetime aggregates', () => {
  it('sums miles, feet, and hours', () => {
    expect(totalMiles([act({ distance: MI }), act({ distance: 2 * MI })])).toBeCloseTo(3, 6)
    expect(totalElevationFeet([act({ total_elevation_gain: 1000 })])).toBeCloseTo(3280.84, 2)
    expect(totalTimeHours([act({ moving_time: 3600 }), act({ moving_time: 1800 })])).toBeCloseTo(1.5, 6)
  })

  it('weeklyMileage only counts the target Monday-week', () => {
    const acts = [
      runOn('2026-06-02', { distance: MI }),
      runOn('2026-06-04', { distance: MI }),
      runOn('2026-06-08', { distance: MI }), // next week
    ]
    expect(weeklyMileage(acts, '2026-06-01')).toBeCloseTo(2, 6)
  })
})

describe('zone2ComplianceRate', () => {
  it('is % of HR-bearing runs in zone; no-data runs and walks excluded', () => {
    const week = [
      runOn('2026-06-02', { average_heartrate: 120 }), // in
      runOn('2026-06-03', { average_heartrate: 130 }), // in
      runOn('2026-06-04', { average_heartrate: 160 }), // over
      runOn('2026-06-05', { average_heartrate: null }), // excluded
      act({ type: 'Walk', average_heartrate: 120 }), // excluded (not a run)
    ]
    expect(zone2ComplianceRate(week, MIN, MAX)).toBeCloseTo(66.67, 1)
  })

  it('returns null when no run has HR data', () => {
    expect(zone2ComplianceRate([runOn('2026-06-02', { average_heartrate: null })], MIN, MAX)).toBeNull()
  })
})

describe('aerobic efficiency series', () => {
  it('estimateDistanceFromTime uses ~15 min/mi', () => {
    expect(estimateDistanceFromTime(60)).toBe(4)
  })

  it('is weekly with null gaps for empty weeks', () => {
    const acts = [
      runOn('2026-06-02', { average_heartrate: 120, average_speed: 3.0 }),
      // gap: nothing in the 2026-06-08 week
      runOn('2026-06-16', { average_heartrate: 130, average_speed: 3.2 }),
    ]
    const series = aerobicEfficiencySeries(acts, MIN, MAX)
    expect(series.map((p) => p.weekStart)).toEqual(['2026-06-01', '2026-06-08', '2026-06-15'])
    expect(typeof series[0].pace).toBe('number')
    expect(series[1].pace).toBeNull()
    expect(typeof series[2].pace).toBe('number')
  })
})

describe('longestRunMiles', () => {
  it('is the longest run, ignoring walks/hikes', () => {
    const acts = [
      act({ type: 'Run', distance: 5000 }),
      act({ type: 'TrailRun', distance: 12000 }), // longest run
      act({ type: 'Walk', distance: 20000 }), // longer, but not a run
    ]
    expect(longestRunMiles(acts)).toBeCloseTo(7.456, 2)
    expect(longestRunMiles([])).toBe(0)
  })
})
