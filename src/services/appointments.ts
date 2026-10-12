import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { del, get, patch, post } from '../lib/api'
import type { Appointment, AppointmentStatus, SessionType } from '../types'

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (params: { status?: string; page?: number; pageSize?: number }) => ['appointments', 'list', params] as const,
  upcoming: ['appointments', 'upcoming'] as const,
}

export function useAppointments(params: { status?: string; page?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () =>
      get<{ appointments: Appointment[]; total: number; page: number; pageSize: number }>('/appointments', {
        status: params.status,
        page: params.page,
        pageSize: params.pageSize,
      }),
  })
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: appointmentKeys.upcoming,
    queryFn: () => get<{ appointments: Appointment[] }>('/appointments/upcoming'),
    staleTime: 60_000,
  })
}

export interface CreateAppointmentInput {
  professionalId: string
  date: string
  durationMin?: number
  type?: SessionType
  notes?: string
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAppointmentInput) => post<{ appointment: Appointment }>('/appointments', body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { status?: AppointmentStatus; date?: string; notes?: string } }) =>
      patch<{ appointment: Appointment }>(`/appointments/${id}`, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
    },
  })
}

export function useAppointmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'confirmed' | 'completed' | 'cancelled' | 'no-show' }) =>
      patch<{ appointment: Appointment }>(`/appointments/${id}/status`, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del<{ id: string }>(`/appointments/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
    },
  })
}