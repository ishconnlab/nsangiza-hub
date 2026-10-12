import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { PageHeader, Loading } from '../../components/PageHeader'
import { ApiError } from '../../lib/api'
import { useProfessionalProfile, useUpdateProfessionalProfile } from '../../services/professional'
import type { AvailabilitySlot } from '../../types'
import { DAYS } from '../../lib/constants'

export default function ProAvailability() {
  const { data, isLoading } = useProfessionalProfile()
  const update = useUpdateProfessionalProfile()

  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const existing = data?.data.professional.availability
    if (existing && existing.length > 0) {
      setSlots(DAYS.map((day) => existing.find((e) => e.day === day) ?? { day, start: '08:00', end: '17:00', enabled: false }))
    } else {
      setSlots(DAYS.map((day) => ({ day, start: '08:00', end: '17:00', enabled: false })))
    }
  }, [data?.data.professional.availability])

  if (isLoading) return <Loading label="Loading your availability…" />

  function set(key: number, patch: Partial<AvailabilitySlot>) {
    setSlots((s) => s.map((slot, i) => (i === key ? { ...slot, ...patch } : slot)))
  }

  async function save() {
    setBusy(true)
    try {
      await update.mutateAsync({ availability: slots })
      toast.success('Availability updated.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save availability.')
    } finally {
      setBusy(false)
    }
  }

  const enabled = slots.filter((s) => s.enabled).length

  return (
    <div>
      <PageHeader
        title="Availability"
        description="Set the weekly hours users can see when booking with you. Users only see enabled times."
        actions={<Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save availability'}</Button>}
      />

      <Card>
        <CardHeader>
          <CardTitle>Weekly schedule</CardTitle>
          <CardDescription>{enabled} of 7 days active · sessions run between your chosen hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {slots.map((slot, i) => (
            <div key={slot.day} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <Switch checked={slot.enabled} onCheckedChange={(v) => set(i, { enabled: v })} />
                <span className={`w-24 text-sm font-medium ${slot.enabled ? 'text-hub-text' : 'text-slate-400'}`}>{slot.day}</span>
              </div>
              <div className={`flex items-center gap-2 ${slot.enabled ? 'opacity-100' : 'pointer-events-none opacity-40'}`}>
                <div>
                  <Label htmlFor={`start-${i}`} className="sr-only">Start time</Label>
                  <Input id={`start-${i}`} type="time" value={slot.start} onChange={(e) => set(i, { start: e.target.value })} className="h-9 w-32" />
                </div>
                <span className="text-sm text-slate-400">to</span>
                <div>
                  <Label htmlFor={`end-${i}`} className="sr-only">End time</Label>
                  <Input id={`end-${i}`} type="time" value={slot.end} onChange={(e) => set(i, { end: e.target.value })} className="h-9 w-32" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-hub-muted">
        Tips: leave consistent gaps between sessions, and keep your in-person slots limited to your practice location.
      </p>
    </div>
  )
}