import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { useI18n } from '../../i18n/LanguageProvider'
import { useAppointments, useCancelAppointment, useUpdateAppointment } from '../../services/appointments'
import { useOpenAppointmentSession } from '../../services/conversations'
import type { Appointment } from '../../types'
function isUpcomingStatus(status: string) {
  return ['requested', 'confirmed', 'rescheduled'].includes(status)
}
function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const cancelMutation = useCancelAppointment()
  const updateMutation = useUpdateAppointment()
  const openSession = useOpenAppointmentSession()
  const [detailOpen, setDetailOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [newDateTime, setNewDateTime] = useState('')
  const [busy, setBusy] = useState<'cancel' | 'reschedule' | null>(null)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  const upcoming = isUpcomingStatus(appointment.status)
  const start = new Date(appointment.date)
  const end = appointment.endDate ? new Date(appointment.endDate) : new Date(start.getTime() + (appointment.durationMin || 45) * 60_000)
  const beforeStart = now < start.getTime()
  const joinable = appointment.status === 'confirmed' && now >= start.getTime() - 10 * 60_000 && now <= end.getTime() + 15 * 60_000
  async function doCancel() {
    setBusy('cancel')
    try {
      await cancelMutation.mutateAsync(appointment._id)
      setCancelOpen(false)
      setDetailOpen(false)
      toast.success(t('appt.cancelled'))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t('appt.cancelError'))
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
      toast.success(t('appt.rescheduled'))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t('appt.rescheduleError'))
    } finally {
      setBusy(null)
    }
  }
  async function joinContent() {
    try {
      const result = await openSession.mutateAsync(appointment._id)
      navigate(`/app/messages/${result.data.conversation.id}`)
      setDetailOpen(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not open your supporter session.')
    }
  }
  function joinButton() {
    if (appointment.type === 'Secure chat') {
      return (
        <Button size="sm" className="inline-flex items-center gap-1.5" onClick={() => void joinContent()} disabled={openSession.isPending}>
          <MessageSquare className="h-4 w-4" />
          {openSession.isPending ? 'Opening…' : t('appt.joinChat')}
        </Button>
      )
    }
    if (appointment.type === 'In-person') {
      return (
        <p className="inline-flex items-center gap-1.5 text-sm text-hub-muted">
          <MapPin className="h-4 w-4 text-hub-primary" />
          {t('appt.joinLocation')}
        </p>
      )
    }
    return (
      <div className="flex items-center gap-3">
        <Button size="sm" className="inline-flex items-center gap-1.5" onClick={() => void joinContent()} disabled={openSession.isPending}>
          <Video className="h-4 w-4" />
          {openSession.isPending ? 'Opening…' : t('appt.openSession')}
        </Button>
        <p className="text-xs text-hub-muted">{t('appt.linkNote')}</p>
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
            {appointment.notes ? <p className="mt-2 line-clamp-2 text-sm text-hub-muted">{t('appt.note', { note: appointment.notes })}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {joinable ? (
              <Button size="sm" className="inline-flex items-center gap-1.5" onClick={() => setDetailOpen(true)}>
                <Video className="h-4 w-4" />
                {t('appt.joinSession')}
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => setDetailOpen(true)}>
              {t('appt.details')}
            </Button>
            {upcoming && beforeStart ? (
              <>
                <Button size="sm" variant="ghost" onClick={() => setRescheduleOpen(true)}>
                  {t('appt.reschedule')}
                </Button>
                <Button size="sm" variant="ghost" className="text-hub-danger hover:text-hub-danger" onClick={() => setCancelOpen(true)} disabled={busy === 'cancel'}>
                  {busy === 'cancel' ? t('appt.cancelling') : t('appt.cancel')}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('appt.sessionWith', { name: appointment.professionalName })}</DialogTitle>
            <DialogDescription>
              {formatDate(appointment.date)} at {formatTime(appointment.date)}
              {appointment.durationMin ? ` · ${appointment.durationMin} min` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <span className="text-hub-muted">{t('appt.status')}</span>
              <StatusBadge status={appointment.status} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <span className="text-hub-muted">{t('appt.type')}</span>
              <span className="font-medium text-hub-text">{appointment.type}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <span className="text-hub-muted">{t('appt.sessionId')}</span>
              <span className="font-mono text-xs text-hub-muted">{appointment._id.slice(-8).toUpperCase()}</span>
            </div>
            {appointment.notes ? (
              <div className="rounded-xl border border-slate-100 px-3 py-2.5">
                <p className="text-hub-muted">{t('appt.yourNote')}</p>
                <p className="mt-1 text-hub-text">{appointment.notes}</p>
              </div>
            ) : null}
            {joinable ? <div className="rounded-xl bg-hub-primary-light/60 px-3 py-3">{joinButton()}</div> : null}
            {upcoming && beforeStart ? (
              <div className="flex items-center gap-2 text-xs text-hub-muted">
                <Clock3 className="h-3.5 w-3.5 text-hub-primary" />
                {t('appt.help')}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              {t('common.close')}
            </Button>
            {upcoming && beforeStart ? (
              <>
                <Button variant="ghost" onClick={() => { setDetailOpen(false); setRescheduleOpen(true) }}>
                  {t('appt.reschedule')}
                </Button>
                <Button variant="ghost" className="text-hub-danger" onClick={() => { setDetailOpen(false); setCancelOpen(true) }}>
                  {t('appt.cancelAppointment')}
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('appt.rescheduleTitle')}</DialogTitle>
            <DialogDescription>{t('appt.rescheduleBody')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor={`reschedule-${appointment._id}`}>{t('appt.newDateTime')}</Label>
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
              {t('appt.keepCurrent')}
            </Button>
            <Button onClick={() => void doReschedule()} disabled={!newDateTime || busy === 'reschedule'}>
              {busy === 'reschedule' ? t('appt.rescheduling') : t('appt.reschedule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('appt.cancelTitle')}</DialogTitle>
            <DialogDescription>{t('appt.cancelBody')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              {t('common.keep')}
            </Button>
            <Button variant="ghost" className="text-hub-danger" onClick={() => void doCancel()} disabled={busy === 'cancel'}>
              {busy === 'cancel' ? t('appt.cancelling') : t('appt.cancelAppointment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
export default function Appointments() {
  const { t } = useI18n()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  const { data, isLoading } = useAppointments({ pageSize: 50 })
  const all = data?.data.appointments ?? []
  const hasEnded = (a: Appointment) => new Date(a.endDate ?? new Date(new Date(a.date).getTime() + (a.durationMin || 45) * 60_000)).getTime() < now
  const upcoming = all.filter((a) => isUpcomingStatus(a.status) && !hasEnded(a))
  const past = all.filter((a) => !isUpcomingStatus(a.status) || hasEnded(a))
  return (
    <div>
      <PageHeader
        title={t('appt.title')}
        description={t('appt.desc')}
        actions={
          <Link to="/professionals">
            <Button className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {t('appt.bookNew')}
            </Button>
          </Link>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'upcoming' | 'past')}>
        <TabsList>
          <TabsTrigger value="upcoming">{t('appt.upcoming')}</TabsTrigger>
          <TabsTrigger value="past">{t('appt.past')}</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {isLoading ? (
            <Loading label={t('appt.loading')} />
          ) : upcoming.length === 0 ? (
            <EmptyState
              title={t('appt.empty.upcoming')}
              description={t('appt.empty.upcomingBody')}
              action={
                <Link to="/professionals">
                  <Button>{t('appt.findSupport')}</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">{upcoming.map((a) => <AppointmentCard key={a._id} appointment={a} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {isLoading ? (
            <Loading label={t('appt.loadingHistory')} />
          ) : past.length === 0 ? (
            <EmptyState title={t('appt.empty.past')} />
          ) : (
            <div className="space-y-3">{past.map((a) => <AppointmentCard key={a._id} appointment={a} />)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}