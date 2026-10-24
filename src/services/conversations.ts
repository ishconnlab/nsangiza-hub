import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, patch, post } from '../lib/api'
import type { ConversationSummary, Message } from '../types'

export const conversationKeys = {
  all: ['conversations'] as const,
  detail: (id: string) => ['conversations', 'detail', id] as const,
  messages: (id: string) => ['conversations', 'messages', id] as const,
}

export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.all,
    queryFn: () => get<{ conversations: ConversationSummary[] }>('/conversations'),
    refetchInterval: 10_000,
  })
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationKeys.messages(id),
    queryFn: () => get<{ conversation: { id: string; status: string; callAppointmentId?: string; callType?: string }; messages: Message[] }>(`/conversations/${id}`),
    enabled: Boolean(id),
    refetchInterval: 4_000,
  })
}

export function useStartConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (professionalId: string) => post<{ conversation: { id: string } }>('/conversations', { professionalId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all })
    },
  })
}


export function useOpenAppointmentSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (appointmentId: string) => post<{ conversation: { id: string }; roomName?: string; callType?: string }>(`/conversations/session/${appointmentId}`, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all })
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, body, kind, attachment }: {
      conversationId: string
      body?: string
      kind?: Message['kind']
      attachment?: NonNullable<Message['attachment']>
    }) => post<{ message: Message }>(`/conversations/${conversationId}/messages`, { body, kind, attachment }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: conversationKeys.messages(variables.conversationId) })
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all })
    },
  })
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patch(`/conversations/${id}/read`, {}),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all })
      void queryClient.invalidateQueries({ queryKey: conversationKeys.messages(id) })
    },
  })
}

export function useReportConversation() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => post(`/conversations/${id}/report`, { reason }),
  })
}
