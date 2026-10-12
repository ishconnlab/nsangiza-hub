import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { del, get, patch, post } from '../lib/api'
import type { Appointment, ClientSummary, FollowUp, Professional, ProfessionalDashboard } from '../types'

export const proKeys = {
  all: ['professional'] as const,
  me: ['professional', 'me'] as const,
  dashboard: ['professional', 'dashboard'] as const,
  clients: ['professional', 'clients'] as const,
  client: (id: string) => ['professional', 'client', id] as const,
}

export function useProfessionalProfile() {
  return useQuery({
    queryKey: proKeys.me,
    queryFn: () => get<{ professional: Professional }>('/professional/me'),
  })
}

export function useUpdateProfessionalProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => patch<{ professional: Professional }>('/professional/me', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: proKeys.me })
    },
  })
}

export function useSubmitProfessionalApplication() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => post<{ professional: Professional }>('/professional/me/submit'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: proKeys.me })
    },
  })
}

export function useUploadProfessionalDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ label, fileName, dataUrl }: { label: string; fileName: string; dataUrl: string }) =>
      post<{ professional: Professional }>('/professional/me/documents', { label, fileName, dataUrl }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: proKeys.me })
    },
  })
}

export function useDeleteProfessionalDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (docId: string) => del<{ professional: Professional }>(`/professional/me/documents/${docId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: proKeys.me })
    },
  })
}

export function useProfessionalDashboard() {
  return useQuery({
    queryKey: proKeys.dashboard,
    queryFn: () => get<ProfessionalDashboard>('/professional/dashboard'),
    staleTime: 30_000,
  })
}

export function useProfessionalClients() {
  return useQuery({
    queryKey: proKeys.clients,
    queryFn: () => get<{ clients: ClientSummary[] }>('/professional/clients'),
    staleTime: 60_000,
  })
}

export function useProfessionalClient(id: string) {
  return useQuery({
    queryKey: proKeys.client(id),
    queryFn: () =>
      get<{ client: { id: string; displayName: string; city: string; language: string; communicationPreference?: string }; appointments: Appointment[]; conversationId: string | null; followUps: FollowUp[] }>(
        `/professional/clients/${id}`,
      ),
    enabled: Boolean(id),
  })
}