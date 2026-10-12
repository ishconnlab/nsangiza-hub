import { useQuery } from '@tanstack/react-query'
import { get } from '../lib/api'
import type { Resource, ResourceDetail } from '../types'

export const resourceKeys = {
  all: ['resources'] as const,
  list: (filters: Record<string, string | number | boolean | undefined>) => ['resources', 'list', filters] as const,
  detail: (slug: string) => ['resources', 'detail', slug] as const,
  featured: ['resources', 'featured'] as const,
  categories: ['resources', 'categories'] as const,
}

export interface ResourceFilters {
  q?: string
  category?: string
  language?: string
  featured?: string
  page?: number
  pageSize?: number
}

export function useResources(filters: ResourceFilters = {}) {
  return useQuery({
    queryKey: resourceKeys.list(filters as Record<string, string | number | boolean | undefined>),
    queryFn: () =>
      get<Resource[]>('/resources', {
        q: filters.q,
        category: filters.category,
        language: filters.language,
        featured: filters.featured,
        page: filters.page,
        pageSize: filters.pageSize,
      }),
    staleTime: 60_000,
  })
}

export function useResourceDetail(slug: string) {
  return useQuery({
    queryKey: resourceKeys.detail(slug),
    queryFn: () => get<{ resource: ResourceDetail; related: Resource[] }>(`/resources/${slug}`),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

export function useFeaturedResources() {
  return useQuery({
    queryKey: resourceKeys.featured,
    queryFn: () => get<{ resources: Resource[] }>('/resources/featured'),
    staleTime: 5 * 60_000,
  })
}

export function useResourceCategories() {
  return useQuery({
    queryKey: resourceKeys.categories,
    queryFn: () => get<{ categories: string[] }>('/resources/categories'),
    staleTime: 10 * 60_000,
  })
}