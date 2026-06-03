import { Link } from 'react-router-dom'

export default function Progress() {
  return (
    <main className="mx-auto max-w-md p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Progress</h1>
        <Link to="/" className="text-sm text-neutral-400 underline">
          Dashboard
        </Link>
      </header>
      <p className="mt-4 text-sm text-neutral-500">
        Charts come online next — aerobic efficiency first.
      </p>
    </main>
  )
}
