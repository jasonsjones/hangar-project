import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface FormState {
  email: string
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  email?: string
  firstName?: string
  lastName?: string
  password?: string
  confirmPassword?: string
}

const PASSWORD_MIN = 8

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
  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required.'
  }
  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required.'
  }
  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < PASSWORD_MIN) {
    errors.password = `Password must be at least ${PASSWORD_MIN} characters.`
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (values.password && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }
  return errors
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState<FormState>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })
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
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email.trim(),
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          password: values.password,
        }),
      })
      if (!response.ok) {
        let message = 'Unable to register. Please try again.'
        if (response.status === 409) {
          message = 'An account with that email already exists.'
        } else if (response.status === 400) {
          message = 'Some of the information you provided is invalid.'
        }
        setSubmit({ kind: 'error', message })
        return
      }
      setSubmit({ kind: 'success' })
      setValues({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
      })
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
            Create your account
          </h1>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            Register to get started with Hangar 1000.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate aria-label="Register">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={values.firstName}
                onChange={(e) => setField('firstName', e.target.value)}
                className={inputClass(Boolean(errors.firstName))}
                aria-invalid={Boolean(errors.firstName) || undefined}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && (
                <p
                  id="firstName-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={values.lastName}
                onChange={(e) => setField('lastName', e.target.value)}
                className={inputClass(Boolean(errors.lastName))}
                aria-invalid={Boolean(errors.lastName) || undefined}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <p
                  id="lastName-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.lastName}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
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

            <div className="sm:col-span-2">
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
                autoComplete="new-password"
                value={values.password}
                onChange={(e) => setField('password', e.target.value)}
                className={inputClass(Boolean(errors.password))}
                aria-invalid={Boolean(errors.password) || undefined}
                aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              />
              {errors.password ? (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.password}
                </p>
              ) : (
                <p
                  id="password-hint"
                  className="mt-1.5 text-sm text-slate-500 dark:text-slate-400"
                >
                  At least {PASSWORD_MIN} characters.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
                className={inputClass(Boolean(errors.confirmPassword))}
                aria-invalid={Boolean(errors.confirmPassword) || undefined}
                aria-describedby={
                  errors.confirmPassword ? 'confirmPassword-error' : undefined
                }
              />
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  role="alert"
                  className="mt-1.5 text-sm text-red-600 dark:text-red-400"
                >
                  {errors.confirmPassword}
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
              Account created. Redirecting…
            </div>
          )}

          <button
            type="submit"
            disabled={submit.kind === 'submitting'}
            className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-900/50"
          >
            {submit.kind === 'submitting' ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  )
}
