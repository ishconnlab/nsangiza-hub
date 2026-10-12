import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Separator } from '../../components/ui/separator'
import { SafetyNotice } from '../../components/SafetyNotice'
import { PageHeader } from '../../components/PageHeader'
import { ApiError } from '../../lib/api'
import { useAuth } from '../../hooks/auth-context'
import { useI18n } from '../../i18n/LanguageProvider'
import { useProfileUpdate } from '../../services/users'
import { CITIES, LANGUAGES, COMMUNICATION_PREFERENCES } from '../../lib/constants'

const FOOTER_LINKS = [
  { to: '/professionals', key: 'footer.findSupport' },
  { to: '/how-it-works', key: 'footer.howItWorks' },
  { to: '/resources', key: 'footer.wellbeing' },
  { to: '/help/emergency', key: 'footer.emergency' },
  { to: '/join', key: 'footer.forProfessionals' },
  { to: '/safety', key: 'footer.safety' },
  { to: '/privacy', key: 'footer.privacy' },
  { to: '/terms', key: 'footer.terms' },
  { to: '/help/contact', key: 'footer.contact' },
] as const

export default function ProfileSettings() {
  const { user, logout } = useAuth()
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const updateMutation = useProfileUpdate()

  const [displayName, setDisplayName] = useState('')
  const [city, setCity] = useState('')
  const [language, setLanguage] = useState('')
  const [preferred, setPreferred] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [communication, setCommunication] = useState('')
  const [notif, setNotif] = useState({ appointmentReminders: true, messages: true, followUps: true, community: false, system: true })
  const [privacy, setPrivacy] = useState({
    reduceMotion: false,
    simpleView: false,
    allowAnalytics: true,
    largeText: false,
    highContrast: false,
    dyslexiaFriendly: false,
    autoReadAloud: false,
    enableReadAloud: true,
  })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    setDisplayName(user.displayName ?? '')
    setCity(user.city ?? '')
    setLanguage(user.language ?? 'Kinyarwanda')
    setPreferred(user.preferredSupportLanguage ?? 'Kinyarwanda')
    setAgeRange(user.ageRange ?? '')
    setCommunication(user.communicationPreference ?? 'Secure chat')
    setNotif({ ...notif, ...user.notificationSettings })
    setPrivacy({ ...privacy, ...user.privacySettings })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function save() {
    setBusy(true)
    try {
      await updateMutation.mutateAsync({
        displayName,
        city,
        language,
        preferredSupportLanguage: preferred,
        ageRange,
        communicationPreference: communication,
        notificationSettings: notif,
        privacySettings: privacy,
      })
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save your profile.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title="Profile & privacy" description="Manage how we contact you and how your space behaves." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your details</CardTitle>
            <CardDescription>Used to personalise your experience — nothing is shared publicly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-name">Display name</Label>
              <Input id="pf-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>City / district</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Preferred language</Label>
                <Select value={preferred} onValueChange={setPreferred}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Comfortable speaking in</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Age range</Label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>{['Under 18', '18-25', '26-35', '36-50', 'Over 50'].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Contact preference</Label>
              <Select value={communication} onValueChange={setCommunication}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COMMUNICATION_PREFERENCES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Choose what you'd like to hear about.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                ['appointmentReminders', 'Appointment reminders'],
                ['messages', 'New messages'],
                ['followUps', 'Follow-ups'],
                ['community', 'Community activity'],
                ['system', 'System updates'],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-hub-text">{label}</span>
                  <Switch checked={notif[key]} onCheckedChange={(v) => setNotif((s) => ({ ...s, [key]: v }))} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility & support for disabilities</CardTitle>
              <CardDescription>Adapt the app to your needs (larger text, high contrast, dyslexia-friendly text, read-aloud).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hub-text">Large text</p>
                  <p className="text-xs text-hub-muted">Slightly bigger text for easier reading.</p>
                </div>
                <Switch checked={privacy.largeText} onCheckedChange={(v) => setPrivacy((s) => ({ ...s, largeText: v }))} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hub-text">High contrast</p>
                  <p className="text-xs text-hub-muted">Bolder colours for better visibility.</p>
                </div>
                <Switch checked={privacy.highContrast} onCheckedChange={(v) => setPrivacy((s) => ({ ...s, highContrast: v }))} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hub-text">Dyslexia-friendly font (coming to app-wide)</p>
                  <p className="text-xs text-hub-muted">Uses a clearer font where available.</p>
                </div>
                <Switch checked={privacy.dyslexiaFriendly} onCheckedChange={(v) => setPrivacy((s) => ({ ...s, dyslexiaFriendly: v }))} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hub-text">Enable Read Aloud</p>
                  <p className="text-xs text-hub-muted">Show the “Read this page aloud” button.</p>
                </div>
                <Switch checked={privacy.enableReadAloud} onCheckedChange={(v) => setPrivacy((s) => ({ ...s, enableReadAloud: v }))} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hub-text">Auto-read aloud for simple view</p>
                  <p className="text-xs text-hub-muted">Helpful for low-literacy or when needed.</p>
                </div>
                <Switch checked={privacy.autoReadAloud} onCheckedChange={(v) => setPrivacy((s) => ({ ...s, autoReadAloud: v }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-6">
              <p className="flex items-center gap-2 text-sm font-medium text-hub-text">
                <ShieldCheck className="h-4 w-4 text-hub-primary" />
                Your data stays yours
              </p>
              <p className="text-sm text-hub-muted">
                Conversations, check-ins and preferences are never shared without your consent. To request a copy or
                deletion of your data, contact <a href="mailto:support@nsangiza.rw" className="text-hub-primary underline">support@nsangiza.rw</a>.
              </p>
              <SafetyNotice compact />
              <Button variant="ghost" className="text-hub-danger hover:text-hub-danger" onClick={() => void logout()}>
                Sign out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Help & information</CardTitle>
              <CardDescription>Explore Nsangiza Hub, find support and review our policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {FOOTER_LINKS.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-hub-muted transition-colors hover:text-hub-primary">
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
              <Separator />
              <p className="text-xs text-hub-muted">
                © {new Date().getFullYear()} {t('footer.crisis')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}