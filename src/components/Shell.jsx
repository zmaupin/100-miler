import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Settings } from './Settings.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', end: true, Icon: ActivityIcon },
  { to: '/progress', label: 'Progress', end: false, Icon: ChartIcon },
]

// Responsive shell. Mobile: sticky top bar + fixed bottom tab nav, single column.
// Desktop (lg+): a left sidebar (nav + sync + settings) and a wide content area,
// so the dashboard reads as a panel grid instead of a stranded phone column.
export function Shell({ status, children }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const open = () => setSettingsOpen(true)

  return (
    <div className="min-h-full">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-bg p-5 lg:flex">
        <Wordmark />
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ to, label, end, Icon }) => (
            <NavLink key={to} to={to} end={end} className={sideLink}>
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
          {status}
          <SettingsButton onClick={open} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Wordmark />
          <span className="flex items-center gap-3">
            {status}
            <SettingsButton onClick={open} />
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="lg:pl-60">
        <div className="mx-auto w-full max-w-md px-4 pb-28 pt-4 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom tab nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg lg:hidden">
        <div className="mx-auto flex max-w-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {NAV.map(({ to, label, end, Icon }) => (
            <NavLink key={to} to={to} end={end} className={tabClass}>
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-[3px] bg-accent" />
      <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted">
        100 Mile Project
      </span>
    </span>
  )
}

function SettingsButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Settings"
      className="text-faint transition-colors hover:text-muted"
    >
      <GearIcon />
    </button>
  )
}

function sideLink({ isActive }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
    isActive ? 'bg-surface text-accent' : 'text-faint hover:bg-surface hover:text-muted'
  }`
}

function tabClass({ isActive }) {
  return `flex flex-1 flex-col items-center gap-1 py-2.5 font-mono text-[0.625rem] uppercase tracking-wider transition-colors duration-150 ${
    isActive ? 'text-accent' : 'text-faint'
  }`
}

function ActivityIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12h3l2.5-7 4 14 2.5-7H21"
        stroke="currentColor"
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChartIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="4" height="8" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="6" width="4" height="13" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" />
      <rect x="16" y="9" width="4" height="10" rx="1" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
