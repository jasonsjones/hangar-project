import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from './Navbar'
import type { AuthState } from './useAuth'

vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from './useAuth'
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
  it('renders the brand link to home', () => {
    mockUseAuth.mockReturnValue({ user: null } satisfies AuthState)
    renderNav()

    expect(
      screen.getByRole('link', { name: /hangar 1000/i }),
    ).toHaveAttribute('href', '/')
    expect(screen.queryByRole('link', { name: /^status$/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /^users$/i })).toBeNull()
  })

  it('shows Sign in and Create account when signed out', () => {
    mockUseAuth.mockReturnValue({ user: null } satisfies AuthState)
    renderNav()

    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(
      screen.getByRole('link', { name: /create account/i }),
    ).toHaveAttribute('href', '/register')
    expect(
      screen.queryByRole('button', { name: /sign out/i }),
    ).not.toBeInTheDocument()
  })

  it('shows the user name and Sign out button when signed in', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'ada@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
      },
    } satisfies AuthState)
    renderNav()

    expect(screen.getByText(/ada lovelace/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /sign in/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /create account/i }),
    ).not.toBeInTheDocument()
  })
})
