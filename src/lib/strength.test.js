import { describe, it, expect } from 'vitest'
import { sessionVolume, sessionSetCount, lastPerformance, cleanExercises } from './strength.js'

const session = {
  date: '2026-06-03',
  exercises: [
    { name: 'Squat', sets: [{ reps: 5, weight: 135 }, { reps: 5, weight: 135 }] },
    { name: 'Pull-up', sets: [{ reps: 8, weight: null }] }, // bodyweight
  ],
}

describe('session math', () => {
  it('volume sums reps x weight; bodyweight adds 0', () => {
    expect(sessionVolume(session)).toBe(1350)
  })
  it('counts all sets across exercises', () => {
    expect(sessionSetCount(session)).toBe(3)
  })
})

describe('lastPerformance', () => {
  const sessions = [
    { date: '2026-06-01', exercises: [{ name: 'Squat', sets: [{ reps: 5, weight: 125 }] }] },
    { date: '2026-06-03', exercises: [{ name: 'squat', sets: [{ reps: 5, weight: 135 }] }] },
  ]
  it('finds the most recent prior session for an exercise (case-insensitive)', () => {
    expect(lastPerformance(sessions, 'Squat', '2026-06-08')).toEqual({
      date: '2026-06-03',
      sets: [{ reps: 5, weight: 135 }],
    })
  })
  it('respects the beforeDate cutoff', () => {
    expect(lastPerformance(sessions, 'Squat', '2026-06-03').date).toBe('2026-06-01')
  })
  it('returns null when never performed', () => {
    expect(lastPerformance(sessions, 'Deadlift')).toBeNull()
  })
})

describe('cleanExercises', () => {
  it('drops blank exercises and set rows, coerces numbers, keeps bodyweight as null', () => {
    const out = cleanExercises([
      { name: '  Bench  ', sets: [{ reps: '5', weight: '95' }, { reps: '', weight: '' }] },
      { name: '', sets: [{ reps: '10', weight: '' }] }, // no name -> dropped
      { name: 'Plank', sets: [] }, // no sets -> dropped
    ])
    expect(out).toEqual([{ name: 'Bench', sets: [{ reps: 5, weight: 95 }] }])
  })
})
