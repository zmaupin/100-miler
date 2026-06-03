import { Card } from './ui.jsx'
import { weekStreak, longestWeekStreak, currentWeekProgress } from '../lib/streak.js'
import { getPlan } from '../lib/profile.js'

// One streak: weeks on plan. Completed weeks only — the current week shows as
// in-progress, never as a break.
export function StreakCard({ activities, today }) {
  const plan = getPlan()
  const weeks = weekStreak(activities, plan, today)
  const longest = longestWeekStreak(activities, plan, today)
  const { done, planned } = currentWeekProgress(activities, plan, today)

  return (
    <Card title="Streak">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-4xl font-bold tabular-nums leading-none text-neutral-100">
            {weeks}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wide text-neutral-500">
            {weeks === 1 ? 'week' : 'weeks'} on plan
          </div>
        </div>
        <div className="text-right text-sm text-neutral-400">
          <div>
            This week {done}/{planned}
          </div>
          <div className="text-xs text-neutral-600">Longest {longest}</div>
        </div>
      </div>
    </Card>
  )
}
