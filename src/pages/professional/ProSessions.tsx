import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate, formatTime } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useAppointments, useAppointmentStatus } from '../../services/appointments'
import { useProfessionalClients } from '../../services/professional'
import type { Appointment } from '../../types'

export default function ProSessions() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const { data, isLoading } = useAppointments({ status: undefined, pageSize: 50 })
  const clients = useProfessionalClients()
  const statusMutation = useAppointmentStatus()

  const clientName = (userId: string) => clients.data?.data.clients.find((c) => c.id === userId)?.displayName ?? 'Client'

  const appointments = (data?.data.appointments ?? []).filter((a) =>
    tab === 'upcoming' ? ['requested', 'confirmed', 'rescheduled'].includes(a.status) : ['completed', 'cancelled', 'no-show'].includes(a.status),
  )

  async function setStatus(a: Appointment, status: 'confirmed' | 'completed' | 'cancelled' | 'no-show') {
    try {
      await statusMutation.mutateAsync({ id: a._id, status })
      toast.success(`Session ${status}.`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update this session.')
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
                        <p className="font-semibold text-hub-text">{clientName(String(a.user))}</p>
                        <Badge variant={a.status === 'requested' ? 'warning' : a.status === 'confirmed' ? 'success' : 'info'}>{a.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-hub-muted">
                        {a.type} · {formatDate(a.date)} at {formatTime(a.date)} · {a.durationMin} min
                      </p>
                      {a.notes ? <p className="mt-1 text-xs text-slate-400">Note: {a.notes}</p> : null}
                      {a.status === 'requested' && (
                        <p className="mt-2 text-xs text-hub-warning">Awaiting your confirmation — the user is waiting.</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {a.status === 'requested' && (
                        <>
                          <Button size="sm" onClick={() => void setStatus(a, 'confirmed')}>Confirm</Button>
                          <Button size="sm" variant="ghost" className="text-hub-danger" onClick={() => void setStatus(a, 'cancelled')}>Decline</Button>
                        </>
                      )}
                      {a.status === 'confirmed' && (
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
                        <p className="font-semibold text-hub-text">{clientName(String(a.user))}</p>
                        <Badge variant={a.status === 'completed' ? 'secondary' : 'danger'}>{a.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-hub-muted">{formatDate(a.date)} at {formatTime(a.date)} · {a.type}</p>
                    </div>
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