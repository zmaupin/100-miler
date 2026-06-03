import { useState } from 'react'
import { Panel, Label } from './ui.jsx'
import { LEVELS } from '../lib/constants.js'
import { getExitCriteria, setExitCriterion, getLevelHistory } from '../lib/profile.js'

const CRITERIA = [
  { key: 'zone2', label: 'Full sessions staying in Zone 2' },
  { key: 'recovery', label: 'Legs recovered between runs' },
  { key: 'noPain', label: 'No joint or shin pain' },
]

// Collapsible at the bottom of the dashboard. Phase auto-detects from the date, so
// only the level is manual: selector (confirm), exit-criteria checklist, history.
export function LevelManager({ levelId, onChangeLevel }) {
  const [open, setOpen] = useState(false)
  const [criteria, setCriteria] = useState(() => getExitCriteria(levelId))
  const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0]
  const canAdvance = CRITERIA.every((c) => criteria[c.key]) && levelId < LEVELS.length

  function toggle(key) {
    const next = { ...criteria, [key]: !criteria[key] }
    setCriteria(next)
    setExitCriterion(levelId, key, next[key])
  }

  function changeTo(id) {
    if (id === levelId) return
    if (!window.confirm(`Switch to Level ${id} — ${LEVELS.find((l) => l.id === id).name}?`)) return
    onChangeLevel(id)
    setCriteria(getExitCriteria(id))
  }

  return (
    <Panel className="p-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-4"
      >
        <span className="text-left">
          <span className="label block text-faint">Phase &amp; Level</span>
          <span className="mt-1 block font-semibold text-ink">
            Level {level.id} · {level.name}
          </span>
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-line px-4 py-4">
          <div className="grid grid-cols-4 gap-2">
            {LEVELS.map((l) => {
              const active = l.id === levelId
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => changeTo(l.id)}
                  className={`rounded-lg border py-2 text-center transition-colors ${
                    active ? 'border-accent text-accent' : 'border-line text-muted hover:border-faint'
                  }`}
                  style={
                    active ? { background: 'color-mix(in oklch, var(--accent) 12%, transparent)' } : undefined
                  }
                >
                  <div className="font-mono text-xs font-semibold">L{l.id}</div>
                  <div className="font-mono text-[0.625rem] text-faint">{l.longRunMin}m</div>
                </button>
              )
            })}
          </div>

          <div>
            <Label>Exit criteria · L{level.id}</Label>
            <ul className="mt-2 space-y-2.5">
              {CRITERIA.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => toggle(c.key)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                        criteria[c.key] ? 'border-good bg-good text-bg' : 'border-line text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="text-sm text-muted">{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {canAdvance && (
            <button
              type="button"
              onClick={() => changeTo(levelId + 1)}
              className="w-full rounded-lg bg-accent py-2.5 font-bold text-white transition-transform duration-150 ease-out active:scale-[0.98]"
            >
              Ready — advance to Level {levelId + 1}
            </button>
          )}

          <div>
            <Label>History</Label>
            <ul className="mt-2 space-y-1 font-mono text-xs text-faint">
              {getLevelHistory().map((h, i) => (
                <li key={i}>
                  L{h.level} <span className="text-muted">·</span> {h.enteredDate}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Panel>
  )
}

function Chevron({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 text-faint transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
