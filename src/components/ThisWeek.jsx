import { Card } from './ui.jsx'
import { currentWeekProgress } from '../lib/streak.js'
import { weeklyMileage } from '../lib/aggregates.js'
import { weekStartKey } from '../lib/calendar.js'
import { getPlan } from '../lib/profile.js'

export function ThisWeek({ activities, today }) {
  const plan = getPlan()
  const { done, planned } = currentWeekProgress(activities, plan, today)
  const miles = weeklyMileage(activities, weekStartKey(today))

  const total = Math.max(planned, done) // show overflow if you ran more than planned
  const dots = Array.from({ length: total }, (_, i) => i < done)

  return (
    <Card title="This Week vs Plan">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {dots.map((filled, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full border ${
                filled ? 'border-green-500 bg-green-500' : 'border-neutral-700'
              }`}
            />
          ))}
        </div>
        <div className="text-sm text-neutral-400">
          {done}/{planned} runs · {miles.toFixed(1)} mi
        </div>
      </div>
    </Card>
  )
}
