import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from './RegisterPage'
import { AuthProvider } from './useAuth'

function renderPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/register']}>
        <RegisterPage />
      </MemoryRouter>
    </AuthProvider>,
  )
}

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('RegisterPage', () => {
  it('renders all required form fields', () => {
    renderPage()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows required-field errors when submitting an empty form', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(
      screen.getByText(/please confirm your password/i),
    ).toBeInTheDocument()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('shows a min-length error when the password is too short', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/first name/i), 'Ada')
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'short')
    await user.type(screen.getByLabelText(/confirm password/i), 'short')
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('shows a mismatch error when confirm password differs', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/first name/i), 'Ada')
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'correcthorse')
    await user.type(screen.getByLabelText(/confirm password/i), 'correctmoose')
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('shows an invalid-email error for malformed emails', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/first name/i), 'Ada')
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(
      screen.getByText(/please enter a valid email address/i),
    ).toBeInTheDocument()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('clears a field error once the user edits the field', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /register/i }))
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/email/i), 'a')
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
  })

  it('submits valid data to /api/users and shows success feedback', async () => {
    const fetchMock = vi.mocked(globalThis.fetch)
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'ada@example.com',
            firstName: 'Ada',
            lastName: 'Lovelace',
          },
          token: 'issued.jwt.token',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/first name/i), 'Ada')
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'correcthorse')
    await user.type(screen.getByLabelText(/confirm password/i), 'correcthorse')
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/users')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      password: 'correcthorse',
    })

    expect(await screen.findByText(/account created/i)).toBeInTheDocument()
    // Registration logs you straight in — the token is persisted.
    expect(localStorage.getItem('hangar.auth.token')).toBe('issued.jwt.token')
  })

  it('shows a duplicate-email message when the server returns 409', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(null, { status: 409 }),
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/first name/i), 'Ada')
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'correcthorse')
    await user.type(screen.getByLabelText(/confirm password/i), 'correcthorse')
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(
      await screen.findByText(/account with that email already exists/i),
    ).toBeInTheDocument()
  })

  it('shows a network-error message when fetch rejects', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('boom'))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/first name/i), 'Ada')
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'correcthorse')
    await user.type(screen.getByLabelText(/confirm password/i), 'correcthorse')
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
  })
})
