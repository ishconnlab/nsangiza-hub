import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CalendarClock, Check, MessageSquareText, UserCheck, X } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate, formatTime, initials } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useAppointments, useAppointmentStatus } from '../../services/appointments'
import { useProfessionalClients } from '../../services/professional'
import type { Appointment, ClientSummary } from '../../types'

function ClientCard({ client }: { client: ClientSummary }) {
  return (
    <Link to={`/professional/clients/${client.id}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hub-primary-light text-sm font-bold text-hub-primary">
              {initials(client.displayName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-hub-text">{client.displayName}</p>
              <p className="text-xs text-hub-muted">{client.city || 'Location not set'} · {client.language}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-hub-muted">
            {client.lastSession ? (
              <Badge variant="secondary">Last session {client.lastSession ? formatDate(client.lastSession) : ''}</Badge>
            ) : (
              <Badge variant="secondary">No session yet</Badge>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-hub-muted">
            <span>{client.appointmentCount} appointment{client.appointmentCount === 1 ? '' : 's'}</span>
            <span className="inline-flex items-center gap-1">
              <MessageSquareText className="h-3.5 w-3.5 text-hub-primary" />
              Messages
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function RequestRow({ appointment, clientName }: { appointment: Appointment; clientName: string }) {
  const status = useAppointmentStatus()

  async function decide(next: 'confirmed' | 'cancelled') {
    try {
      await status.mutateAsync({ id: appointment._id, status: next })
      toast.success(next === 'confirmed' ? 'Request accepted — the client has been notified.' : 'Request declined.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update this request.')
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hub-primary-light text-sm font-bold text-hub-primary">
              {initials(clientName)}
            </span>
            <div>
              <Link to={`/professional/clients/${String(appointment.user)}`} className="font-semibold text-hub-primary hover:underline">{clientName} · View details</Link>
              <p className="inline-flex items-center gap-1.5 text-sm text-hub-muted">
                <CalendarClock className="h-4 w-4 text-hub-primary" />
                {appointment.type} · {formatDate(appointment.date)} at {formatTime(appointment.date)} · {appointment.durationMin} min
              </p>
            </div>
          </div>
          {appointment.notes ? <p className="mt-2 text-xs text-slate-400">Note: {appointment.notes}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" className="inline-flex items-center gap-1.5" onClick={() => void decide('confirmed')} disabled={status.isPending}>
            <Check className="h-4 w-4" /> Accept
          </Button>
          <Button size="sm" variant="ghost" className="inline-flex items-center gap-1.5 text-hub-danger" onClick={() => void decide('cancelled')} disabled={status.isPending}>
            <X className="h-4 w-4" /> Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProClients() {
  const { data, isLoading } = useProfessionalClients()
  const { data: appointmentsData, isLoading: loadingAppointments } = useAppointments({ pageSize: 50 })

  const clients = data?.data.clients ?? []
  const nameFor = (userId: string) => clients.find((c) => c.id === userId)?.displayName ?? 'Client'
  const requests = (appointmentsData?.data.appointments ?? []).filter((a) => a.status === 'requested')

  return (
    <div>
      <PageHeader title="Your clients" description="Accept new client requests and open a client to see their history." />

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-hub-muted">
          <UserCheck className="h-4 w-4 text-hub-primary" />
          Client requests
          {requests.length > 0 ? <Badge variant="warning">{requests.length}</Badge> : null}
        </h2>
        {loadingAppointments ? (
          <Loading label="Loading requests…" />
        ) : requests.length === 0 ? (
          <EmptyState title="No pending requests" description="New session requests from clients will appear here for you to accept or decline." />
        ) : (
          <div className="space-y-3">
            {requests.map((a) => <RequestRow key={a._id} appointment={a} clientName={nameFor(String(a.user))} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-hub-muted">Active clients</h2>
        {isLoading ? (
          <Loading label="Loading clients…" />
        ) : clients.length === 0 ? (
          <EmptyState title="No clients yet" description="Once users book with you, their profiles will appear here." action={<Link to="/professional/profile"><Button variant="outline">Make sure your profile is visible</Button></Link>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => <ClientCard key={c.id} client={c} />)}
          </div>
        )}
      </section>
    </div>
  )
}
