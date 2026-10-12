import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { del, get, patch, post } from '../lib/api'
import type { AdminDashboard, AdminProfessionalRow, AdminUserRow, Resource, SafeguardingCase } from '../types'

export const adminKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  users: ['admin', 'users'] as const,
  professionals: ['admin', 'professionals'] as const,
  pending: ['admin', 'professionals', 'pending'] as const,
  safeguarding: ['admin', 'safeguarding'] as const,
  resources: ['admin', 'resources'] as const,
  reports: ['admin', 'reports'] as const,
  logs: ['admin', 'logs'] as const,
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: () => get<AdminDashboard>('/admin/dashboard'),
  })
}

export function useAdminUsers(params: { q?: string; role?: string; page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: [...adminKeys.users, params],
    queryFn: () =>
      get<{ users: AdminUserRow[]; total: number; page: number; pageSize: number }>('/admin/users', {
        q: params.q,
        role: params.role,
        page: params.page,
        pageSize: params.pageSize,
      }),
  })
}

export function useAdminUserStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => patch(`/admin/users/${id}/status`, { active }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.users })
    },
  })
}

export function useAdminProfessionals(params: { status?: string; q?: string; page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: [...adminKeys.professionals, params],
    queryFn: () =>
      get<{ professionals: AdminProfessionalRow[]; total: number; page: number; pageSize: number }>('/admin/professionals', {
        status: params.status,
        q: params.q,
        page: params.page,
        pageSize: params.pageSize,
      }),
  })
}

export function usePendingProfessionals() {
  return useQuery({
    queryKey: adminKeys.pending,
    queryFn: () =>
      get<{ professionals: { id: string; name: string; providerType: string; verification: AdminProfessionalRow['verification']; createdAt: string }[] }>(
        '/admin/professionals/pending',
      ),
    staleTime: 30_000,
  })
}

export function useProfessionalVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status: string; reviewNote?: string } }) => patch(`/admin/professionals/${id}/verification`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.professionals })
      void queryClient.invalidateQueries({ queryKey: adminKeys.pending })
    },
  })
}

export function useSafeguardingCases() {
  return useQuery({
    queryKey: adminKeys.safeguarding,
    queryFn: () => get<{ cases: SafeguardingCase[]; restricted: boolean }>('/admin/safeguarding'),
  })
}

export function useSafeguardingUpdate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => patch(`/admin/safeguarding/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.safeguarding })
    },
  })
}

export function useAdminResources(params: { q?: string; page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: [...adminKeys.resources, params],
    queryFn: () => get<{ resources: Resource[]; total: number; page: number; pageSize: number }>('/admin/resources', params as Record<string, string | number | undefined>),
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => post<{ resource: Resource }>('/admin/resources', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.resources })
    },
  })
}

export function useUpdateResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => patch<{ resource: Resource }>(`/admin/resources/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.resources })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/admin/resources/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.resources })
    },
  })
}

export function useCommunityReports() {
  return useQuery({
    queryKey: adminKeys.reports,
    queryFn: () =>
      get<{ reports: { id: string; groupName: string; authorName: string; body: string; reason: string; createdAt: string }[] }>('/admin/community/reports'),
    staleTime: 30_000,
  })
}

export function useModeratePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, hidden, resolve }: { id: string; hidden?: boolean; resolve?: boolean }) =>
      patch(`/admin/community/posts/${id}/moderate`, { hidden, resolve }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.reports })
    },
  })
}

export function useResolveReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patch(`/admin/community/posts/${id}/moderate`, { resolve: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.reports })
    },
  })
}

export function useAuditLogs() {
  return useQuery({
    queryKey: adminKeys.logs,
    queryFn: () => get<{ logs: Record<string, unknown>[]; total: number }>('/admin/audit-logs', { pageSize: 50 }),
  })
}