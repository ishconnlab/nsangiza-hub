import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, patch } from '../lib/api'
import type { FollowUp } from '../types'

export const followUpKeys = {
  all: ['follow-ups'] as const,
}

export function useFollowUps() {
  return useQuery({
    queryKey: followUpKeys.all,
    queryFn: () => get<{ followUps: FollowUp[] }>('/follow-ups'),
  })
}

export function useCompleteFollowUp() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => patch(`/follow-ups/${id}/complete`, { notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: followUpKeys.all })
    },
  })
}