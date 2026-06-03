import { Panel, Label, Metric } from './ui.jsx'
import { totalMiles, totalElevationFeet, totalTimeHours } from '../lib/aggregates.js'

const n0 = (x) => Math.round(x).toLocaleString()
const n1 = (x) => x.toLocaleString(undefined, { maximumFractionDigits: 1 })

// The numbers that grow — data as the hero.
export function LifetimeStats({ activities }) {
  return (
    <Panel>
      <Label>Since June 1</Label>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-6">
        <Metric value={n1(totalMiles(activities))} unit="mi" label="Distance" />
        <Metric value={n0(totalElevationFeet(activities))} unit="ft" label="Climbed" />
        <Metric value={n1(totalTimeHours(activities))} unit="hr" label="On feet" />
        <Metric value={activities.length.toLocaleString()} label="Activities" />
      </div>
    </Panel>
  )
}
