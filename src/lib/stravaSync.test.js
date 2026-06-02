import { describe, it, expect } from 'vitest'
import {
  trimActivity,
  mergeActivities,
  computeCursor,
  initialAfter,
  shouldSync,
  CURSOR_BUFFER_DAYS,
} from './stravaSync.js'

describe('trimActivity', () => {
  it('keeps exactly the 13 stored fields, nulls missing ones, drops extras', () => {
    const raw = {
      id: 1,
      name: 'Run',
      type: 'Run',
      start_date: '2026-06-10T11:00:00Z',
      start_date_local: '2026-06-10T07:00:00Z',
      distance: 5000,
      moving_time: 1800,
      elapsed_time: 1900,
      total_elevation_gain: 100,
      average_heartrate: 130,
      max_heartrate: 150,
      average_speed: 2.7,
      // suffer_score missing
      kudos_count: 5, // extra — must be dropped
    }
    const out = trimActivity(raw)
    expect(Object.keys(out)).toHaveLength(13)
    expect('kudos_count' in out).toBe(false)
    expect(out.suffer_score).toBeNull()
    expect(out.average_speed).toBe(2.7)
  })
})

describe('mergeActivities — dedupe by id, sorted, backdated-safe', () => {
  it('dedupes by id (incoming wins) and includes late/backdated activities', () => {
    const existing = [
      { id: 1, start_date: '2026-06-10T11:00:00Z', name: 'old-1' },
      { id: 2, start_date: '2026-06-12T11:00:00Z', name: 'old-2' },
    ]
    const incoming = [
      { id: 2, start_date: '2026-06-12T11:00:00Z', name: 'updated-2' }, // dupe -> overwrite
      { id: 3, start_date: '2026-06-05T11:00:00Z', name: 'backdated-3' }, // earlier than cached
    ]
    const merged = mergeActivities(existing, incoming)
    expect(merged.map((a) => a.id)).toEqual([3, 1, 2]) // sorted oldest-first
    expect(merged.find((a) => a.id === 2).name).toBe('updated-2')
    expect(merged).toHaveLength(3)
  })
})

describe('computeCursor', () => {
  it('trails the newest start_date by the buffer', () => {
    const acts = [
      { start_date: '2026-06-01T00:00:00Z' },
      { start_date: '2026-07-10T12:00:00Z' }, // newest
    ]
    const maxEpoch = Math.floor(Date.parse('2026-07-10T12:00:00Z') / 1000)
    expect(maxEpoch - computeCursor(acts, 0)).toBe(CURSOR_BUFFER_DAYS * 86400)
  })

  it('falls back when there are no activities', () => {
    expect(computeCursor([], 12345)).toBe(12345)
  })
})

describe('initialAfter / shouldSync', () => {
  it('initialAfter is the training-start day at UTC midnight', () => {
    expect(initialAfter('2026-06-01')).toBe(Math.floor(Date.UTC(2026, 5, 1) / 1000))
  })

  it('shouldSync respects the 30-min window', () => {
    const now = Date.now()
    expect(shouldSync(null, now)).toBe(true)
    expect(shouldSync(now - 5 * 60 * 1000, now)).toBe(false)
    expect(shouldSync(now - 31 * 60 * 1000, now)).toBe(true)
  })
})
