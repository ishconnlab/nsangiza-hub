import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { BellRing, X } from 'lucide-react'
import { Button } from '../ui/button'
import { metaFor } from './notificationMeta'
import { useAuth } from '../../hooks/auth-context'
import { useNotifications } from '../../services/notifications'
import {
  alertsEnabled,
  notificationSupport,
  requestNotificationPermission,
  showSystemNotification,
  type BrowserPermission,
} from '../../lib/browser-notifications'
import type { AppNotification } from '../../types'

const DISMISS_KEY = 'nsangiza_notif_prompt_dismissed'

export function NotificationManager() {
  const { user } = useAuth()
  const { data } = useNotifications()
  const items = useMemo(() => data?.data.notifications ?? [], [data])
  const seenRef = useRef<Set<string> | null>(null)
  const [permission, setPermission] = useState<BrowserPermission>(() => notificationSupport())
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(DISMISS_KEY) === '1'
  })

  const role = user?.role

  useEffect(() => {
    if (items.length === 0) {
      if (seenRef.current === null) seenRef.current = new Set()
      return
    }
    if (seenRef.current === null) {
      seenRef.current = new Set(items.map((n) => n.id))
      return
    }

    const fresh = items.filter((n) => !seenRef.current!.has(n.id) && !n.read)
    for (const n of fresh) {
      seenRef.current!.add(n.id)
      deliver(n, role)
    }
  }, [items, role])

  async function enable() {
    const next = await requestNotificationPermission()
    setPermission(next)
    if (next === 'granted') toast.success('Notifications are on for this device.')
    else if (next === 'denied') toast.error('Notifications are blocked. Enable them in your browser settings.')
    else toast.message('Notifications were not enabled.')
  }

  function dismiss() {
    setDismissed(true)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  if (permission !== 'default' || dismissed) return null

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-hub-primary/20 bg-hub-primary-light/60 px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-hub-primary">
        <BellRing className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-hub-text">Turn on notifications</p>
        <p className="text-xs text-hub-muted">
          Get appointment, message and follow-up alerts on this device — even when the app is in the background.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => void enable()}>
          Enable
        </Button>
        <Button size="sm" variant="ghost" onClick={dismiss} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function deliver(n: AppNotification, role?: string) {
  if (!alertsEnabled()) return
  const meta = metaFor(n.type)
  const Icon = meta.icon
  const title = role === 'PROFESSIONAL' && n.type === 'message' ? 'New client message' : n.title

  toast(title, {
    description: n.body,
    icon: <Icon className="h-4 w-4" />,
    action: n.link ? { label: 'Open', onClick: () => window.location.assign(n.link!) } : undefined,
  })

  void showSystemNotification({ title, body: n.body, link: n.link, tag: n.id })
}
