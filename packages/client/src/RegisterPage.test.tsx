import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from './RegisterPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <RegisterPage />
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

describe('RegisterPage', () => {
  it('renders all required form fields', () => {
    renderPage()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
  })

  it('shows required-field errors when submitting an empty form', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
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
      new Response(JSON.stringify({ id: 'abc' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/first name/i), 'Ada')
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace')
    await user.type(screen.getByLabelText(/email/i), 'ada@example.com')
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/users')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
    })

    expect(await screen.findByText(/account created/i)).toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
  })
})
