import { describe, it, expect } from 'vitest'
import {
  weeksBetween,
  lastNWeeks,
  cumulativeSeries,
  weeklyVolumeSeries,
  longRunProgressionSeries,
  zone2ComplianceSeries,
  attachTrend,
} from './charts.js'
import { runOn, act } from './_fixtures.js'

const MI = 1609.344

describe('week ranges', () => {
  it('lastNWeeks ends at today’s Monday week', () => {
    expect(lastNWeeks(3, '2026-06-24')).toEqual(['2026-06-08', '2026-06-15', '2026-06-22'])
  })
  it('weeksBetween is inclusive of both ends’ weeks', () => {
    expect(weeksBetween('2026-06-03', '2026-06-20')).toEqual([
      '2026-06-01',
      '2026-06-08',
      '2026-06-15',
    ])
  })
})

describe('cumulativeSeries', () => {
  it('accumulates miles oldest-first', () => {
    const acts = [
      runOn('2026-06-04', { distance: 2 * MI }),
      runOn('2026-06-02', { distance: 1 * MI }),
    ]
    expect(cumulativeSeries(acts).map((p) => Math.round(p.miles))).toEqual([1, 3])
  })
})

describe('weeklyVolumeSeries', () => {
  it('sums per-week miles and tags the phase', () => {
    const acts = [runOn('2026-06-23', { distance: 3 * MI })] // in week 2026-06-22
    const series = weeklyVolumeSeries(acts, '2026-06-24', 2)
    expect(series.map((d) => d.weekStart)).toEqual(['2026-06-15', '2026-06-22'])
    expect(Math.round(series[1].miles)).toBe(3)
    expect(series[1].phaseId).toBe(1) // Base Build
  })
})

describe('longRunProgressionSeries', () => {
  it('Phase 1 estimates distance from time and flags it', () => {
    const acts = [runOn('2026-06-06', { moving_time: 75 * 60 })] // 75 min long run
    const series = longRunProgressionSeries(acts, '2026-06-01', '2026-06-14')
    expect(series[0]).toEqual({ weekStart: '2026-06-01', miles: 5, estimated: true }) // 75/15
    expect(series[1]).toEqual({ weekStart: '2026-06-08', miles: null, estimated: false })
  })

  it('later phases use real distance, not estimated', () => {
    const acts = [runOn('2026-09-19', { distance: 6 * MI })] // Phase 2, clears 5 mi
    const series = longRunProgressionSeries(acts, '2026-09-14', '2026-09-20')
    expect(series[0].estimated).toBe(false)
    expect(Math.round(series[0].miles)).toBe(6)
  })
})

describe('zone2ComplianceSeries', () => {
  it('is % of HR runs in zone for the week', () => {
    const acts = [
      runOn('2026-06-23', { average_heartrate: 120 }), // in
      runOn('2026-06-24', { average_heartrate: 160 }), // over
    ]
    const series = zone2ComplianceSeries(acts, 108, 144, '2026-06-24', 1)
    expect(series[0].pct).toBe(50)
  })
})

describe('attachTrend', () => {
  it('fits a line over non-null points', () => {
    const data = attachTrend(
      [{ pace: 10 }, { pace: 9 }, { pace: 8 }],
      'pace',
    )
    expect(data[0].trend).toBeCloseTo(10, 6)
    expect(data[2].trend).toBeCloseTo(8, 6)
    expect(data[0].trend).toBeGreaterThan(data[2].trend) // improving = falling pace
  })
  it('returns null trend with too few points', () => {
    expect(attachTrend([{ pace: 10 }], 'pace')[0].trend).toBeNull()
  })
})
