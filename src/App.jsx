import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './screens/Dashboard.jsx'
import Progress from './screens/Progress.jsx'
import AuthCallback from './screens/AuthCallback.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
