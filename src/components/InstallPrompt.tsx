import { useCallback, useEffect, useRef, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { useI18n } from '../i18n/LanguageProvider'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'nsangiza_install_dismissed'
const DISMISS_DAYS = 14

function isStandalone() {
  if (typeof window === 'undefined') return false
  const mm = window.matchMedia
  return Boolean(
    (mm && (mm('(display-mode: standalone)').matches || mm('(display-mode: fullscreen)').matches || mm('(display-mode: minimal-ui)').matches)) ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true,
  )
}

function isIos() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const iOS = /iphone|ipad|ipod/i.test(ua)
  const iPadOS = navigator.platform === 'MacIntel' && 'ontouchend' in document
  return iOS || iPadOS
}

export function InstallPrompt() {
  const { t } = useI18n()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)
  const installable = useRef(false)

  useEffect(() => {
    if (isStandalone()) return

    let dismissedAt = 0
    try {
      dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0)
    } catch {
      dismissedAt = 0
    }
    if (Date.now() - dismissedAt < DISMISS_DAYS * 86_400_000) return

    const ios = isIos()
    if (ios) installable.current = true

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      installable.current = true
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setVisible(false)
      setDeferred(null)
      try {
        window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
      } catch {
        // ignore
      }
      toast.success(t('install.done'))
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    const timer = window.setTimeout(() => {
      if (installable.current && !isStandalone()) setVisible(true)
    }, 4000)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      window.clearTimeout(timer)
    }
  }, [t])

  const dismiss = useCallback(() => {
    setVisible(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // ignore
    }
  }, [])

  const install = useCallback(async () => {
    if (deferred) {
      await deferred.prompt()
      const choice = await deferred.userChoice
      setDeferred(null)
      if (choice.outcome === 'accepted') {
        setVisible(false)
      } else {
        dismiss()
      }
      return
    }
    if (isIos()) {
      setIosHelp(true)
    }
  }, [deferred, dismiss])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4">
      <div
        role="dialog"
        aria-label={t('install.a11y')}
        className="anim-sheet mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-hub-primary/15 bg-white p-3.5 shadow-[0_18px_44px_rgba(47,107,79,0.22)] sm:p-4"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hub-primary-light">
          <Download className="h-5 w-5 text-hub-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-hub-text">{iosHelp ? t('install.iosTitle') : t('install.title')}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-hub-muted">
            {iosHelp ? t('install.iosBody') : t('install.body')}
          </p>
          {iosHelp ? (
            <ol className="mt-2 space-y-1.5 text-xs text-hub-text">
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-hub-primary-light text-[10px] font-bold text-hub-primary">1</span>
                <Share className="h-3.5 w-3.5 text-hub-primary" />
                {t('install.iosStep1')}
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-hub-primary-light text-[10px] font-bold text-hub-primary">2</span>
                {t('install.iosStep2')}
              </li>
            </ol>
          ) : null}
          <div className="mt-3 flex items-center gap-2">
            {iosHelp ? (
              <Button size="sm" onClick={dismiss}>{t('install.gotIt')}</Button>
            ) : (
              <Button size="sm" className="inline-flex items-center gap-1.5" onClick={() => void install()}>
                <Download className="h-4 w-4" />
                {t('install.cta')}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={dismiss}>
              {t('install.later')}
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('install.later')}
          className="focus-ring -mr-1 -mt-1 rounded-lg p-1.5 text-slate-400 hover:text-hub-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
