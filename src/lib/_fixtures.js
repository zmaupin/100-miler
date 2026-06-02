// Test helper: builds a trimmed activity with sane defaults. Not a test file.
let seq = 1

export function act(o = {}) {
  const start_date_local = o.start_date_local || '2026-06-06T07:00:00Z'
  return {
    id: seq++,
    name: 'Run',
    type: 'Run',
    start_date: start_date_local,
    start_date_local,
    distance: 5000,
    moving_time: 1800,
    elapsed_time: 1900,
    total_elevation_gain: 100,
    average_heartrate: null,
    max_heartrate: null,
    average_speed: null,
    suffer_score: null,
    ...o,
  }
}

// A run on a given local date key at 07:00, with optional overrides.
export function runOn(dateKey, o = {}) {
  return act({ start_date_local: `${dateKey}T07:00:00Z`, ...o })
}
