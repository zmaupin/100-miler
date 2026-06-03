import { useState } from 'react'
import { Shell } from '../components/Shell.jsx'
import { Panel, Label } from '../components/ui.jsx'
import { todayKey, formatShortDate } from '../lib/calendar.js'
import {
  getSessionsSorted,
  saveSession,
  deleteSession,
  sessionVolume,
  sessionSetCount,
  lastPerformance,
  cleanExercises,
} from '../lib/strength.js'

const emptyExercise = () => ({ name: '', sets: [{ reps: '', weight: '' }] })
const fmtSet = (s) => (s.weight == null ? `${s.reps}×BW` : `${s.reps}×${s.weight}`)

export default function Strength() {
  const [sessions, setSessions] = useState(() => getSessionsSorted())
  const [date, setDate] = useState(todayKey())
  const [exercises, setExercises] = useState([emptyExercise()])

  const cleaned = cleanExercises(exercises)
  const canSave = cleaned.length > 0

  function patchExercise(i, patch) {
    setExercises((xs) => xs.map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex)))
  }
  function patchSet(ei, si, patch) {
    setExercises((xs) =>
      xs.map((ex, idx) =>
        idx === ei ? { ...ex, sets: ex.sets.map((s, j) => (j === si ? { ...s, ...patch } : s)) } : ex,
      ),
    )
  }

  function save() {
    if (!canSave) return
    saveSession({ date, exercises: cleaned })
    setSessions(getSessionsSorted())
    setExercises([emptyExercise()])
    setDate(todayKey())
  }

  function remove(id) {
    if (!window.confirm('Delete this session?')) return
    deleteSession(id)
    setSessions(getSessionsSorted())
  }

  return (
    <Shell>
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-ink">Strength</h1>
        <p className="mt-0.5 text-sm text-faint">Log lifts Strava can’t see: sets, reps, weight.</p>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {/* Log form */}
        <Panel>
          <div className="flex items-center justify-between">
            <Label>New session</Label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-line bg-surface-2 px-2 py-1 text-sm text-ink focus:border-accent focus:outline-none"
            />
          </div>

          <div className="mt-3 space-y-4">
            {exercises.map((ex, ei) => {
              const last = lastPerformance(sessions, ex.name, date)
              return (
                <div key={ei} className="rounded-lg bg-surface-2 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => patchExercise(ei, { name: e.target.value })}
                      placeholder="Exercise (e.g. Back Squat)"
                      className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 font-medium text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                    />
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setExercises((xs) => xs.filter((_, i) => i !== ei))}
                        className="shrink-0 px-1 font-mono text-xs text-faint hover:text-bad"
                        aria-label="Remove exercise"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {last && (
                    <div className="mt-1.5 font-mono text-[0.625rem] text-faint">
                      LAST {formatShortDate(last.date)}: {last.sets.map(fmtSet).join(' · ')}
                    </div>
                  )}

                  <div className="mt-2 space-y-1.5">
                    <div className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] items-center gap-2 px-1">
                      <span />
                      <span className="label">Reps</span>
                      <span className="label">Weight</span>
                      <span />
                    </div>
                    {ex.sets.map((set, si) => (
                      <div key={si} className="grid grid-cols-[1.5rem_1fr_1fr_1.5rem] items-center gap-2">
                        <span className="text-center font-mono text-xs text-faint">{si + 1}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={set.reps}
                          onChange={(e) => patchSet(ei, si, { reps: e.target.value })}
                          placeholder="—"
                          className="w-full rounded-lg border border-line bg-bg px-3 py-2 tnum text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                        />
                        <input
                          type="number"
                          inputMode="decimal"
                          value={set.weight}
                          onChange={(e) => patchSet(ei, si, { weight: e.target.value })}
                          placeholder="BW"
                          className="w-full rounded-lg border border-line bg-bg px-3 py-2 tnum text-ink placeholder:text-faint focus:border-accent focus:outline-none"
                        />
                        {ex.sets.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              patchExercise(ei, { sets: ex.sets.filter((_, j) => j !== si) })
                            }
                            className="font-mono text-xs text-faint hover:text-bad"
                            aria-label="Remove set"
                          >
                            ✕
                          </button>
                        ) : (
                          <span />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => patchExercise(ei, { sets: [...ex.sets, { reps: '', weight: '' }] })}
                    className="mt-2 font-mono text-[0.625rem] uppercase tracking-wide text-accent"
                  >
                    + Set
                  </button>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setExercises((xs) => [...xs, emptyExercise()])}
            className="mt-3 w-full rounded-lg border border-line py-2 font-mono text-[0.625rem] uppercase tracking-wide text-muted transition-colors hover:border-faint"
          >
            + Exercise
          </button>

          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="mt-3 w-full rounded-lg bg-accent py-3 font-bold text-white transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-50"
          >
            Save session
          </button>
        </Panel>

        {/* History */}
        <Panel className="p-0">
          <div className="px-4 pt-4">
            <Label>History</Label>
          </div>
          {sessions.length === 0 ? (
            <p className="px-4 pb-4 pt-2 text-sm text-faint">No sessions yet. Log your first lift.</p>
          ) : (
            <ul className="mt-1 divide-y divide-line">
              {sessions.map((s) => (
                <li key={s.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-ink">{formatShortDate(s.date)}</span>
                    <span className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-wide text-faint">
                      {sessionSetCount(s)} sets · {sessionVolume(s).toLocaleString()} vol
                      <button
                        type="button"
                        onClick={() => remove(s.id)}
                        className="text-faint hover:text-bad"
                        aria-label="Delete session"
                      >
                        ✕
                      </button>
                    </span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {s.exercises.map((ex, i) => (
                      <div key={i} className="text-sm text-muted">
                        <span className="text-ink">{ex.name}</span>{' '}
                        <span className="font-mono text-xs text-faint">{ex.sets.map(fmtSet).join(' · ')}</span>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </Shell>
  )
}
