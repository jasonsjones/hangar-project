export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface AuthState {
  user: User | null
}

export function useAuth(): AuthState {
  return { user: null }
}
