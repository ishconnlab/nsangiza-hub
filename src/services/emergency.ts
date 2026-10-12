import { useQuery } from '@tanstack/react-query'
import { get } from '../lib/api'
import type { EmergencyContacts } from '../types'

export function useEmergencyContacts() {
  return useQuery({
    queryKey: ['emergency-contacts'],
    queryFn: () => get<EmergencyContacts>('/emergency/contacts'),
    staleTime: 10 * 60_000,
  })
}