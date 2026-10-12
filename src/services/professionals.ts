import { useQuery } from '@tanstack/react-query'
import { get } from '../lib/api'
import type { MatchRecommendation, Professional } from '../types'

export const professionalKeys = {
  all: ['professionals'] as const,
  list: (filters: Record<string, string | number | boolean | undefined>) => ['professionals', 'list', filters] as const,
  detail: (id: string) => ['professionals', 'detail', id] as const,
  cities: ['professionals', 'cities'] as const,
  matching: (filters: Record<string, string | number | boolean | undefined>) => ['matching', filters] as const,
}

export interface ProfessionalFilters {
  q?: string
  specialization?: string
  language?: string
  city?: string
  providerType?: string
  experience?: string
  sort?: string
  page?: number
  pageSize?: number
  gender?: string
  sessionType?: string
  verified?: string
}

export function useProfessionals(filters: ProfessionalFilters = {}) {
  return useQuery({
    queryKey: professionalKeys.list(filters as Record<string, string | number | boolean | undefined>),
    queryFn: () =>
      get<Professional[]>('/professionals', {
        q: filters.q,
        specialization: filters.specialization,
        language: filters.language,
        city: filters.city,
        providerType: filters.providerType,
        experience: filters.experience,
        sort: filters.sort,
        page: filters.page,
        pageSize: filters.pageSize,
        gender: filters.gender,
        sessionType: filters.sessionType,
        verified: filters.verified,
      }),
    staleTime: 60_000,
  })
}

export function useProfessionalDetail(id: string) {
  return useQuery({
    queryKey: professionalKeys.detail(id),
    queryFn: () => get<{ professional: Professional }>(`/professionals/${id}`),
    enabled: Boolean(id),
    staleTime: 60_000,
  })
}

export function useCities() {
  return useQuery({
    queryKey: professionalKeys.cities,
    queryFn: () => get<{ cities: string[] }>('/professionals/cities'),
    staleTime: 10 * 60_000,
  })
}

export interface MatchFilters {
  topics?: string
  city?: string
  language?: string
  gender?: string
  limit?: number
}

export function useMatching(filters: MatchFilters = {}) {
  return useQuery({
    queryKey: professionalKeys.matching(filters as Record<string, string | number | boolean | undefined>),
    queryFn: () =>
      get<{ recommendations: MatchRecommendation[]; note?: string }>('/matching/recommendations', {
        topics: filters.topics,
        city: filters.city,
        language: filters.language,
        gender: filters.gender,
        limit: filters.limit,
      }),
    staleTime: 2 * 60_000,
  })
}