import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, CalendarDays, CheckSquare, ClipboardList, MessageCircle } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { EmptyState, Loading } from '../../components/PageHeader'
import { formatDate, formatTime, initials } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useProfessionalClient } from '../../services/professional'
import { useCompleteFollowUp } from '../../services/followups'

export default function ProClientDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useProfessionalClient(id ?? '')
  const complete = useCompleteFollowUp()

  const [notes, setNotes] = useState('')
  const [marking, setMarking] = useState<string | null>(null)

  if (isLoading) return <Loading label="Loading client…" />

  const client = data?.data.client
  if (isError || !client) return <EmptyState title="Client not found" action={<Link to="/professional/clients"><Button variant="outline">Back to clients</Button></Link>} />

  const appointments = data?.data.appointments ?? []
  const followUps = data?.data.followUps ?? []
  const conversationId = data?.data.conversationId

  async function completeFollowUp(id: string) {
    if (!notes.trim() && marking !== id) return
    setMarking(id)
    try {
      await complete.mutateAsync({ id, notes: notes.trim() || undefined })
      setNotes('')
      toast.success('Follow-up completed.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not complete this follow-up.')
    } finally {
      setMarking(null)
    }
  }

  return (
    <div>
      <Link to="/professional/clients" className="inline-flex items-center gap-1.5 text-sm text-hub-muted hover:text-hub-primary">
        <ArrowLeft className="h-4 w-4" /> All clients
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-hub-primary-light text-lg font-bold text-hub-primary">
            {initials(client.displayName)}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-hub-text">{client.displayName}</h1>
            <p className="text-sm text-hub-muted">{client.city || 'Location not set'} · {client.language}{client.communicationPreference ? ` · prefers ${client.communicationPreference}` : ''}</p>
          </div>
        </div>
        {conversationId ? (
          <Link to={`/professional/messages/${conversationId}`}>
            <Button className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> Send a message</Button>
          </Link>
        ) : (
          <Button variant="outline" disabled className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> Messaging not started yet</Button>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-hub-muted">Sessions</h2>
          {appointments.length === 0 ? (
            <EmptyState title="No sessions yet" />
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <Card key={a._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="inline-flex items-center gap-2 font-medium text-hub-text">
                        <CalendarDays className="h-4 w-4 text-hub-primary" />
                        {formatDate(a.date)} at {formatTime(a.date)}
                      </p>
                      <Badge variant={a.status === 'completed' ? 'secondary' : a.status === 'confirmed' ? 'success' : a.status === 'requested' ? 'warning' : 'danger'}>{a.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-hub-muted">{a.type} · {a.durationMin} min</p>
                    {a.notes ? <p className="mt-2 text-xs text-slate-400">{a.notes}</p> : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-hub-muted">Follow-ups</h2>
          {followUps.length === 0 ? (
            <EmptyState title="No follow-ups" description="Follow-up plans you create will appear here to help you check in between sessions." />
          ) : (
            <div className="space-y-3">
              {followUps.map((f) => (
                <Card key={f.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="inline-flex items-center gap-2 font-medium text-hub-text">
                        <ClipboardList className="h-4 w-4 text-hub-primary" />
                        {f.kind} · due {f.dueAt ? formatDate(f.dueAt) : 'soon'}
                      </p>
                      <Badge variant={f.status === 'completed' ? 'secondary' : 'warning'}>{f.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-hub-muted">{f.notes || 'Plan details to add.'}</p>
                    {f.status !== 'completed' && (
                      <div className="mt-3 flex items-end gap-2">
                        <div className="flex-1">
                          <Label htmlFor="fu-notes" className="sr-only">Completion note</Label>
                          <Input id="fu-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Note how it went (optional)" />
                        </div>
                        <Button size="sm" className="inline-flex items-center gap-1.5" onClick={() => void completeFollowUp(f.id)} disabled={marking === f.id}>
                          <CheckSquare className="h-4 w-4" /> Complete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}