import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


interface StatusResponse {
  status: string
}

type Status = 'checking' | 'ok' | 'error'

const STATUS_LABEL: Record<Status, string> = {
  checking: 'Checking server…',
  ok: 'Server online',
  error: 'Server offline',
}

const STATUS_DOT: Record<Status, string> = {
  checking:
    'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse-checking',
  ok: 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.55)]',
  error: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]',
}

export function StatusPage() {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    let controller: AbortController
    let timeout: ReturnType<typeof setTimeout>

    const poll = () => {
      controller = new AbortController()
      timeout = setTimeout(() => controller.abort(), 5000)

      fetch('/api/status', { signal: controller.signal })
        .then((res) => {
          clearTimeout(timeout)
          if (!res.ok) throw new Error('Server error')
          return res.json() as Promise<StatusResponse>
        })
        .then((data) => {
          setStatus(data.status === 'ok' ? 'ok' : 'error')
        })
        .catch(() => {
          clearTimeout(timeout)
          setStatus('error')
        })
    }

    poll()
    const intervalId = setInterval(poll, 5000)

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeout)
      controller?.abort()
    }
  }, [])

  const buildDateFormatted = new Date(import.meta.env.VITE_BUILD_DATE as string).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  )

  return (
    <div className="status-page-bg flex-1 flex flex-col items-center justify-center p-8">
      <main className="w-full max-w-xl text-center">
        <h1 className="m-0 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Welcome to Hangar 1000
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Your private workspace for projects.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-900/50"
          >
            Create an account
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white/80 px-6 py-3 text-base font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Sign in
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white/80 px-6 py-3 text-base font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            View users
          </Link>
        </div>

        <div
          className="mt-16 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
          role="status"
          aria-live="polite"
        >
          <span
            className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${STATUS_DOT[status]}`}
            aria-hidden
          />
          <span>{STATUS_LABEL[status]}</span>
        </div>

        <footer className="mt-3 text-xs text-slate-400/70 dark:text-slate-600 tabular-nums">
          {'Build: '}
          <a
            href={`https://github.com/jasonsjones/hangar-project/commit/${import.meta.env.VITE_BUILD_COMMIT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-slate-400 dark:hover:text-slate-500 transition-colors"
          >
            {import.meta.env.VITE_BUILD_COMMIT as string}
          </a>
          {` (${buildDateFormatted})`}
        </footer>
      </main>
    </div>
  );
}
