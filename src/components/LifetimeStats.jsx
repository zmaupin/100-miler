import { Card, Stat } from './ui.jsx'
import { totalMiles, totalElevationFeet, totalTimeHours } from '../lib/aggregates.js'

const n0 = (x) => Math.round(x).toLocaleString()
const n1 = (x) => x.toLocaleString(undefined, { maximumFractionDigits: 1 })

// The numbers that grow.
export function LifetimeStats({ activities }) {
  return (
    <Card title="Since June 1">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Miles" value={n1(totalMiles(activities))} />
        <Stat label="Elevation ft" value={n0(totalElevationFeet(activities))} />
        <Stat label="Hours on feet" value={n1(totalTimeHours(activities))} />
        <Stat label="Activities" value={activities.length.toLocaleString()} />
      </div>
    </Card>
  )
}
