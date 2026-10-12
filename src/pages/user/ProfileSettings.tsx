import { useEffect, useState } from 'react'
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
import { useProfileUpdate } from '../../services/users'
import { CITIES, LANGUAGES, COMMUNICATION_PREFERENCES } from '../../lib/constants'

export default function ProfileSettings() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const updateMutation = useProfileUpdate()

  const [displayName, setDisplayName] = useState('')
  const [city, setCity] = useState('')
  const [language, setLanguage] = useState('')
  const [preferred, setPreferred] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [communication, setCommunication] = useState('')
  const [notif, setNotif] = useState({ appointmentReminders: true, messages: true, followUps: true, community: false, system: true })
  const [privacy, setPrivacy] = useState({ reduceMotion: false, simpleView: false, allowAnalytics: true })
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
              <CardTitle>Privacy settings</CardTitle>
              <CardDescription>How the app looks and what we learn from your usage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hub-text">Reduce motion</p>
                  <p className="text-xs text-hub-muted">Fewer moving elements, gentler experience.</p>
                </div>
                <Switch checked={privacy.reduceMotion} onCheckedChange={(v) => setPrivacy((s) => ({ ...s, reduceMotion: v }))} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hub-text">Simple view</p>
                  <p className="text-xs text-hub-muted">Larger text, less visual clutter.</p>
                </div>
                <Switch checked={privacy.simpleView} onCheckedChange={(v) => setPrivacy((s) => ({ ...s, simpleView: v }))} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-hub-text">Allow anonymised analytics</p>
                  <p className="text-xs text-hub-muted">Helps us improve the service without identifying you.</p>
                </div>
                <Switch checked={privacy.allowAnalytics} onCheckedChange={(v) => setPrivacy((s) => ({ ...s, allowAnalytics: v }))} />
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
        </div>
      </div>
    </div>
  )
}