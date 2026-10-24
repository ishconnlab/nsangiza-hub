import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate, formatTime } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useAppointments, useAppointmentStatus } from '../../services/appointments'
import { useProfessionalClients } from '../../services/professional'
import { useOpenAppointmentSession } from '../../services/conversations'
import type { Appointment } from '../../types'
export default function ProSessions() {
  const navigate = useNavigate()
  const openSession = useOpenAppointmentSession()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  const { data, isLoading } = useAppointments({ status: undefined, pageSize: 50 })
  const clients = useProfessionalClients()
  const statusMutation = useAppointmentStatus()
  const clientName = (userId: string) => clients.data?.data.clients.find((c) => c.id === userId)?.displayName ?? 'Client'
  const appointments = (data?.data.appointments ?? []).filter((a) => {
    const end = new Date(a.endDate ?? new Date(new Date(a.date).getTime() + (a.durationMin || 45) * 60_000)).getTime()
    const ended = end < now
    const active = ['requested', 'confirmed', 'rescheduled'].includes(a.status)
    return tab === 'upcoming' ? active && (a.status === 'requested' || !ended) : !active || ended
  })
  async function setStatus(a: Appointment, status: 'confirmed' | 'completed' | 'cancelled' | 'no-show') {
    try {
      await statusMutation.mutateAsync({ id: a._id, status })
      toast.success(`Session ${status}.`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update this session.')
    }
  }

  async function startSession(a: Appointment) {
    if (a.type === 'Video call' || a.type === 'Audio call') {
      navigate(`/professional/call/${a._id}`)
      return
    }
    try {
      const result = await openSession.mutateAsync(a._id)
      navigate(`/professional/messages/${result.data.conversation.id}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not open this session.')
    }
  }
  return (
    <div>
      <PageHeader title="Sessions" description="Requests, confirmations and completed appointments." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'upcoming' | 'past')}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming & requests</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {isLoading ? <Loading label="Loading sessions…" /> : appointments.length === 0 ? (
            <EmptyState title="No upcoming sessions" description="Appointment requests will appear here for confirmation." />
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <Card key={a._id}>
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/professional/clients/${String(a.user)}`} className="font-semibold text-hub-primary hover:underline">{clientName(String(a.user))} · View client details</Link>
                        <Badge variant={a.status === 'requested' ? 'warning' : a.status === 'confirmed' ? 'success' : 'info'}>{a.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-hub-muted">
                        {a.type} · {formatDate(a.date)} at {formatTime(a.date)} · {a.durationMin} min
                      </p>
                      {a.notes ? <p className="mt-1 text-xs text-slate-400">Note: {a.notes}</p> : null}
                      {['requested', 'rescheduled'].includes(a.status) && (
                        <p className="mt-2 text-xs text-hub-warning">Awaiting your confirmation — the user is waiting.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {['requested', 'rescheduled'].includes(a.status) && (
                        <>
                          <Button size="sm" onClick={() => void setStatus(a, 'confirmed')}>Confirm</Button>
                          <Button size="sm" variant="ghost" className="text-hub-danger" onClick={() => void setStatus(a, 'cancelled')}>Decline</Button>
                        </>
                      )}
                      {a.status === 'confirmed' && (() => {
                        const start = new Date(a.date).getTime()
                        const end = new Date(a.endDate ?? new Date(start + (a.durationMin || 45) * 60_000)).getTime()
                        const canStart = now <= end + 15 * 60_000
                        return <Button size="sm" onClick={() => void startSession(a)} disabled={!canStart || openSession.isPending}>{canStart ? (now < start ? 'Start early' : 'Start session') : 'Session ended'}</Button>
                      })()}
                      {a.status === 'confirmed' && new Date(a.date).getTime() <= now && (
                        <Button size="sm" variant="outline" onClick={() => void setStatus(a, 'completed')}>Mark completed</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="past">
          {isLoading ? <Loading label="Loading history…" /> : appointments.length === 0 ? (
            <EmptyState title="No past sessions" />
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <Card key={a._id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/professional/clients/${String(a.user)}`} className="font-semibold text-hub-primary hover:underline">{clientName(String(a.user))} · View client details</Link>
                        <Badge variant={a.status === 'completed' ? 'secondary' : a.status === 'confirmed' ? 'success' : 'danger'}>{a.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-hub-muted">{formatDate(a.date)} at {formatTime(a.date)} · {a.type}</p>
                    </div>
                    {a.status === 'confirmed' && (
                      <div className="flex flex-wrap gap-2">
                        {new Date(a.date).getTime() <= now && <Button size="sm" variant="outline" onClick={() => void setStatus(a, 'completed')}>Mark completed</Button>}
                        {now >= new Date(a.endDate ?? new Date(new Date(a.date).getTime() + (a.durationMin || 45) * 60_000)).getTime() + 15 * 60_000 && <Button size="sm" variant="ghost" onClick={() => void setStatus(a, 'no-show')}>Mark no-show</Button>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
