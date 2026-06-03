// The quit-fighter only speaks up when momentum is at risk. Trigger = days since
// last RUN >= threshold (default 4 — the Sat->Tue rest block makes 3-day gaps
// normal). Suppressed entirely until there's at least one run: a fresh account
// isn't "slipping," it just hasn't started.

import { daysSinceLastRun, localDateKey } from './calendar.js'
import { isRunType } from './activities.js'
import { QUIT_FIGHTER_DAYS } from './constants.js'

export function quitFighterStatus(activities, today, threshold = QUIT_FIGHTER_DAYS) {
  const hasRun = activities.some(isRunType)
  const days = daysSinceLastRun(activities, today)

  let lastRunKey = null
  if (hasRun) {
    const lastRun = activities
      .filter(isRunType)
      .reduce((a, b) => (a.start_date > b.start_date ? a : b))
    lastRunKey = localDateKey(lastRun)
  }

  return { triggered: hasRun && days >= threshold, days, lastRunKey }
}
