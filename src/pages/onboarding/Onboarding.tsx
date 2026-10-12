import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowRight, Check, HeartHandshake, Home as HomeIcon } from 'lucide-react'
import Brand from '../../components/Brand'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { SafetyNotice } from '../../components/SafetyNotice'
import { ApiError } from '../../lib/api'
import { useAssessmentSubmit, useConsent, usePreferences } from '../../services/users'
import { useAuth } from '../../hooks/auth-context'
import { CITIES, LANGUAGES, COMMUNICATION_PREFERENCES } from '../../lib/constants'

const STEPS = ['Welcome', 'Consent', 'Preferences', 'Check-in', 'Results']
const AGE_RANGES = ['Under 18', '18-25', '26-35', '36-50', 'Over 50']
const FREQ_OPTIONS = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
const STRESS_OPTIONS = ['Low', 'Moderate', 'High', 'Very high']
const SAFETY_OPTIONS = ['No', 'Sometimes', 'Yes']

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const consentMutation = useConsent()
  const preferencesMutation = usePreferences()
  const assessmentMutation = useAssessmentSubmit()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [preferredLanguage, setPreferredLanguage] = useState<string>(user?.preferredSupportLanguage ?? 'Kinyarwanda')
  const [language, setLanguage] = useState<string>(user?.language ?? 'Kinyarwanda')
  const [city, setCity] = useState<string>(user?.city ?? '')
  const [ageRange, setAgeRange] = useState<string>(user?.ageRange ?? '')
  const [communicationPreference, setCommunicationPreference] = useState<string>(user?.communicationPreference ?? 'Secure chat')

  const [freqDown, setFreqDown] = useState('')
  const [freqInterest, setFreqInterest] = useState('')
  const [stress, setStress] = useState('')
  const [safety, setSafety] = useState('')
  const [safetyFlagged, setSafetyFlagged] = useState(false)

  const [busy, setBusy] = useState(false)

  const isProfessional = user?.role === 'PROFESSIONAL'

  async function finish() {
    void queryClient.invalidateQueries({ queryKey: ['me'] })
    navigate(isProfessional ? '/professional' : '/app')
  }

  async function next() {
    setBusy(true)
    try {
      if (step === 1) {
        await consentMutation.mutateAsync()
      } else if (step === 2) {
        if (!preferredLanguage || !language || !city) {
          toast.error('Please complete your preferences before continuing.')
          setBusy(false)
          return
        }
        await preferencesMutation.mutateAsync({ displayName, preferredSupportLanguage: preferredLanguage, language, city, ageRange, communicationPreference })
      } else if (step === 3) {
        if (!freqDown || !freqInterest || !stress) {
          toast.error('Please answer all questions so we can tailor your space.')
          setBusy(false)
          return
        }
        const answers = { q_frequency_down: freqDown, q_frequency_interest: freqInterest, q_stress: stress, q_safety: safety || 'No', notes: '' }
        const flagged = safety === 'Yes' || safety === 'Sometimes'
        setSafetyFlagged(flagged)
        if (flagged) {
          // Record the check-in for follow-up, but surface safety help instead of recommending providers.
          const summary = 'You shared that you may be having thoughts about hurting yourself. This is important — please use the safety guidance and contact a professional as soon as you can.'
          try {
            await assessmentMutation.mutateAsync({ answers, summary, safetyFlag: true, safetyNote: summary })
          } catch {
            // never block the safety screen on a failed save
          }
        } else {
          const highSigns = (freqDown === 'Nearly every day' || freqDown === 'More than half the days') ? true : false
          const summary = highSigns || freqInterest === 'Nearly every day'
            ? 'You may be experiencing significant stress or low mood. Gentle support from a professional could help you find ways through.'
            : 'You look after your wellbeing well. Nsangiza Hub can still help you build resilience and stay supported.'
          await assessmentMutation.mutateAsync({ answers, summary, safetyFlag: false })
        }
      }
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const nextDisabled = useMemo(() => {
    if (step === 2) return !preferredLanguage || !language || !city
    if (step === 3) return !freqDown || !freqInterest || !stress
    return false
  }, [step, preferredLanguage, language, city, freqDown, freqInterest, stress])

  const title = STEPS[step]

  return (
    <div className="flex min-h-screen flex-col bg-hub-background">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-hub flex h-16 items-center justify-between">
          <Brand to="/" />
          <button onClick={finish} className="inline-flex items-center gap-1 text-sm text-hub-muted hover:text-hub-text">
            <HomeIcon className="h-4 w-4" />
            Skip for now
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <div className="mb-6 flex items-center gap-1.5" aria-label="Progress">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col gap-1">
              <div className={`h-1.5 rounded-full ${i <= step ? 'bg-hub-primary' : 'bg-slate-200'}`} />
              <span className={`text-[10px] font-medium ${i === step ? 'text-hub-primary' : 'text-slate-400'}`}>{s}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-2xl font-bold text-hub-text">{title}</h1>

          {step === 0 && (
            <div className="mt-4">
              <p className="text-hub-muted">
                Muraho, <span className="font-semibold text-hub-text">{user?.displayName}</span>! This short,
                private journey helps us set up your space: your preferred language, how you'd like to talk, and how
                support should find you. Nothing here is shared with anyone.
              </p>
              <p className="mt-3 text-sm text-hub-muted">
                If you or someone you know is in danger right now, please reach out to emergency services first.
              </p>
              <div className="mt-4"><SafetyNotice /></div>
            </div>
          )}

          {step === 1 && (
            <div className="mt-4 space-y-4">
              <p className="text-hub-muted">
                You are about to use a service that stores some of your personal information so we can match you with
                the right kind of support. A clear version of what we store and why is in the{' '}
                <a className="underline" href="/privacy" target="_blank" rel="noreferrer">privacy policy</a>.
              </p>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-hub-muted">
                <li>Your account details (name, email, city and language) — so we can contact you and recommend nearby support.</li>
                <li>Your self-reported wellbeing check-ins — so your support professional can help you over time.</li>
                <li>We never sell your data, and you can request deletion at any time.</li>
              </ul>
              <p className="rounded-xl bg-hub-primary-light p-4 text-sm font-medium text-hub-primary">
                Continuing means you agree to these terms.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="mt-4 space-y-5">
              <p className="text-sm text-hub-muted">These preferences shape how we recommend support and how we reach you.</p>
              <div className="space-y-1.5">
                <Label htmlFor="onb-name">Your name</Label>
                <Input id="onb-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Your preferred language</Label>
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Comfortable speaking in</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="onb-city">City / district</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger><SelectValue placeholder="Choose your area" /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Age range</Label>
                  <Select value={ageRange} onValueChange={setAgeRange}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      {AGE_RANGES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>How would you like to talk?</Label>
                <Select value={communicationPreference} onValueChange={setCommunicationPreference}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION_PREFERENCES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && !safetyFlagged && (
            <div className="mt-4 space-y-5">
              <p className="text-sm text-hub-muted">
                Thinking about the last two weeks, how often…? There are no right or wrong answers — this helps us
                recommend the right level of support.
              </p>
              {[
                { label: 'Have you felt down, depressed or hopeless?', value: freqDown, set: setFreqDown },
                { label: 'Have you had little interest or pleasure in doing things?', value: freqInterest, set: setFreqInterest },
              ].map((q) => (
                <div key={q.label} className="space-y-2">
                  <p className="text-sm font-medium text-hub-text">{q.label}</p>
                  <RadioGroup value={q.value} onValueChange={q.set}>
                    {FREQ_OPTIONS.map((opt) => (
                      <label key={opt} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:border-hub-primary/40">
                        <RadioGroupItem value={opt} />
                        {opt}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <div className="space-y-2">
                <p className="text-sm font-medium text-hub-text">How would you rate your current stress level?</p>
                <RadioGroup value={stress} onValueChange={setStress}>
                  {STRESS_OPTIONS.map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:border-hub-primary/40">
                      <RadioGroupItem value={opt} />
                      {opt}
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2 rounded-xl border border-hub-warning/30 bg-amber-50 p-4">
                <p className="text-sm font-medium text-hub-text">
                  Recently, have you found yourself thinking that you'd be better off not being here, or about harming yourself?
                </p>
                <RadioGroup value={safety} onValueChange={setSafety}>
                  {SAFETY_OPTIONS.map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2.5 rounded-lg bg-white px-3 py-2 text-sm hover:bg-amber-100/60">
                      <RadioGroupItem value={opt} />
                      {opt}
                    </label>
                  ))}
                </RadioGroup>
                <p className="text-xs text-hub-muted">
                  Whatever you choose, this does not block your access. If you choose "Yes", we will show help options next.
                </p>
              </div>
            </div>
          )}

          {step === 3 && safetyFlagged && (
            <div className="mt-4 space-y-4">
              <SafetyNotice />
              <p className="text-hub-muted">
                Thank you for being honest with us. Please call the numbers above or reach a trusted person or health
                facility now. Your wellbeing matters more than anything we can do here.
              </p>
              <p className="text-sm text-hub-muted">
                What you shared has been privately flagged for a human reviewer so they can reach out to support you —
                not to police you.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-hub-primary-light p-4">
                <HeartHandshake className="mt-0.5 h-6 w-6 text-hub-primary" />
                <div>
                  <p className="font-semibold text-hub-primary">Your space is ready.</p>
                  <p className="mt-1 text-sm text-hub-muted">
                    {safetyFlagged
                      ? 'A reviewer may reach out, and you can start chatting, booking, or exploring resources at any time.'
                      : 'You can now find professionals, book sessions, message your support, and explore community and resources.'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-hub-muted">
                Head to your dashboard — it is private to you and protects your confidentiality.
              </p>
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-hub-success">
                <Check className="h-5 w-5" />
                Consent recorded, preferences saved, and your self check-in noted.
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} disabled={busy || nextDisabled} className="inline-flex items-center gap-1.5">
                {busy ? 'Saving…' : 'Continue'}
                {!busy && <ArrowRight className="h-4 w-4" />}
              </Button>
            ) : (
              <Button type="button" onClick={finish} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                Go to my space
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}