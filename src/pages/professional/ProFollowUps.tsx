import { useQueries } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { CheckSquare, ClipboardList } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate } from '../../lib/format'
import { get, ApiError } from '../../lib/api'
import { useProfessionalClients } from '../../services/professional'
import { useCompleteFollowUp } from '../../services/followups'
import type { FollowUp } from '../../types'

type ClientDetail = { client: { id: string; displayName: string }; followUps: FollowUp[] }

export default function ProFollowUps() {
  const clients = useProfessionalClients()
  const complete = useCompleteFollowUp()

  const details = useQueries({
    queries: (clients.data?.data.clients ?? []).map((c) => ({
      queryKey: ['professional', 'client', c.id] as const,
      queryFn: () => get<ClientDetail>(`/professional/clients/${c.id}`),
      enabled: Boolean(c.id),
    })),
  })

  const rows = (clients.data?.data.clients ?? [])
    .map((c, i) => ({
      clientName: c.displayName,
      clientId: c.id,
      followUps: details[i]?.data?.data.followUps ?? [],
    }))
    .filter((r) => r.followUps.length > 0)

  const allPending = rows.reduce((n, r) => n + r.followUps.filter((f) => f.status !== 'completed').length, 0)

  async function doComplete(id: string) {
    try {
      await complete.mutateAsync({ id })
      toast.success('Follow-up completed.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not complete this follow-up.')
    }
  }

  return (
    <div>
      <PageHeader title="Follow-ups" description={`${allPending} follow-up${allPending === 1 ? '' : 's'} still to check in with.`} />

      {clients.isLoading || details.some((d) => d.isLoading) ? (
        <Loading label="Loading follow-ups…" />
      ) : rows.length === 0 ? (
        <EmptyState title="No follow-ups yet" description="Link a follow-up plan under a client to support long-term progress between sessions." />
      ) : (
        <div className="space-y-5">
          {rows.map((r) => (
            <div key={r.clientId}>
              <div className="mb-2 flex items-center justify-between">
                <p className="inline-flex items-center gap-2 font-semibold text-hub-text">
                  <ClipboardList className="h-4 w-4 text-hub-primary" />
                  {r.clientName}
                </p>
                <Link to={`/professional/clients/${r.clientId}`} className="text-xs text-hub-primary hover:underline">Open client →</Link>
              </div>
              <div className="space-y-2">
                {r.followUps.map((f) => (
                  <Card key={f.id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-hub-text">{f.kind}</p>
                          <Badge variant={f.status === 'completed' ? 'secondary' : 'warning'}>{f.status}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-hub-muted">
                          Due {f.dueAt ? formatDate(f.dueAt) : 'soon'}{f.notes ? ` · ${f.notes}` : ''}
                        </p>
                      </div>
                      {f.status !== 'completed' && (
                        <Button size="sm" variant="outline" className="inline-flex items-center gap-1.5" onClick={() => void doComplete(f.id)}>
                          <CheckSquare className="h-4 w-4" /> Mark completed
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}