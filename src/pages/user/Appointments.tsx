import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CalendarDays, Clock3, MapPin, MessageSquare, Video } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { StatusBadge } from '../../components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { formatDate, formatTime } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useAppointments, useCancelAppointment, useUpdateAppointment } from '../../services/appointments'
import type { Appointment } from '../../types'

function isUpcomingStatus(status: string) {
  return ['requested', 'confirmed', 'rescheduled'].includes(status)
}

function localDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const cancelMutation = useCancelAppointment()
  const updateMutation = useUpdateAppointment()
  const [detailOpen, setDetailOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [newDateTime, setNewDateTime] = useState('')
  const [busy, setBusy] = useState<'cancel' | 'reschedule' | null>(null)

  const upcoming = isUpcomingStatus(appointment.status)
  const start = new Date(appointment.date)
  const isToday = localDateKey(start) === localDateKey(new Date())
  const isPast = start.getTime() < Date.now() - 15 * 60_000
  const joinable = appointment.status === 'confirmed' && isToday && !isPast

  async function doCancel() {
    setBusy('cancel')
    try {
      await cancelMutation.mutateAsync(appointment._id)
      setCancelOpen(false)
      setDetailOpen(false)
      toast.success('Appointment cancelled.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not cancel.')
    } finally {
      setBusy(null)
    }
  }

  async function doReschedule() {
    if (!newDateTime) return
    setBusy('reschedule')
    try {
      await updateMutation.mutateAsync({ id: appointment._id, body: { date: new Date(newDateTime).toISOString() } })
      setRescheduleOpen(false)
      setDetailOpen(false)
      toast.success('Session rescheduled. Your professional has been notified.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not reschedule.')
    } finally {
      setBusy(null)
    }
  }

  function joinContent() {
    if (appointment.type === 'Secure chat') {
      return (
        <Link to="/app/messages">
          <Button size="sm" className="inline-flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Open secure chat
          </Button>
        </Link>
      )
    }
    if (appointment.type === 'In-person') {
      return (
        <p className="inline-flex items-center gap-1.5 text-sm text-hub-muted">
          <MapPin className="h-4 w-4 text-hub-primary" />
          Your professional will share the meeting location.
        </p>
      )
    }
    return (
      <div className="flex items-center gap-3">
        <Link to="/app/messages">
          <Button size="sm" className="inline-flex items-center gap-1.5">
            <Video className="h-4 w-4" />
            Open session
          </Button>
        </Link>
        <p className="text-xs text-hub-muted">Your professional opens the call and sends the link in your messages.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-hub-text">{appointment.professionalName}</p>
              <StatusBadge status={appointment.status} />
            </div>
            <p className="mt-1 text-sm text-hub-muted">
              {appointment.type} · {formatDate(appointment.date)} at {formatTime(appointment.date)}
              {appointment.durationMin ? ` · ${appointment.durationMin} min` : ''}
            </p>
            {appointment.notes ? <p className="mt-2 line-clamp-2 text-sm text-hub-muted">Note: {appointment.notes}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {joinable ? (
              <Button size="sm" className="inline-flex items-center gap-1.5" onClick={() => setDetailOpen(true)}>
                <Video className="h-4 w-4" />
                Join session
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => setDetailOpen(true)}>
              Details
            </Button>
            {upcoming && !isPast ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setRescheduleOpen(true)}>
                  Reschedule
                </Button>
                <Button size="sm" variant="ghost" className="text-hub-danger hover:text-hub-danger" onClick={() => setCancelOpen(true)} disabled={busy === 'cancel'}>
                  {busy === 'cancel' ? 'Cancelling…' : 'Cancel'}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session with {appointment.professionalName}</DialogTitle>
            <DialogDescription>
              {formatDate(appointment.date)} at {formatTime(appointment.date)}
              {appointment.durationMin ? ` · ${appointment.durationMin} min` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <span className="text-hub-muted">Status</span>
              <StatusBadge status={appointment.status} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <span className="text-hub-muted">Type</span>
              <span className="font-medium text-hub-text">{appointment.type}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <span className="text-hub-muted">Session ID</span>
              <span className="font-mono text-xs text-hub-muted">{appointment._id.slice(-8).toUpperCase()}</span>
            </div>
            {appointment.notes ? (
              <div className="rounded-xl border border-slate-100 px-3 py-2.5">
                <p className="text-hub-muted">Your note</p>
                <p className="mt-1 text-hub-text">{appointment.notes}</p>
              </div>
            ) : null}
            {joinable ? <div className="rounded-xl bg-hub-primary-light/60 px-3 py-3">{joinContent()}</div> : null}
            {upcoming && !isPast ? (
              <div className="flex items-center gap-2 text-xs text-hub-muted">
                <Clock3 className="h-3.5 w-3.5 text-hub-primary" />
                Need a different time? Reschedule or cancel — your professional is notified either way.
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
            {upcoming && !isPast ? (
              <>
                <Button variant="ghost" onClick={() => { setDetailOpen(false); setRescheduleOpen(true) }}>
                  Reschedule
                </Button>
                <Button variant="ghost" className="text-hub-danger" onClick={() => { setDetailOpen(false); setCancelOpen(true) }}>
                  Cancel session
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule this session?</DialogTitle>
            <DialogDescription>Pick a new date and time. Your professional will be notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor={`reschedule-${appointment._id}`}>New date and time</Label>
            <Input
              id={`reschedule-${appointment._id}`}
              type="datetime-local"
              min={new Date(Date.now() + 30 * 60_000).toISOString().slice(0, 16)}
              value={newDateTime}
              onChange={(e) => setNewDateTime(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>
              Keep current time
            </Button>
            <Button onClick={() => void doReschedule()} disabled={!newDateTime || busy === 'reschedule'}>
              {busy === 'reschedule' ? 'Rescheduling…' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this appointment?</DialogTitle>
            <DialogDescription>Your professional will be notified. You can book again anytime.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep it
            </Button>
            <Button variant="ghost" className="text-hub-danger" onClick={() => void doCancel()} disabled={busy === 'cancel'}>
              {busy === 'cancel' ? 'Cancelling…' : 'Cancel appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default function Appointments() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const { data, isLoading } = useAppointments({ pageSize: 50 })

  const all = data?.data.appointments ?? []
  const upcoming = all.filter((a) => isUpcomingStatus(a.status))
  const past = all.filter((a) => !isUpcomingStatus(a.status))

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Your sessions with verified professionals — request, confirm and join."
        actions={
          <Link to="/professionals">
            <Button className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              Book new
            </Button>
          </Link>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'upcoming' | 'past')}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {isLoading ? (
            <Loading label="Loading appointments…" />
          ) : upcoming.length === 0 ? (
            <EmptyState
              title="No upcoming appointments"
              description="When you're ready, find a professional and request your first session."
              action={
                <Link to="/professionals">
                  <Button>Find support</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">{upcoming.map((a) => <AppointmentCard key={a._id} appointment={a} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {isLoading ? (
            <Loading label="Loading history…" />
          ) : past.length === 0 ? (
            <EmptyState title="No past sessions yet" />
          ) : (
            <div className="space-y-3">{past.map((a) => <AppointmentCard key={a._id} appointment={a} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
