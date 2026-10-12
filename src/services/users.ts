import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, patch, post } from '../lib/api'
import type { CheckIn, Consent, MoodLevel, User, WellbeingTrend } from '../types'

export const userKeys = {
  all: ['users'] as const,
  me: ['me'] as const,
  checkIns: ['check-ins'] as const,
  wellbeing: ['wellbeing-trend'] as const,
  onboarding: ['onboarding-status'] as const,
}

export function useProfileUpdate() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => patch<{ user: User }>('/users/me', body),
  })
}

export function useConsent() {
  return useMutation({
    mutationFn: () => post<{ consent: Consent }>('/users/onboarding/consent'),
  })
}

export function usePreferences() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => post<{ preferences: Record<string, unknown> }>('/users/onboarding/preferences', body),
  })
}

export function useAssessmentSubmit() {
  return useMutation({
    mutationFn: (body: { answers: Record<string, unknown>; responses?: { questionId: string; value: unknown }[]; summary?: string; safetyFlag?: boolean; safetyNote?: string }) =>
      post<{ assessment: { id: string; summary?: string; safetyFlag: boolean } }>('/users/onboarding/assessment', body),
  })
}

export function useOnboardingStatus() {
  return useQuery({
    queryKey: userKeys.onboarding,
    queryFn: () => get<{ status: User['onboarding']; complete: boolean }>('/users/onboarding/status'),
    staleTime: 30_000,
  })
}

export interface CheckInInput {
  mood: MoodLevel
  factors?: string[]
  note?: string
}

export function useCheckIns() {
  return useQuery({
    queryKey: userKeys.checkIns,
    queryFn: () => get<{ checkIns: CheckIn[] }>('/users/check-ins'),
  })
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CheckInInput) => post<{ checkIn: CheckIn }>('/users/check-ins', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.checkIns })
      void queryClient.invalidateQueries({ queryKey: userKeys.wellbeing })
    },
  })
}

export function useWellbeingTrend() {
  return useQuery({
    queryKey: userKeys.wellbeing,
    queryFn: () => get<WellbeingTrend>('/users/wellbeing/trend'),
  })
}