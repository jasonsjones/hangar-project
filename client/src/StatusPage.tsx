import { useEffect, useState } from 'react'
import './StatusPage.css'

interface StatusResponse {
  status: string
}

export function StatusPage() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking')

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    fetch('/api/status', { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeout)
        if (!res.ok) throw new Error('Server error')
        return res.json() as Promise<StatusResponse>
      })
      .then((data) => {
        if (data.status === 'ok') {
          setStatus('ok')
        } else {
          setStatus('error')
        }
      })
      .catch(() => {
        clearTimeout(timeout)
        setStatus('error')
      })

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  return (
    <div className="status-page">
      <div className="status-card">
        <div className={`status-indicator ${status}`}>
          <div className="status-pulse" />
          <div className="status-dot" />
        </div>
        <h1 className="status-title">
          {status === 'checking' && 'Checking server…'}
          {status === 'ok' && 'Server online'}
          {status === 'error' && 'Server offline'}
        </h1>
        <p className="status-message">
          {status === 'checking' &&
            'Establishing connection to the API server.'}
          {status === 'ok' &&
            'The server is up and running. All systems operational.'}
          {status === 'error' &&
            'Unable to reach the server. It may be down or unreachable.'}
        </p>
      </div>
    </div>
  )
}
