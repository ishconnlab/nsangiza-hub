export type BrowserPermission = 'default' | 'granted' | 'denied' | 'unsupported'

export const ALERTS_PREF_KEY = 'nsangiza_notif_enabled'
export const ALERTS_PREF_EVENT = 'nsangiza-notif-pref'

export function alertsEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(ALERTS_PREF_KEY) !== '0'
}

export function setAlertsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ALERTS_PREF_KEY, enabled ? '1' : '0')
  window.dispatchEvent(new Event(ALERTS_PREF_EVENT))
}

export function notificationSupport(): BrowserPermission {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission as BrowserPermission
}

export async function requestNotificationPermission(): Promise<BrowserPermission> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported'
  try {
    return (await Notification.requestPermission()) as BrowserPermission
  } catch {
    return 'denied'
  }
}

interface ShowOptions {
  title: string
  body?: string
  link?: string
  tag?: string
}

export async function showSystemNotification({ title, body, link, tag }: ShowOptions): Promise<void> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return

  const options: NotificationOptions = {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag,
    data: { link },
  }

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.showNotification(title, options)
        return
      }
    }
  } catch {
    /* fall through to a page-level notification */
  }

  try {
    const notification = new Notification(title, options)
    notification.onclick = () => {
      window.focus()
      if (link) window.location.assign(link)
    }
  } catch {
    /* some mobile browsers disallow page-level notifications */
  }
}
