import { createContext, useContext } from 'react'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface AuthState {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
}

// Keys under which we persist the session. localStorage is readable by any script
// on the page, so a successful XSS would expose this token — the accepted tradeoff
// for a client-only PR. The genuinely-secure alternative is an httpOnly cookie set
// by the server (plus CSRF handling), which is server work we haven't done. Keep
// token lifetimes short server-side to limit the blast radius.
export const TOKEN_KEY = 'hangar.auth.token'
export const USER_KEY = 'hangar.auth.user'

export const AuthContext = createContext<AuthState | undefined>(undefined)

/** Reads any persisted session out of localStorage at startup. */
export function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    // Corrupt/hand-edited storage — treat as logged out rather than crashing.
    return null
  }
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
