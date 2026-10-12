import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle2, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatRelative } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useCommunityReports, useModeratePost, useResolveReport } from '../../services/admin'

export default function AdminCommunity() {
  const { data, isLoading } = useCommunityReports()
  const moderate = useModeratePost()
  const resolve = useResolveReport()
  const [hideFor, setHideFor] = useState<Record<string, boolean>>({})

  const reports = data?.data.reports ?? []

  async function hide(id: string) {
    const hidden = !hideFor[id]
    try {
      await moderate.mutateAsync({ id, hidden })
      setHideFor((s) => ({ ...s, [id]: hidden }))
      toast.success(hidden ? 'Post hidden from the community.' : 'Post restored.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not moderate post.')
    }
  }

  async function dismiss(id: string) {
    try {
      await resolve.mutateAsync(id)
      toast.success('Report dismissed.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not dismiss report.')
    }
  }

  return (
    <div>
      <PageHeader title="Community reports" description="Posts flagged by members or our safety systems." />

      {isLoading ? (
        <Loading label="Loading reports…" />
      ) : reports.length === 0 ? (
        <EmptyState title="No open reports" description="Great — nothing needs moderation right now." />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-hub-warning" />
                    <p className="text-sm font-semibold text-hub-text">{r.authorName}</p>
                    <Badge variant="secondary">{r.groupName}</Badge>
                    <span className="text-xs text-slate-400">{formatRelative(r.createdAt)}</span>
                  </div>
                  <Badge variant="danger">Reported</Badge>
                </div>
                <p className="mt-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-hub-text">"{r.body}"</p>
                <p className="mt-2 text-xs text-hub-muted">Reason: {r.reason}</p>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <Button size="sm" variant="outline" className="text-hub-danger" onClick={() => void dismiss(r.id)} disabled={resolve.isPending}>
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Dismiss report
                  </Button>
                  <Button size="sm" variant={hideFor[r.id] ? 'outline' : 'ghost'} className="text-hub-danger" onClick={() => void hide(r.id)}>
                    {hideFor[r.id] ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
                    {hideFor[r.id] ? 'Hidden — restore' : 'Hide post'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}