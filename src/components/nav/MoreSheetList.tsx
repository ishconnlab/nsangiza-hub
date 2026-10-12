import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/auth-context'
import type { NavItem } from './navConfig'

export function MoreSheetList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)

  async function handleLogout() {
    await logout()
    onNavigate?.()
    navigate('/')
  }

  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {user?.role === 'PROFESSIONAL' ? 'Workspace' : user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR' || user?.role === 'SUPERVISOR' ? 'Management' : 'Your space'}
      </p>

      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-hub-text transition-colors active:scale-[0.98] hover:bg-hub-primary-light/60"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-hub-primary-light text-hub-primary">
            <item.icon className="h-4.5 w-4.5" />
          </span>
          <span className="flex-1">{item.label}</span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </Link>
      ))}

      <div className="my-2 h-px bg-slate-100" />

      <p className="px-3 pb-1 text-xs text-slate-400">
        {user?.displayName}
        {user ? <span className="lowercase"> · {user.role}</span> : null}
      </p>

      <button
        type="button"
        onClick={() => (confirmLogout ? void handleLogout() : setConfirmLogout(true))}
        onBlur={() => setConfirmLogout(false)}
        className={cn(
          'flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors active:scale-[0.98]',
          confirmLogout ? 'bg-hub-danger text-white' : 'text-hub-danger hover:bg-red-50',
        )}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <LogOut className="h-4.5 w-4.5" />
        </span>
        {confirmLogout ? 'Tap again to sign out' : 'Sign out'}
      </button>
      <p className="px-3 pb-1 pt-2 text-[11px] text-slate-400">
        Signed in as {user?.displayName} · you can come back anytime.
      </p>
    </div>
  )
}
