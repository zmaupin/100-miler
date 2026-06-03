// Activity notes, keyed by Strava activity id, in a single localStorage map.

import { storage } from './storage.js'

const KEY = 'activityNotes'

export function getNote(id) {
  const all = storage.get(KEY) || {}
  return all[id] || ''
}

export function setNote(id, text) {
  const all = storage.get(KEY) || {}
  const trimmed = (text || '').trim()
  if (trimmed) all[id] = trimmed
  else delete all[id]
  storage.set(KEY, all)
}
