// Activity type helpers. Imported types are Run, TrailRun, Hike, Walk.
// "Run" for plan/streak purposes excludes hikes and walks.

export function isRunType(activity) {
  return activity.type === 'Run' || activity.type === 'TrailRun'
}

// MVD = the bad-day escape hatch concept: any activity that actually moved.
// Used for the MVD idea, NOT for any streak.
export function isMVD(activity) {
  return (activity.distance || 0) > 0
}
