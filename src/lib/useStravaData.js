// Loads cached activities from localStorage and runs an incremental sync on mount
// if it's been >30 min (or on manual trigger). Activities stay in memory after load;
// navigation between screens never refetches.

import { useState, useEffect, useCallback, useRef } from 'react'
import { isConnected } from './stravaAuth.js'
import { storage } from './storage.js'
import { syncActivities, shouldSync } from './stravaSync.js'

export function useStravaData() {
  const [activities, setActivities] = useState(() => storage.get('activities') || [])
  const [lastSyncAt, setLastSyncAt] = useState(() => storage.get('lastSyncAt'))
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const inFlight = useRef(false)

  const runSync = useCallback(async () => {
    if (!isConnected() || inFlight.current) return
    inFlight.current = true
    setSyncing(true)
    setError(null)
    try {
      const merged = await syncActivities()
      setActivities(merged)
      setLastSyncAt(storage.get('lastSyncAt'))
    } catch (e) {
      setError(e?.message || 'sync_failed')
    } finally {
      inFlight.current = false
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    if (isConnected() && shouldSync(storage.get('lastSyncAt'))) runSync()
  }, [runSync])

  return { activities, lastSyncAt, syncing, error, runSync, connected: isConnected() }
}
