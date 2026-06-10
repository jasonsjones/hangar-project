import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider, RequireAuth } from './useAuth'

/**
 * Renders a tiny two-route app (a guarded /admin page and a /login landing) so we
 * can assert what RequireAuth does based on whether a token is in storage.
 */
function renderGuarded() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <div>secret admin content</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('RequireAuth', () => {
  it('redirects to /login when there is no token', () => {
    renderGuarded()
    expect(screen.getByText(/login page/i)).toBeInTheDocument()
    expect(screen.queryByText(/secret admin content/i)).not.toBeInTheDocument()
  })

  it('renders the guarded content when a token is present', () => {
    localStorage.setItem('hangar.auth.token', 'test.jwt.token')
    renderGuarded()
    expect(screen.getByText(/secret admin content/i)).toBeInTheDocument()
    expect(screen.queryByText(/login page/i)).not.toBeInTheDocument()
  })
})
