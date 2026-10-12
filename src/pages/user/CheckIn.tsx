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
import { useI18n } from '../../i18n/LanguageProvider'
import type { MoodLevel } from '../../types'

const MOODS: MoodLevel[] = ['very-difficult', 'difficult', 'okay', 'good', 'very-good']

export default function CheckIn() {
  const { t, tl } = useI18n()
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
      toast.success(t('checkin.saved'))
      setNote('')
      setFactors([])
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t('checkin.saveError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={t('checkin.title')}
        description={t('checkin.desc')}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('checkin.mood.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={mood} onValueChange={(v) => setMood(v as MoodLevel)} className="grid gap-2 sm:grid-cols-2">
                {MOODS.map((m) => (
                  <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${mood === m ? 'border-hub-primary bg-hub-primary-light' : 'border-slate-200 hover:border-hub-primary/40'}`}>
                    <RadioGroupItem value={m} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: MOOD_LABELS[m].color }} />
                    <span className="font-medium text-hub-text">{tl(`mood.${m}`)}</span>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('checkin.mind.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CHECKIN_FACTORS.map((f) => (
                  <label key={f} className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors ${factors.includes(f) ? 'border-hub-primary bg-hub-primary-light text-hub-primary' : 'border-slate-200 text-hub-muted hover:border-hub-primary/40'}`}>
                    <Checkbox checked={factors.includes(f)} onCheckedChange={() => toggleFactor(f)} className="h-3.5 w-3.5" />
                    {tl(`factor.${f}`)}
                  </label>
                ))}
              </div>
              <div className="mt-4 space-y-1.5">
                <label htmlFor="checkin-note" className="text-sm font-medium text-hub-text">{t('checkin.note.label')}</label>
                <Textarea id="checkin-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder={t('checkin.note.placeholder')} />
              </div>
              <Button className="mt-4" onClick={submit} disabled={submitting}>
                {submitting ? t('common.saving') : t('checkin.submit')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-hub-primary" />{t('checkin.trend.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loading label={t('checkin.trend.loading')} />
              ) : (history?.data.checkIns ?? []).length === 0 ? (
                <p className="text-sm text-hub-muted">{t('checkin.trend.empty')}</p>
              ) : (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {(history?.data.checkIns ?? []).slice(0, 21).reverse().map((c) => (
                      <div key={c._id} className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 px-2 py-2" title={`${formatDate(c.createdAt)} — ${tl(`mood.${c.mood}`)}`}>
                        <span className="h-3 w-3 rounded-full" style={{ background: MOOD_LABELS[c.mood]?.color }} />
                        <span className="text-[10px] text-slate-400">{formatDate(c.createdAt, { day: 'numeric', month: 'short' })}</span>
                      </div>
                    ))}
                  </div>
                  {trendError ? (
                    <p className="mt-4 text-sm text-hub-muted">{t('checkin.trend.error')}</p>
                  ) : topFactors.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-hub-muted">{t('checkin.trend.factors')}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {topFactors.map((f) => (
                          <span key={f.label} className="rounded-full bg-hub-primary-light px-3 py-1 text-xs font-medium text-hub-primary">
                            {tl(`factor.${f.label}`)} · {f.count}
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
              <CardTitle className="text-base">{t('checkin.why.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-hub-muted">
              <p>{t('checkin.why.body')}</p>
              <p className="mt-3 text-xs text-slate-400">{t('checkin.why.note')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}