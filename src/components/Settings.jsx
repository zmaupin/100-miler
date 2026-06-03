import { useEffect, useState } from 'react'
import { Label } from './ui.jsx'
import { getSettings, setSettings } from '../lib/profile.js'
import { isConnected, disconnect, buildAuthorizeUrl } from '../lib/stravaAuth.js'
import { syncActivities } from '../lib/stravaSync.js'
import { storage } from '../lib/storage.js'

const HR_MIN = 120
const HR_MAX = 220

// Settings live in a bottom-sheet modal (not a route). Changes that ripple through
// computed views (zones, weekday target, start date) persist then reload — cheap and
// reliable for a rarely-touched panel with no global store.
export function Settings({ onClose }) {
  const initial = getSettings()
  const [maxHR, setMaxHR] = useState(initial.maxHR)
  const [trainingStartDate, setStart] = useState(initial.trainingStartDate)
  const [weekdayRunTarget, setTarget] = useState(initial.weekdayRunTarget)
  const [busy, setBusy] = useState(false)

  // Dismiss on Escape; lock background scroll while open.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const hrNum = Number(maxHR)
  const hrValid = Number.isFinite(hrNum) && hrNum >= HR_MIN && hrNum <= HR_MAX
  const z2min = hrValid ? Math.round(hrNum * 0.6) : '—'
  const z2max = hrValid ? Math.round(hrNum * 0.8) : '—'
  const lastSyncAt = storage.get('lastSyncAt')

  function save() {
    if (!hrValid) return
    setSettings({
      maxHR: hrNum,
      zone2Min: Math.round(hrNum * 0.6),
      zone2Max: Math.round(hrNum * 0.8),
      zone2Override: hrNum !== initial.maxHR,
      trainingStartDate,
      weekdayRunTarget: Number(weekdayRunTarget),
    })
    window.location.reload()
  }

  async function syncNow() {
    setBusy(true)
    try {
      await syncActivities()
      window.location.reload()
    } catch {
      setBusy(false)
    }
  }

  function reconnect() {
    disconnect()
    window.location.href = buildAuthorizeUrl()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs uppercase tracking-wide text-faint hover:text-muted"
          >
            Close
          </button>
        </div>

        <section className="mt-5">
          <Label>Strava</Label>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted">
              <span className={`h-2 w-2 rounded-full ${isConnected() ? 'bg-good' : 'bg-bad'}`} />
              {isConnected() ? 'Connected' : 'Not connected'}
            </span>
            <span className="font-mono text-[0.625rem] text-faint">
              {lastSyncAt ? `synced ${new Date(lastSyncAt).toLocaleString()}` : 'never synced'}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={syncNow}
              disabled={busy || !isConnected()}
              className="rounded-lg border border-line py-2 text-sm text-ink transition-colors hover:border-faint disabled:opacity-50"
            >
              {busy ? 'Syncing…' : 'Sync now'}
            </button>
            <button
              type="button"
              onClick={reconnect}
              className="rounded-lg border border-line py-2 text-sm text-ink transition-colors hover:border-faint"
            >
              Reconnect
            </button>
          </div>
        </section>

        <section className="mt-6">
          <Label>Max heart rate</Label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              min={HR_MIN}
              max={HR_MAX}
              value={maxHR}
              aria-invalid={!hrValid}
              onChange={(e) => setMaxHR(e.target.value)}
              className={`w-24 rounded-lg border bg-surface-2 px-3 py-2 tnum text-ink focus:outline-none ${
                hrValid ? 'border-line focus:border-accent' : 'border-bad focus:border-bad'
              }`}
            />
            <span className="text-sm text-muted">
              Zone 2 = <span className="tnum text-ink">{z2min}–{z2max}</span> bpm
            </span>
          </div>
          <p className={`mt-2 text-xs ${hrValid ? 'text-faint' : 'text-bad'}`}>
            {hrValid
              ? 'Update after a field test once you have a watch.'
              : `Enter a value between ${HR_MIN} and ${HR_MAX}.`}
          </p>
        </section>

        <section className="mt-6">
          <Label>Training start</Label>
          <input
            type="date"
            value={trainingStartDate}
            onChange={(e) => setStart(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-ink focus:border-accent focus:outline-none"
          />
        </section>

        <section className="mt-6">
          <Label>Weekday run target</Label>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4].map((n) => {
              const active = Number(weekdayRunTarget) === n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTarget(n)}
                  className={`h-10 w-10 rounded-lg border font-semibold tnum transition-colors ${
                    active ? 'border-accent text-accent' : 'border-line text-muted hover:border-faint'
                  }`}
                  style={active ? { background: 'color-mix(in oklch, var(--accent) 12%, transparent)' } : undefined}
                >
                  {n}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-faint">
            Plus 1 long run = {Number(weekdayRunTarget) + 1} planned runs/week. Drives the streak.
          </p>
        </section>

        <button
          type="button"
          onClick={save}
          disabled={!hrValid}
          className="mt-7 w-full rounded-lg bg-accent py-3 font-bold text-white transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  )
}
