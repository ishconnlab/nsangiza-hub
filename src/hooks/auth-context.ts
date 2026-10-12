import { createContext, useContext } from 'react'
import type { User } from '../types'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  onboardingComplete: boolean
  login: (email: string, password: string) => Promise<User>
  register: (input: {
    email: string
    password: string
    displayName: string
    role?: 'USER' | 'PROFESSIONAL'
    consent?: boolean
  }) => Promise<User>
  logout: () => Promise<void>
  setMe: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
