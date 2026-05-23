import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt?: string
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; users: User[] }
  | { kind: 'error'; message: string }

type DeleteState =
  | { kind: 'idle' }
  | { kind: 'confirm'; user: User }
  | { kind: 'deleting'; userId: string }
  | { kind: 'error'; userId: string; message: string }

function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function UserListPage() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [deleteState, setDeleteState] = useState<DeleteState>({ kind: 'idle' })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetch('/api/users')
      .then((response) => {
        if (!response.ok) throw new Error('load failed')
        return response.json() as Promise<User[]>
      })
      .then((users) => {
        if (!cancelled) setState({ kind: 'ready', users })
      })
      .catch((error: Error) => {
        if (cancelled) return
        setState({
          kind: 'error',
          message:
            error.message === 'load failed'
              ? 'Unable to load users.'
              : 'Network error. Please check your connection and try again.',
        })
      })
    return () => {
      cancelled = true
    }
  }, [reloadCount])

  const onRetry = () => {
    setState({ kind: 'loading' })
    setReloadCount((n) => n + 1)
  }

  const onConfirmDelete = async (user: User) => {
    setDeleteState({ kind: 'deleting', userId: user.id })
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      })
      if (!response.ok && response.status !== 404) {
        setDeleteState({
          kind: 'error',
          userId: user.id,
          message: 'Unable to delete user. Please try again.',
        })
        return
      }
      setDeleteState({ kind: 'idle' })
      setState((prev) =>
        prev.kind === 'ready'
          ? { kind: 'ready', users: prev.users.filter((u) => u.id !== user.id) }
          : prev,
      )
    } catch {
      setDeleteState({
        kind: 'error',
        userId: user.id,
        message: 'Network error while deleting. Please try again.',
      })
    }
  }

  return (
    <div className="status-page-bg min-h-screen flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-5xl p-8 sm:p-10 rounded-2xl border backdrop-blur-xl bg-white/85 border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-slate-800/60 dark:border-slate-600/50 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="m-0 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Registered users
            </h1>
            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
              Manage accounts that have signed up for Hangar 1000.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-900/50"
          >
            Register new user
          </Link>
        </div>

        {state.kind === 'loading' && (
          <p
            role="status"
            className="rounded-lg border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            Loading users…
          </p>
        )}

        {state.kind === 'error' && (
          <div
            role="alert"
            className="flex items-center justify-between gap-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300"
          >
            <span>{state.message}</span>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-red-300 bg-white/70 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-white dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/70"
            >
              Retry
            </button>
          </div>
        )}

        {state.kind === 'ready' && state.users.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white/40 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
            No users have registered yet.
          </p>
        )}

        {state.kind === 'ready' && state.users.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table
              aria-label="Registered users"
              className="w-full text-left text-sm"
            >
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Joined
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white/40 dark:divide-slate-800 dark:bg-slate-900/20">
                {state.users.map((user) => {
                  const rowError =
                    deleteState.kind === 'error' &&
                    deleteState.userId === user.id
                      ? deleteState.message
                      : null
                  const isDeleting =
                    deleteState.kind === 'deleting' &&
                    deleteState.userId === user.id
                  return (
                    <tr
                      key={user.id}
                      className="text-slate-700 dark:text-slate-200"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteState({ kind: 'confirm', user })
                          }
                          disabled={isDeleting}
                          className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800/60 dark:bg-slate-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                        >
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </button>
                        {rowError && (
                          <p
                            role="alert"
                            className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                          >
                            {rowError}
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link
            to="/"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to home
          </Link>
        </p>
      </div>

      {deleteState.kind === 'confirm' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <h2
              id="confirm-delete-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-50"
            >
              Delete user?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              This will permanently delete{' '}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {deleteState.user.firstName} {deleteState.user.lastName}
              </span>{' '}
              ({deleteState.user.email}). This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteState({ kind: 'idle' })}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void onConfirmDelete(deleteState.user)}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
