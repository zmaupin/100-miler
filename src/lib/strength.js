// Strength training log. Lives entirely in localStorage — Strava only knows about
// runs, so the lifting side is tracked here by hand (exercises -> sets of reps x weight).

import { storage } from './storage.js'
import { todayKey } from './calendar.js'

const KEY = 'strengthSessions'

export function getSessions() {
  return storage.get(KEY) || []
}

// Newest first.
export function getSessionsSorted() {
  return [...getSessions()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function saveSession(session) {
  const sessions = getSessions()
  const id = session.id || `s_${Date.now()}`
  const record = {
    id,
    date: session.date || todayKey(),
    exercises: session.exercises || [],
    notes: session.notes || '',
  }
  const idx = sessions.findIndex((s) => s.id === id)
  if (idx >= 0) sessions[idx] = record
  else sessions.push(record)
  storage.set(KEY, sessions)
  return record
}

export function deleteSession(id) {
  storage.set(KEY, getSessions().filter((s) => s.id !== id))
}

// ── Pure helpers ──

// Total load moved: sum of reps x weight across all sets (bodyweight sets add 0).
export function sessionVolume(session) {
  return (session.exercises || []).reduce(
    (total, ex) =>
      total +
      (ex.sets || []).reduce((s, set) => s + (Number(set.reps) || 0) * (Number(set.weight) || 0), 0),
    0,
  )
}

export function sessionSetCount(session) {
  return (session.exercises || []).reduce((total, ex) => total + (ex.sets || []).length, 0)
}

// Most recent prior logging of an exercise (for a progressive-overload reference).
// Returns { date, sets } or null. Case-insensitive name match.
export function lastPerformance(sessions, name, beforeDate) {
  const needle = name.trim().toLowerCase()
  if (!needle) return null
  const prior = sessions
    .filter((s) => !beforeDate || s.date < beforeDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  for (const s of prior) {
    const ex = (s.exercises || []).find((e) => e.name.trim().toLowerCase() === needle)
    if (ex && ex.sets?.length) return { date: s.date, sets: ex.sets }
  }
  return null
}

// Drop blank exercises/sets before saving.
export function cleanExercises(exercises) {
  return exercises
    .map((ex) => ({
      name: ex.name.trim(),
      sets: (ex.sets || [])
        .filter((set) => set.reps !== '' && set.reps != null)
        .map((set) => ({ reps: Number(set.reps), weight: set.weight === '' ? null : Number(set.weight) })),
    }))
    .filter((ex) => ex.name && ex.sets.length > 0)
}
