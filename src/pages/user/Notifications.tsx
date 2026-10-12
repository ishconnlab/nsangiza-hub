import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, BellOff, CheckCheck, Trash2, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatRelative } from '../../lib/format'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/auth-context'
import { metaFor } from '../../components/notifications/notificationMeta'
import { ALERTS_PREF_EVENT, alertsEnabled, setAlertsEnabled } from '../../lib/browser-notifications'
import {
  useClearNotifications,
  useDismissNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../services/notifications'
import type { AppNotification } from '../../types'

function roleCopy(role?: string): string {
  if (role === 'PROFESSIONAL') return 'Appointments, client messages and follow-up reminders — all in one place.'
  if (role && ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPERVISOR'].includes(role)) return 'System, safeguarding and moderation alerts for the platform.'
  return 'Updates about your appointments, messages and check-ins.'
}

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const dismiss = useDismissNotification()
  const clearAll = useClearNotifications()

  const [muted, setMuted] = useState(() => (typeof window === 'undefined' ? false : !alertsEnabled()))

  useEffect(() => {
    const sync = () => setMuted(!alertsEnabled())
    window.addEventListener(ALERTS_PREF_EVENT, sync)
    return () => window.removeEventListener(ALERTS_PREF_EVENT, sync)
  }, [])

  const items = data?.data.notifications ?? []
  const unread = data?.data.unreadCount ?? 0

  function open(n: AppNotification) {
    void markRead.mutateAsync(n.id)
    if (n.link) navigate(n.link)
  }

  function toggleMute() {
    setAlertsEnabled(muted)
    setMuted((v) => !v)
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={roleCopy(user?.role)}
        actions={
          items.length > 0 || unread > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={muted ? 'secondary' : 'ghost'}
                size="sm"
                className="inline-flex items-center gap-1.5"
                onClick={toggleMute}
                aria-pressed={muted}
              >
                {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                {muted ? 'Alerts off' : 'Alerts on'}
              </Button>
              {unread > 0 ? (
                <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5" onClick={() => void markAll.mutateAsync()}>
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              ) : null}
              {items.length > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="inline-flex items-center gap-1.5 text-hub-danger"
                  disabled={clearAll.isPending}
                  onClick={() => void clearAll.mutateAsync()}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />

      {muted ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <BellOff className="h-4 w-4 shrink-0" />
          Alerts are muted on this device. New updates still appear here, but you won’t get pop-up or system notifications.
        </div>
      ) : null}

      {isLoading ? (
        <Loading label="Loading notifications…" />
      ) : items.length === 0 ? (
        <EmptyState title="You're all caught up" description="New alerts will appear here the moment something needs your attention." />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const meta = metaFor(n.type)
            const Icon = meta.icon
            return (
              <Card
                key={n.id}
                className={cn('relative overflow-hidden transition-colors', !n.read && 'border-hub-primary/30 bg-hub-primary-light/40')}
              >
                <CardContent className="p-0">
                  <button
                    type="button"
                    onClick={() => open(n)}
                    className="flex w-full items-start gap-3 p-4 pr-12 text-left transition-colors hover:bg-slate-50/70"
                  >
                    <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', meta.bg)}>
                      <Icon className={cn('h-5 w-5', meta.tone)} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className={cn('truncate text-sm', n.read ? 'font-medium text-hub-text' : 'font-semibold text-hub-text')}>
                          {n.title}
                        </span>
                        {!n.read && <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-hub-primary" />}
                      </span>
                      <span className="mt-0.5 block text-sm text-hub-muted">{n.body}</span>
                      <span className="mt-1 block text-xs text-slate-400">
                        {meta.label} · {formatRelative(n.createdAt)}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void dismiss.mutateAsync(n.id)}
                    aria-label="Dismiss notification"
                    className="absolute right-2 top-2 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-hub-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            )
          })}

          <div className="pt-2 text-center">
            <Button variant="ghost" size="sm" className="inline-flex items-center gap-1.5 text-hub-muted" onClick={() => void clearAll.mutateAsync()}>
              <Trash2 className="h-4 w-4" />
              Clear all notifications
            </Button>
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-slate-400">
        Not finding something? Check <Link to="/help/emergency" className="underline">emergency contacts</Link> if you're in a crisis.
      </p>
    </div>
  )
}
