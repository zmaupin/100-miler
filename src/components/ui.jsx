// Shared dashboard primitives. Dark, high-contrast, data-forward.

export function Card({ title, children }) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      {title && (
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
          {title}
        </h2>
      )}
      <div className={title ? 'mt-2' : ''}>{children}</div>
    </section>
  )
}

const DOT = {
  in: 'bg-green-500',
  border: 'bg-yellow-500',
  over: 'bg-red-500',
  'no-data': 'bg-neutral-600',
}

// Zone 2 compliance dot: green in-zone / yellow under (too easy) / red over / gray no-data.
export function Zone2Dot({ state }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${DOT[state] || DOT['no-data']}`} />
}

export function Stat({ label, value }) {
  return (
    <div>
      <div className="text-3xl font-bold tabular-nums tracking-tight text-neutral-100">{value}</div>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  )
}
