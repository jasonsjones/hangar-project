import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import {
  AuthContext,
  TOKEN_KEY,
  USER_KEY,
  readStoredUser,
  useAuth,
  type AuthState,
  type User,
} from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializers so we touch localStorage once on mount, not every render.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [user, setUser] = useState<User | null>(() => readStoredUser())

  const login = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  // Memoize so consumers don't re-render on every provider render — only when the
  // session actually changes.
  const value = useMemo<AuthState>(
    () => ({ user, token, login, logout }),
    [user, token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Route guard: renders its children only when a token is present, otherwise
 * redirects to /login. `replace` keeps the protected URL out of history so the
 * back button doesn't bounce the user straight back to the guarded page.
 *
 * This is a UX gate, not a security boundary — the server is the real authority
 * and will 401 a tokenless request regardless. It just spares a logged-out user
 * a guaranteed-failed fetch and a broken-looking page.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
