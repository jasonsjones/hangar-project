import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>,
  )
}

const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  globalThis.fetch = originalFetch
  vi.restoreAllMocks()
})

describe('LoginPage', () => {
  it('renders email, password, and submit', () => {
    renderPage()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows required-field errors when submitting an empty form', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('shows an invalid-email error for malformed emails', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/password/i), 'anything')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(
      screen.getByText(/please enter a valid email address/i),
    ).toBeInTheDocument()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('clears a field error once the user edits the field', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /log in/i }))
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/email/i), 'a')
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
  })

  it('submits to /api/auth/login and shows success feedback', async () => {
    const fetchMock = vi.mocked(globalThis.fetch)
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          userId: '00000000-0000-0000-0000-000000000001',
          email: 'ada@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'correcthorse')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/auth/login')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      email: 'ada@example.com',
      password: 'correcthorse',
    })

    expect(await screen.findByText(/logged in/i)).toBeInTheDocument()
  })

  it('shows the sanitized error message when the server returns 401', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce(
      new Response(null, { status: 401 }),
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpw')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(
      await screen.findByText(/email or password is incorrect/i),
    ).toBeInTheDocument()
  })

  it('shows a network-error message when fetch rejects', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('boom'))
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.type(screen.getByLabelText(/password/i), 'correcthorse')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
  })
})
