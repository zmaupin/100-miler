import { Routes, Route, Navigate } from 'react-router-dom'

// Screens are stubbed for now — the data layer (utils + tests) lands first,
// then OAuth/sync, then these get built out per the spec's build order.
function Dashboard() {
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold tracking-tight">100 Mile Project</h1>
      <p className="mt-2 text-sm text-neutral-400">Dashboard — coming online.</p>
    </main>
  )
}

function Progress() {
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
      <p className="mt-2 text-sm text-neutral-400">Charts — coming online.</p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
