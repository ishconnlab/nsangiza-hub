import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, post } from '../lib/api'
import type { CommunityGroup, CommunityPost, CommunityPostComment, ReactionKind, ReactionSummary } from '../types'

export const communityKeys = {
  all: ['community'] as const,
  groups: ['community', 'groups'] as const,
  mine: ['community', 'groups', 'mine'] as const,
  group: (id: string) => ['community', 'group', id] as const,
  posts: (id: string) => ['community', 'posts', id] as const,
}

export function useCommunityGroups() {
  return useQuery({
    queryKey: communityKeys.groups,
    queryFn: () => get<{ groups: CommunityGroup[]; note?: string }>('/community/groups'),
    staleTime: 5 * 60_000,
  })
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: communityKeys.group(groupId),
    queryFn: () => get<{ group: CommunityGroup }>(`/community/groups/${groupId}`),
    enabled: Boolean(groupId),
  })
}

export function useMyGroups() {
  return useQuery({
    queryKey: communityKeys.mine,
    queryFn: () => get<{ groups: CommunityGroup[] }>('/community/groups/mine'),
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => post<{ memberCount: number; isMember: boolean }>(`/community/groups/${groupId}/join`),
    onSuccess: (_data, groupId) => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.mine })
      void queryClient.invalidateQueries({ queryKey: communityKeys.groups })
      void queryClient.invalidateQueries({ queryKey: communityKeys.group(groupId) })
    },
  })
}

export function useLeaveGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => post<{ memberCount: number; isMember: boolean }>(`/community/groups/${groupId}/leave`),
    onSuccess: (_data, groupId) => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.mine })
      void queryClient.invalidateQueries({ queryKey: communityKeys.groups })
      void queryClient.invalidateQueries({ queryKey: communityKeys.group(groupId) })
    },
  })
}

export function useGroupPosts(groupId: string) {
  return useQuery({
    queryKey: communityKeys.posts(groupId),
    queryFn: () => get<{ posts: CommunityPost[] }>(`/community/groups/${groupId}/posts`),
    enabled: Boolean(groupId),
    refetchInterval: 30_000,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, body }: { groupId: string; body: string }) =>
      post<{ post: CommunityPost }>(`/community/groups/${groupId}/posts`, { body }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.posts(variables.groupId) })
      void queryClient.invalidateQueries({ queryKey: communityKeys.mine })
    },
  })
}

export function useToggleReaction(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, kind }: { id: string; kind: ReactionKind }) =>
      post<{ reactions: ReactionSummary }>(`/community/posts/${id}/reactions`, { kind }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.posts(groupId) })
    },
  })
}

export function useAddComment(groupId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      post<{ comments: CommunityPostComment[]; commentCount: number }>(`/community/posts/${id}/comments`, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.posts(groupId) })
    },
  })
}

export function useReportPost() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => post(`/community/posts/${id}/report`, { reason }),
  })
}