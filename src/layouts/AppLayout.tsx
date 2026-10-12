import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronLeft, LogOut } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import Brand from '../components/Brand'
import { Loading } from '../components/PageHeader'
import { ReadAloud } from '../components/ReadAloud'
import { BottomTaskbar } from '../components/nav/BottomTaskbar'
import { NotificationManager } from '../components/notifications/NotificationManager'
import { navFor, pageTitleKeyFor } from '../components/nav/navConfig'
import { initials } from '../lib/format'
import { cn } from '../lib/utils'
import { useAuth } from '../hooks/auth-context'
import { useI18n } from '../i18n/LanguageProvider'
import { dashboardPathFor } from '../router/guards'
import { useNotifications } from '../services/notifications'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const { data: notifications } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))

  const prefix = dashboardPathFor(user?.role)
  const nav = navFor(user?.role)
  const title = t(pageTitleKeyFor(location.pathname, user?.role))
  const activeItem = nav.find((i) => location.pathname === i.to || location.pathname.startsWith(i.to + '/'))
  const isNested = Boolean(activeItem && location.pathname !== activeItem.to)
  const reduceMotion = user?.privacySettings?.reduceMotion === true
  const simpleView = user?.privacySettings?.simpleView === true

  const scrollMemory = useRef(new Map<string, number>())
  const currentPath = useRef(location.pathname)

  useEffect(() => {
    const save = () => {
      scrollMemory.current.set(currentPath.current, window.scrollY)
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [])

  useEffect(() => {
    const y = scrollMemory.current.get(location.pathname)
    window.scrollTo({ top: y ?? 0, behavior: 'auto' })
    currentPath.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  async function handleLogout() {
    await logout()
    setConfirmLogout(false)
    navigate('/')
  }

  const unread = notifications?.data.unreadCount ?? 0
  const roleLabel =
    user?.role === 'PROFESSIONAL'
      ? t('role.professionalWorkspace')
      : user?.role && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPERVISOR'].includes(user.role)
        ? t('role.managementConsole')
        : t('role.yourSpace')

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <Brand to={prefix} />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label={t('common.applicationNav')}>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-hub-primary-light text-hub-primary' : 'text-hub-muted hover:bg-slate-50 hover:text-hub-text',
              )
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {t(item.labelKey)}
            {item.to === `${prefix}/notifications` && unread > 0 ? <Badge variant="danger">{unread}</Badge> : null}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={() => setConfirmLogout((v) => !v)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-hub-muted transition-colors hover:bg-slate-50 hover:text-hub-danger"
        >
          <LogOut className="h-4.5 w-4.5" />
          {confirmLogout ? t('common.confirmSignOut') : t('common.signOut')}
        </button>
        {confirmLogout ? (
          <button
            onClick={() => void handleLogout()}
            className="mt-1 w-full rounded-xl bg-hub-danger px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            {t('common.yesSignOut')}
          </button>
        ) : null}
      </div>
    </aside>
  )

  return (
    <div
      className="flex min-h-screen bg-hub-background"
      data-reduce-motion={reduceMotion ? '' : undefined}
      data-simple-view={simpleView ? '' : undefined}
    >
      <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)] sm:px-6">
            <div className="flex min-w-0 items-center gap-1.5">
              {isNested ? (
                <button
                  onClick={() => navigate(-1)}
                  aria-label={t('common.back')}
                  className="-ml-1.5 rounded-full p-2 text-hub-muted transition-colors hover:bg-slate-100 active:scale-95 lg:hidden"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : null}
              <span className="truncate text-sm font-medium text-hub-muted">
                <span className="lg:hidden">{title}</span>
                <span className="hidden lg:inline">{roleLabel}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ReadAloud label={t('common.readAloud')} />
              <Link
                to={`${prefix}/notifications`}
                className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 active:scale-95"
                aria-label={unread > 0 ? t('common.notificationsUnread', { count: unread }) : t('common.notifications')}
              >
                <Bell className="h-5 w-5" />
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hub-danger px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                ) : null}
              </Link>
              <Link
                to={user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR' || user?.role === 'SUPERVISOR' ? prefix : `${prefix}/profile`}
                aria-label={t('common.profileSettings')}
                className="active:scale-95"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials(user?.displayName)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="hidden lg:block">
                <p className="text-sm font-medium leading-tight text-hub-text">{user?.displayName}</p>
                <p className="text-xs text-hub-muted">{user?.role.toLowerCase()}</p>
              </div>
            </div>
          </div>
          {!online ? (
            <p role="status" className="bg-amber-500 px-4 py-1 text-center text-xs font-medium text-white">
              {t('app.offline')}
            </p>
          ) : null}
        </header>

        <main className="flex-1 px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-5xl anim-page" key={location.pathname}>
            <NotificationManager />
            <Suspense fallback={<Loading label="Loading…" />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <BottomTaskbar role={user?.role} />
    </div>
  )
}
