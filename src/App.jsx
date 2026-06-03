import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './screens/Dashboard.jsx'
import Strength from './screens/Strength.jsx'
import AuthCallback from './screens/AuthCallback.jsx'

// Charts (Recharts) are heavy; keep them out of the dashboard's initial bundle.
const Progress = lazy(() => import('./screens/Progress.jsx'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/strength" element={<Strength />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/progress"
        element={
          <Suspense fallback={<div className="p-4 text-sm text-neutral-500">Loading charts…</div>}>
            <Progress />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
