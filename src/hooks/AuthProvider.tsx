import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, type ReactNode } from 'react'
import { apiRequest, ApiError, getAccessToken, setAccessToken } from '../lib/api'
import { queryClient } from '../lib/queryClient'
import type { User } from '../types'
import { AuthContext, type AuthContextValue } from './auth-context'

interface AuthResult {
  user: User
  accessToken: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClientInstance = useQueryClient()

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<User | null> => {
      if (!getAccessToken()) return null
      try {
        const res = await apiRequest<{ user: User }>('/auth/me')
        return res.data.user
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setAccessToken(null)
          return null
        }
        const cached = queryClient.getQueryData<User | null>(['me'])
        if (cached) return cached
        throw err
      }
    },
    staleTime: 60_000,
  })

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiRequest<AuthResult>('/auth/login', { method: 'POST', body: { email, password } })
      setAccessToken(res.data.accessToken)
      queryClient.setQueryData(['me'], res.data.user)
      return res.data.user
    },
    [],
  )

  const register = useCallback(
    async (input: { email: string; password: string; displayName: string; role?: 'USER' | 'PROFESSIONAL'; consent?: boolean }) => {
      const res = await apiRequest<AuthResult>('/auth/register', { method: 'POST', body: input })
      setAccessToken(res.data.accessToken)
      queryClient.setQueryData(['me'], res.data.user)
      return res.data.user
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch {
      // ignore network errors on logout
    }
    setAccessToken(null)
    queryClient.setQueryData(['me'], null)
    queryClient.clear()
  }, [])

  const setMe = useCallback(
    (user: User) => queryClientInstance.setQueryData(['me'], user),
    [queryClientInstance],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      isLoading: meQuery.isLoading,
      isAuthenticated: Boolean(meQuery.data),
      onboardingComplete: Boolean(
        meQuery.data && meQuery.data.onboarding.consentSeen && meQuery.data.onboarding.preferencesComplete && meQuery.data.onboarding.assessmentComplete,
      ),
      login,
      register,
      logout,
      setMe,
    }),
    [meQuery.data, meQuery.isLoading, login, register, logout, setMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
