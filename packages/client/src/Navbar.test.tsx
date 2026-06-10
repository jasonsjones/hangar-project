import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from './Navbar'
import type { AuthState } from './auth-context'

vi.mock('./auth-context', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from './auth-context'
const mockUseAuth = vi.mocked(useAuth)

function renderNav(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>,
  )
}

afterEach(() => {
  mockUseAuth.mockReset()
})

describe('Navbar', () => {
  const loggedOut: AuthState = {
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
  }

  it('renders the brand link to home', () => {
    mockUseAuth.mockReturnValue(loggedOut)
    renderNav()

    expect(
      screen.getByRole('link', { name: /hangar 1000/i }),
    ).toHaveAttribute('href', '/')
    expect(screen.queryByRole('link', { name: /^status$/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /^users$/i })).toBeNull()
  })

  it('shows Log In and Register when signed out', () => {
    mockUseAuth.mockReturnValue(loggedOut)
    renderNav()

    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute(
      'href',
      '/register',
    )
    expect(
      screen.queryByRole('button', { name: /log out/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the user name and Log Out button when signed in', async () => {
    const logout = vi.fn()
    mockUseAuth.mockReturnValue({
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
      },
      token: 'issued.jwt.token',
      login: vi.fn(),
      logout,
    } satisfies AuthState)
    renderNav()

    expect(screen.getByText(/ada lovelace/i)).toBeInTheDocument()
    const logoutButton = screen.getByRole('button', { name: /log out/i })
    expect(logoutButton).toBeInTheDocument()

    // Clicking Log Out calls into the auth context.
    await userEvent.click(logoutButton)
    expect(logout).toHaveBeenCalledOnce()
    expect(
      screen.queryByRole('link', { name: /log in/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /register/i }),
    ).not.toBeInTheDocument()
  })
})
