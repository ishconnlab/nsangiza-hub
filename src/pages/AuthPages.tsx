import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, ShieldPlus, Smile } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { ApiError } from '../lib/api'
import { useAuth } from '../hooks/auth-context'
import { useI18n } from '../i18n/LanguageProvider'
import { apiRequest } from '../lib/api'

function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
      {message}
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(email, password)
      const rawFrom = (location.state as { from?: string } | null)?.from
      const target = rawFrom && rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : undefined
      if (target) {
        navigate(target)
      } else if (user.role === 'PROFESSIONAL') {
        navigate('/professional')
      } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR' || user.role === 'SUPERVISOR') {
        navigate('/admin')
      } else if (!user.onboarding.consentSeen || !user.onboarding.preferencesComplete || !user.onboarding.assessmentComplete) {
        navigate('/onboarding')
      } else {
        navigate('/app')
      }
      toast.success(t('auth.welcomeBackToast'))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('auth.signInError')
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-hub-primary">{t('auth.welcomeBack')}</p>
      <h1 className="mt-2 text-2xl font-bold text-hub-text">{t('auth.signIn')}</h1>
      <p className="mt-1 text-sm text-hub-muted">{t('auth.signInSub')}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error ? <ErrorBanner message={error} /> : null}
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="email" type="email" required autoComplete="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.rw" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Input id="password" required type={showPw ? 'text' : 'password'} autoComplete="current-password" className="pl-3 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.password')} />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? t('auth.hidePassword') : t('auth.showPassword')}
              className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-hub-primary"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="-mt-2 flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-hub-primary hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-hub-muted">
        {t('auth.newHere')}{' '}
        <Link to="/register" state={location.state} className="font-medium text-hub-primary hover:underline">
          {t('auth.createAccount')}
        </Link>
      </p>
    </div>
  )
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await apiRequest('/auth/forgot-password', { method: 'POST', body: { email } })
      setSent(true)
      toast.success(result.message)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not request a password reset.'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-hub-primary">Account recovery</p>
      <h1 className="mt-2 text-2xl font-bold text-hub-text">Forgot your password?</h1>
      <p className="mt-1 text-sm text-hub-muted">Enter the email address on your account and we’ll send you a reset link.</p>
      {sent ? (
        <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          If an account matches that email, a password reset link has been sent. Check your inbox and spam folder.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error ? <ErrorBanner message={error} /> : null}
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">Email</Label>
            <Input id="forgot-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.rw" />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
      <p className="mt-5 text-center text-sm text-hub-muted">
        <Link to="/login" className="font-medium text-hub-primary hover:underline">Back to sign in</Link>
      </p>
    </div>
  )
}

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError('This password reset link is missing or invalid. Request a new one.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const result = await apiRequest('/auth/reset-password', { method: 'POST', body: { token, password } })
      toast.success(result.message)
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not reset your password.'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-hub-primary">Account recovery</p>
      <h1 className="mt-2 text-2xl font-bold text-hub-text">Choose a new password</h1>
      <p className="mt-1 text-sm text-hub-muted">Use at least 8 characters. The reset link expires after 30 minutes.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error ? <ErrorBanner message={error} /> : null}
        {!token ? <ErrorBanner message="This password reset link is missing. Request a new one to continue." /> : null}
        <div className="space-y-1.5">
          <Label htmlFor="reset-password">New password</Label>
          <Input id="reset-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={submitting || !token}>
          {submitting ? 'Saving…' : 'Reset password'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-hub-muted">
        <Link to="/forgot-password" className="font-medium text-hub-primary hover:underline">Request a new reset link</Link>
      </p>
    </div>
  )
}

export function Register() {
  const { register } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [role, setRole] = useState<'USER' | 'PROFESSIONAL'>('USER')
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      setError(t('auth.consentRequired'))
      toast.error(t('auth.consentRequired'))
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const user = await register({ displayName, email, password, role, consent })
      const rawFrom = (location.state as { from?: string } | null)?.from
      const target = rawFrom && rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : undefined
      if (target) navigate(target)
      else if (user.role === 'PROFESSIONAL') navigate('/professional/profile')
      else navigate('/onboarding')
      toast.success(t('auth.accountReady'))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('auth.createError')
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-hub-primary">{t('auth.createTitle')}</p>
      <h1 className="mt-2 text-2xl font-bold text-hub-text">{t('auth.getStarted')}</h1>
      <p className="mt-1 text-sm text-hub-muted">{t('auth.createSub')}</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error ? <ErrorBanner message={error} /> : null}
        <div className="space-y-1.5">
          <Label>{t('auth.iamHere')}</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('USER')}
              aria-pressed={role === 'USER'}
              className={role === 'USER' ? 'flex items-center gap-2 rounded-xl border-2 border-hub-primary bg-hub-primary-light px-3 py-2.5 text-sm font-medium text-hub-primary' : 'flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-hub-muted transition-colors hover:border-slate-300'}
            >
              <Smile className="h-4 w-4" />
              {t('auth.getSupport')}
            </button>
            <button
              type="button"
              onClick={() => setRole('PROFESSIONAL')}
              aria-pressed={role === 'PROFESSIONAL'}
              className={role === 'PROFESSIONAL' ? 'flex items-center gap-2 rounded-xl border-2 border-hub-primary bg-hub-primary-light px-3 py-2.5 text-sm font-medium text-hub-primary' : 'flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-hub-muted transition-colors hover:border-slate-300'}
            >
              <ShieldPlus className="h-4 w-4" />
              {t('auth.offerSupport')}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="displayName">{t('auth.yourName')}</Label>
          <div className="relative">
            <Input id="displayName" required minLength={2} className="pl-3" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('auth.namePlaceholder')} autoComplete="name" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="reg-email" type="email" required autoComplete="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.rw" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-password">{t('auth.password')}</Label>
          <div className="relative">
            <Input id="reg-password" type={showPw ? 'text' : 'password'} required minLength={8} autoComplete="new-password" className="pl-3 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('auth.passwordPlaceholder')} />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? t('auth.hidePassword') : t('auth.showPassword')}
              className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-hub-primary"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-start gap-2.5 text-sm text-hub-muted">
          <Checkbox className="mt-0.5" checked={consent} onCheckedChange={(v) => setConsent(v === true)} />
          <span>
            {t('auth.consent')}{' '}
            <Link to="/privacy" className="underline hover:text-hub-primary" target="_blank">
              {t('auth.privacyPolicy')}
            </Link>
            .
          </span>
        </label>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? t('auth.creating') : t('auth.createMyAccount')}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-hub-muted">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" state={location.state} className="font-medium text-hub-primary hover:underline">
          {t('auth.signInLink')}
        </Link>
      </p>
    </div>
  )
}
