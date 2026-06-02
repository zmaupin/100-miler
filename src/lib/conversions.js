// Strava returns metric. All imperial conversion happens here, in the frontend.

export const METERS_PER_MILE = 1609.344
export const FEET_PER_METER = 3.280839895

export function metersToMiles(m) {
  return (m || 0) / METERS_PER_MILE
}

export function metersToFeet(m) {
  return (m || 0) * FEET_PER_METER
}

// m/s -> "MM:SS" per mile. Non-positive / missing speed -> "—".
export function mpsToMinPerMile(mps) {
  if (!mps || mps <= 0) return '—'
  const secPerMile = METERS_PER_MILE / mps
  let min = Math.floor(secPerMile / 60)
  let sec = Math.round(secPerMile % 60)
  if (sec === 60) {
    min += 1
    sec = 0
  }
  return `${min}:${String(sec).padStart(2, '0')}`
}

// seconds -> "H:MM" (compact, for hour-scale durations).
export function secondsToHHMM(s) {
  const total = Math.max(0, Math.round(s || 0))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

// seconds -> "H:MM:SS", or "M:SS" under an hour (for activity durations).
export function secondsToClock(s) {
  const total = Math.max(0, Math.round(s || 0))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const sec = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}
