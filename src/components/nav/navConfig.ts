import {
  Bell,
  CalendarDays,
  Clock3,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  ShieldAlert,
  Smile,
  Tickets,
  UserCircle,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TranslationKey } from '../../i18n/translations'

export interface NavItem {
  to: string
  labelKey: TranslationKey
  /** compact label for the bottom taskbar when space is tight */
  shortKey?: TranslationKey
  icon: LucideIcon
  end?: boolean
  /** shown in the floating bottom taskbar on small screens */
  bar?: boolean
  /** reserved for full administrators only */
  adminOnly?: boolean
}

export const USER_NAV: NavItem[] = [
  { to: '/app', labelKey: 'navApp.home', icon: LayoutDashboard, end: true, bar: true },
  { to: '/app/check-in', labelKey: 'navApp.checkIn', icon: Smile, bar: true },
  { to: '/app/appointments', labelKey: 'navApp.appointments', shortKey: 'navApp.sessions', icon: CalendarDays, bar: true },
  { to: '/app/messages', labelKey: 'navApp.messages', icon: MessageSquare, bar: true },
  { to: '/app/community', labelKey: 'navApp.community', icon: UsersRound },
  { to: '/app/resources', labelKey: 'navApp.resources', icon: FolderOpen },
  { to: '/app/notifications', labelKey: 'navApp.notifications', shortKey: 'navApp.alerts', icon: Bell },
  { to: '/app/profile', labelKey: 'navApp.profile', shortKey: 'navApp.profileName', icon: UserCircle },
]

export const PRO_NAV: NavItem[] = [
  { to: '/professional', labelKey: 'navApp.dashboard', icon: LayoutDashboard, end: true, bar: true },
  { to: '/professional/appointments', labelKey: 'navApp.sessions', icon: CalendarDays, bar: true },
  { to: '/professional/clients', labelKey: 'navApp.clients', icon: UsersRound, bar: true },
  { to: '/professional/messages', labelKey: 'navApp.messages', icon: MessageSquare, bar: true },
  { to: '/professional/profile', labelKey: 'navApp.proProfile', shortKey: 'navApp.profileName', icon: UserRound },
  { to: '/professional/availability', labelKey: 'navApp.availability', icon: Clock3 },
  { to: '/professional/follow-ups', labelKey: 'navApp.followUps', icon: LifeBuoy },
  { to: '/professional/notifications', labelKey: 'navApp.notifications', shortKey: 'navApp.alerts', icon: Bell },
]

export const ADMIN_NAV: NavItem[] = [
  { to: '/admin', labelKey: 'navApp.dashboard', icon: LayoutDashboard, end: true, bar: true },
  { to: '/admin/users', labelKey: 'navApp.users', icon: UsersRound, bar: true, adminOnly: true },
  { to: '/admin/professionals', labelKey: 'navApp.professionals', shortKey: 'navApp.providers', icon: UserRound, bar: true },
  { to: '/admin/safeguarding', labelKey: 'navApp.safeguarding', shortKey: 'navApp.safety', icon: ShieldAlert },
  { to: '/admin/resources', labelKey: 'navApp.resources', icon: FolderOpen, adminOnly: true },
  { to: '/admin/community', labelKey: 'navApp.communityModeration', shortKey: 'navApp.moderation', icon: MessageSquare },
  { to: '/admin/notifications', labelKey: 'navApp.notifications', shortKey: 'navApp.alerts', icon: Bell },
  { to: '/admin/audit-logs', labelKey: 'navApp.auditLogs', shortKey: 'navApp.audit', icon: Tickets, adminOnly: true },
]

export function navFor(role?: string | null): NavItem[] {
  if (role === 'PROFESSIONAL') return PRO_NAV
  if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'MODERATOR' || role === 'SUPERVISOR') {
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    return isAdmin ? ADMIN_NAV : ADMIN_NAV.filter((i) => !i.adminOnly)
  }
  return USER_NAV
}

/** items shown in the floating bottom taskbar (plus a "More" button) */
export function barNav(role?: string | null): NavItem[] {
  return navFor(role).filter((i) => i.bar)
}

/** items shown in the More bottom sheet */
export function sheetNav(role?: string | null): NavItem[] {
  return navFor(role).filter((i) => !i.bar)
}

/** current page title key derived from the pathname (falls back to the closest parent section) */
export function pageTitleKeyFor(pathname: string, role?: string | null): TranslationKey {
  const nav = navFor(role)
  if (pathname === nav[0].to) return nav[0].labelKey
  const match = [...nav]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => pathname === i.to || pathname.startsWith(i.to + '/'))
  return match?.labelKey ?? nav[0].labelKey
}
