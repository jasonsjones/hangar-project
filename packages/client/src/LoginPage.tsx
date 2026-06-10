import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth-context'

interface LoginApiResponse {
  userId: string
  email: string
  firstName: string
  lastName: string
  token: string
}

interface FormState {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {}
  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  if (!values.password) {
    errors.password = 'Password is required.'
  }
  return errors
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [values, setValues] = useState<FormState>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submit, setSubmit] = useState<SubmitState>({ kind: 'idle' })

  const setField = <K extends keyof FormState>(key: K, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    }
    if (submit.kind === 'error' || submit.kind === 'success') {
      setSubmit({ kind: 'idle' })
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmit({ kind: 'submitting' })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
        }),
      })
      if (!response.ok) {
        let message = 'Unable to log in. Please try again.'
        if (response.status === 401) {
          message = 'Email or password is incorrect.'
        } else if (response.status === 400) {
          message = 'Some of the information you provided is invalid.'
        }
        setSubmit({ kind: 'error', message })
        return
      }
      const data = (await response.json()) as LoginApiResponse
      // Normalize the API's `userId` to the `id` our User shape uses everywhere else.
      login(data.token, {
        id: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      setSubmit({ kind: 'success' })
      setValues({ email: '', password: '' })
      setTimeout(() => navigate('/'), 1500)
    } catch {
      setSubmit({
        kind: 'error',
        message: 'Network error. Please check your connection and try again.',
      })
    }
  }

  const inputClass = (hasError: boolean) =>
    [
      'w-full rounded-lg border bg-white/80 dark:bg-slate-900/60 px-3.5 py-2.5 text-base',
      'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
      'shadow-sm transition focus:outline-none focus:ring-2',
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50'
        : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900/40',
    ].join(' ')

  return (
    <div className="status-page-bg flex-1 flex flex-col items-center justify-start p-8">
      <div className="w-full max-w-2xl p-10 sm:p-12 rounded-2xl border backdrop-blur-xl bg-white/85 border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-slate-800/60 dark:border-slate-600/50 dark:shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="mb-8 text-center">
          <h1 className="m-0 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Log In
          </h1>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            Welcome back to Hangar 1000.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate aria-label="Log in">
          <div className="grid gap-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                className={inputClass(Boolean(errors.email))}
                aria-invalid={Boolean(errors.email) || undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) => setField('password', e.target.value)}
                className={inputClass(Boolean(errors.password))}
                aria-invalid={Boolean(errors.password) || undefined}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {submit.kind === 'error' && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-base text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300"
            >
              {submit.message}
            </div>
          )}
          {submit.kind === 'success' && (
            <div
              role="status"
              className="mt-6 rounded-lg border border-green-300 bg-green-50 px-4 py-2.5 text-base text-green-700 dark:border-green-800/60 dark:bg-green-950/40 dark:text-green-300"
            >
              Logged in. Redirecting…
            </div>
          )}

          <button
            type="submit"
            disabled={submit.kind === 'submitting'}
            className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-900/50"
          >
            {submit.kind === 'submitting' ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Need an account?{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
