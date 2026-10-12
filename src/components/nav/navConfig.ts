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

export interface NavItem {
  to: string
  label: string
  /** compact label for the bottom taskbar when space is tight */
  shortLabel?: string
  icon: LucideIcon
  end?: boolean
  /** shown in the floating bottom taskbar on small screens */
  bar?: boolean
  /** reserved for full administrators only */
  adminOnly?: boolean
}

export const USER_NAV: NavItem[] = [
  { to: '/app', label: 'Home', icon: LayoutDashboard, end: true, bar: true },
  { to: '/app/check-in', label: 'Check in', icon: Smile, bar: true },
  { to: '/app/appointments', label: 'Appointments', shortLabel: 'Sessions', icon: CalendarDays, bar: true },
  { to: '/app/messages', label: 'Messages', icon: MessageSquare, bar: true },
  { to: '/app/community', label: 'Community', icon: UsersRound },
  { to: '/app/resources', label: 'Resources', icon: FolderOpen },
  { to: '/app/notifications', label: 'Notifications', shortLabel: 'Alerts', icon: Bell },
  { to: '/app/profile', label: 'Profile & privacy', shortLabel: 'Profile', icon: UserCircle },
]

export const PRO_NAV: NavItem[] = [
  { to: '/professional', label: 'Dashboard', icon: LayoutDashboard, end: true, bar: true },
  { to: '/professional/appointments', label: 'Sessions', icon: CalendarDays, bar: true },
  { to: '/professional/clients', label: 'Clients', icon: UsersRound, bar: true },
  { to: '/professional/messages', label: 'Messages', icon: MessageSquare, bar: true },
  { to: '/professional/profile', label: 'Profile & onboarding', shortLabel: 'Profile', icon: UserRound },
  { to: '/professional/availability', label: 'Availability', icon: Clock3 },
  { to: '/professional/follow-ups', label: 'Follow-ups', icon: LifeBuoy },
  { to: '/professional/notifications', label: 'Notifications', shortLabel: 'Alerts', icon: Bell },
]

export const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, bar: true },
  { to: '/admin/users', label: 'Users', icon: UsersRound, bar: true, adminOnly: true },
  { to: '/admin/professionals', label: 'Professionals', shortLabel: 'Providers', icon: UserRound, bar: true },
  { to: '/admin/safeguarding', label: 'Safeguarding', shortLabel: 'Safety', icon: ShieldAlert },
  { to: '/admin/resources', label: 'Resources', icon: FolderOpen, adminOnly: true },
  { to: '/admin/community', label: 'Community moderation', shortLabel: 'Moderation', icon: MessageSquare },
  { to: '/admin/audit-logs', label: 'Audit logs', shortLabel: 'Audit', icon: Tickets, adminOnly: true },
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

/** current page title derived from the pathname (falls back to the closest parent section) */
export function pageTitleFor(pathname: string, role?: string | null): string {
  const nav = navFor(role)
  if (pathname === nav[0].to) return nav[0].label
  const match = [...nav]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => pathname === i.to || pathname.startsWith(i.to + '/'))
  return match?.label ?? nav[0].label
}
