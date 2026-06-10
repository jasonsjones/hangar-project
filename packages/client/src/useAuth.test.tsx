import { act, render, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AuthProvider } from './useAuth'
import { useAuth } from './auth-context'
import type { ReactNode } from 'react'

const TOKEN_KEY = 'hangar.auth.token'
const USER_KEY = 'hangar.auth.user'

const SAMPLE_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
}

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('useAuth', () => {
  it('starts logged out when storage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('login persists the token and user, then logout clears them', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => result.current.login('issued.jwt.token', SAMPLE_USER))
    expect(result.current.token).toBe('issued.jwt.token')
    expect(result.current.user).toEqual(SAMPLE_USER)
    expect(localStorage.getItem(TOKEN_KEY)).toBe('issued.jwt.token')

    act(() => result.current.logout())
    expect(result.current.token).toBeNull()
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(USER_KEY)).toBeNull()
  })

  it('rehydrates an existing session from storage on mount', () => {
    localStorage.setItem(TOKEN_KEY, 'persisted.jwt.token')
    localStorage.setItem(USER_KEY, JSON.stringify(SAMPLE_USER))

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.token).toBe('persisted.jwt.token')
    expect(result.current.user).toEqual(SAMPLE_USER)
  })

  it('treats corrupt stored user JSON as logged out without crashing', () => {
    localStorage.setItem(TOKEN_KEY, 'persisted.jwt.token')
    localStorage.setItem(USER_KEY, '{ not valid json')

    const { result } = renderHook(() => useAuth(), { wrapper })
    // Token still loads; the unparseable user falls back to null.
    expect(result.current.token).toBe('persisted.jwt.token')
    expect(result.current.user).toBeNull()
  })

  it('throws if used outside an AuthProvider', () => {
    function Bare() {
      useAuth()
      return null
    }
    // React logs the error to the console; we only care that it throws.
    expect(() => render(<Bare />)).toThrow(/must be used within an AuthProvider/i)
  })
})
