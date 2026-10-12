import type { LucideIcon } from 'lucide-react'
import { BadgeCheck, CalendarClock, ClipboardCheck, Megaphone, MessageSquare, Users } from 'lucide-react'
import type { AppNotification } from '../../types'

export interface NotificationMeta {
  label: string
  icon: LucideIcon
  tone: string
  bg: string
}

export const NOTIFICATION_META: Record<AppNotification['type'], NotificationMeta> = {
  appointment: { label: 'Appointment', icon: CalendarClock, tone: 'text-hub-info', bg: 'bg-hub-info/10' },
  message: { label: 'Message', icon: MessageSquare, tone: 'text-hub-primary', bg: 'bg-hub-primary-light' },
  'follow-up': { label: 'Follow-up', icon: ClipboardCheck, tone: 'text-amber-600', bg: 'bg-amber-50' },
  professional: { label: 'Professional', icon: BadgeCheck, tone: 'text-emerald-600', bg: 'bg-emerald-50' },
  community: { label: 'Community', icon: Users, tone: 'text-violet-600', bg: 'bg-violet-50' },
  system: { label: 'System', icon: Megaphone, tone: 'text-slate-600', bg: 'bg-slate-100' },
}

export function metaFor(type: string): NotificationMeta {
  return NOTIFICATION_META[type as AppNotification['type']] ?? NOTIFICATION_META.system
}
