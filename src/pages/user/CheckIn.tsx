import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Activity } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Textarea } from '../../components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Checkbox } from '../../components/ui/checkbox'
import { PageHeader, Loading } from '../../components/PageHeader'
import { ApiError } from '../../lib/api'
import { useCheckIns, useCreateCheckIn, useWellbeingTrend } from '../../services/users'
import { MOOD_LABELS, CHECKIN_FACTORS } from '../../lib/constants'
import { formatDate } from '../../lib/format'
import type { MoodLevel } from '../../types'

const MOODS: MoodLevel[] = ['very-difficult', 'difficult', 'okay', 'good', 'very-good']

export default function CheckIn() {
  const [mood, setMood] = useState<MoodLevel>('okay')
  const [factors, setFactors] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const createMutation = useCreateCheckIn()
  const { data: history, isLoading } = useCheckIns()
  const { data: trend, isError: trendError } = useWellbeingTrend()

  const topFactors = useMemo(() => trend?.data.topFactors.slice(0, 5) ?? [], [trend])

  function toggleFactor(f: string) {
    setFactors((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))
  }

  async function submit() {
    setSubmitting(true)
    try {
      await createMutation.mutateAsync({ mood, factors, note: note.trim() || undefined })
      toast.success('Checked in. Thank you for taking care of yourself.')
      setNote('')
      setFactors([])
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save your check-in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="How are you today?"
        description="This is just for you and your support team. It takes under a minute."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your mood right now</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={mood} onValueChange={(v) => setMood(v as MoodLevel)} className="grid gap-2 sm:grid-cols-2">
                {MOODS.map((m) => (
                  <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${mood === m ? 'border-hub-primary bg-hub-primary-light' : 'border-slate-200 hover:border-hub-primary/40'}`}>
                    <RadioGroupItem value={m} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: MOOD_LABELS[m].color }} />
                    <span className="font-medium text-hub-text">{MOOD_LABELS[m].label}</span>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What's on your mind?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CHECKIN_FACTORS.map((f) => (
                  <label key={f} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${factors.includes(f) ? 'border-hub-primary bg-hub-primary-light text-hub-primary' : 'border-slate-200 text-hub-muted hover:border-hub-primary/40'}`}>
                    <Checkbox checked={factors.includes(f)} onCheckedChange={() => toggleFactor(f)} className="h-3.5 w-3.5" />
                    {f}
                  </label>
                ))}
              </div>
              <div className="mt-4 space-y-1.5">
                <label htmlFor="checkin-note" className="text-sm font-medium text-hub-text">Anything else? (optional)</label>
                <Textarea id="checkin-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="One or two lines about how things feel today." />
              </div>
              <Button className="mt-4" onClick={submit} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save check-in'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-hub-primary" />Your wellbeing trend</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loading label="Loading your trend…" />
              ) : (history?.data.checkIns ?? []).length === 0 ? (
                <p className="text-sm text-hub-muted">No check-ins yet — your first one starts the picture of your wellbeing over time.</p>
              ) : (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {(history?.data.checkIns ?? []).slice(0, 21).reverse().map((c) => (
                      <div key={c._id} className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 px-2 py-2" title={`${formatDate(c.createdAt)} — ${MOOD_LABELS[c.mood]?.label ?? c.mood}`}>
                        <span className="h-3 w-3 rounded-full" style={{ background: MOOD_LABELS[c.mood]?.color }} />
                        <span className="text-[10px] text-slate-400">{formatDate(c.createdAt, { day: 'numeric', month: 'short' })}</span>
                      </div>
                    ))}
                  </div>
                  {trendError ? (
                    <p className="mt-4 text-sm text-hub-muted">Could not load your factors right now. Check-in again shortly to see your patterns.</p>
                  ) : topFactors.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-hub-muted">Most common factors</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {topFactors.map((f) => (
                          <span key={f.label} className="rounded-full bg-hub-primary-light px-3 py-1 text-xs font-medium text-hub-primary">
                            {f.label} · {f.count}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Why it helps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-hub-muted">
              <p>
                Regular check-ins help your professional understand your pattern — not just your worst days. They also
                help us recommend resources that match how you're really doing.
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Your check-ins are private and shared only with the professionals caring for you.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}