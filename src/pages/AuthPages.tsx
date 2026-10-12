import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, ShieldPlus, Smile } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { ApiError } from '../lib/api'
import { useAuth } from '../hooks/auth-context'

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
      toast.success('Welcome back.')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to sign in right now.'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-hub-primary">Welcome back</p>
      <h1 className="mt-2 text-2xl font-bold text-hub-text">Sign in</h1>
      <p className="mt-1 text-sm text-hub-muted">Continue to your private space on Nsangiza Hub.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error ? <ErrorBanner message={error} /> : null}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="email" type="email" required autoComplete="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.rw" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" required type={showPw ? 'text' : 'password'} autoComplete="current-password" className="pl-3 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-hub-primary"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-hub-muted">
        New to Nsangiza Hub?{' '}
        <Link to="/register" state={location.state} className="font-medium text-hub-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export function Register() {
  const { register } = useAuth()
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
      setError('Please accept the consent statement to continue.')
      toast.error('Please accept the consent statement to continue.')
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
      toast.success('Your account is ready.')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to create your account right now.'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-hub-primary">Create your account</p>
      <h1 className="mt-2 text-2xl font-bold text-hub-text">Get started</h1>
      <p className="mt-1 text-sm text-hub-muted">Your information is private and never shared without your consent.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error ? <ErrorBanner message={error} /> : null}
        <div className="space-y-1.5">
          <Label>I am here to</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('USER')}
              aria-pressed={role === 'USER'}
              className={role === 'USER' ? 'flex items-center gap-2 rounded-xl border-2 border-hub-primary bg-hub-primary-light px-3 py-2.5 text-sm font-medium text-hub-primary' : 'flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-hub-muted transition-colors hover:border-slate-300'}
            >
              <Smile className="h-4 w-4" />
              Get support
            </button>
            <button
              type="button"
              onClick={() => setRole('PROFESSIONAL')}
              aria-pressed={role === 'PROFESSIONAL'}
              className={role === 'PROFESSIONAL' ? 'flex items-center gap-2 rounded-xl border-2 border-hub-primary bg-hub-primary-light px-3 py-2.5 text-sm font-medium text-hub-primary' : 'flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-hub-muted transition-colors hover:border-slate-300'}
            >
              <ShieldPlus className="h-4 w-4" />
              Offer support
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Your name</Label>
          <div className="relative">
            <Input id="displayName" required minLength={2} className="pl-3" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Uwimana Alice" autoComplete="name" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="reg-email" type="email" required autoComplete="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.rw" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Input id="reg-password" type={showPw ? 'text' : 'password'} required minLength={8} autoComplete="new-password" className="pl-3 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-hub-primary"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-start gap-2.5 text-sm text-hub-muted">
          <Checkbox className="mt-0.5" checked={consent} onCheckedChange={(v) => setConsent(v === true)} />
          <span>
            I understand how Nsangiza Hub stores my details, and I consent to the privacy terms described in the{' '}
            <Link to="/privacy" className="underline hover:text-hub-primary" target="_blank">
              privacy policy
            </Link>
            .
          </span>
        </label>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating your account…' : 'Create my account'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-hub-muted">
        Already have an account?{' '}
        <Link to="/login" state={location.state} className="font-medium text-hub-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
