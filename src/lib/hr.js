// Heart-rate helpers. Note: getZone() uses textbook %max buckets, while the app's
// "Zone 2" is the athlete's explicit aerobic band (108–144 = 60–80% of 180), which
// is wider than a textbook Z2. isZone2/zone2Compliance use that explicit band.
// All of this is estimated from each activity's AVERAGE HR — see the aerobic
// efficiency chart caveat. Document it in the UI.

export function getZone(avgHR, maxHR) {
  if (avgHR == null || !maxHR) return null
  const pct = avgHR / maxHR
  if (pct < 0.6) return 1
  if (pct < 0.7) return 2
  if (pct < 0.8) return 3
  if (pct < 0.9) return 4
  return 5
}

export function isZone2(avgHR, min, max) {
  return avgHR != null && avgHR >= min && avgHR <= max
}

// Dashboard dot: "in" (green) | "border" (yellow, under-zone/too easy) |
// "over" (red, too hard) | "no-data" (gray).
export function zone2Compliance(avgHR, min, max) {
  if (avgHR == null) return 'no-data'
  if (avgHR > max) return 'over'
  if (avgHR < min) return 'border'
  return 'in'
}
