import { Link } from 'react-router-dom'
import { MessageSquareText, MailOpen } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate, initials } from '../../lib/format'
import { useProfessionalClients } from '../../services/professional'
import type { ClientSummary } from '../../types'

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

export default function ProClients() {
  const { data, isLoading } = useProfessionalClients()

  return (
    <div>
      <PageHeader title="Your clients" description="People who have booked sessions with you. Open a client to see their history." />

      {isLoading ? (
        <Loading label="Loading clients…" />
      ) : (data?.data.clients ?? []).length === 0 ? (
        <EmptyState title="No clients yet" description="Once users book with you, their profiles will appear here." action={<Link to="/professional/profile"><Button variant="outline">Make sure your profile is visible</Button></Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.data.clients ?? []).map((c) => <ClientCard key={c.id} client={c} />)}
        </div>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-hub-muted">
        <MailOpen className="h-4 w-4 text-hub-primary" />
        Sensitive data here is visible only to you and your supervising professional.
      </p>
    </div>
  )
}