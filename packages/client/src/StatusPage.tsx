import { useEffect, useState } from 'react'


interface StatusResponse {
  status: string
}

export function StatusPage() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking')

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

  const statusDotClasses = {
    checking:
      'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse-checking',
    ok: 'bg-green-500 shadow-[0_0_24px_rgba(34,197,94,0.6)]',
    error: 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]',
  }

  const pulseClasses =
    status === 'ok'
      ? 'border-2 border-green-500/40 animate-pulse-ok'
      : 'border-0 opacity-0'

  const buildDateFormatted = new Date(import.meta.env.VITE_BUILD_DATE as string).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  )

  return (
    <div className="status-page-bg min-h-screen flex flex-col items-center justify-start p-8">
      <div className="max-w-96 w-full p-10 text-center rounded-2xl border backdrop-blur-xl bg-white/85 border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-slate-800/60 dark:border-slate-600/50 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6">
          <div
            className={`absolute -inset-2 rounded-full opacity-0 ${pulseClasses}`}
            aria-hidden
          />
          <div
            className={`relative z-10 w-4 h-4 rounded-full transition-all duration-300 ${statusDotClasses[status]}`}
          />
        </div>
        <h1 className="m-0 mb-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {status === 'checking' && 'Checking server…'}
          {status === 'ok' && 'Server online'}
          {status === 'error' && 'Server offline'}
        </h1>
        <p className="m-0 text-[0.9375rem] leading-normal text-slate-500 dark:text-slate-400">
          {status === 'checking' &&
            'Establishing connection to the API server.'}
          {status === 'ok' &&
            'The server is up and running. All systems operational.'}
          {status === 'error' &&
            'Unable to reach the server. It may be down or unreachable.'}
        </p>
      </div>
      <footer className="mt-4 text-xs text-slate-400/60 dark:text-slate-600 tabular-nums">
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
    </div>
  );
}
