import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatRelative } from '../../lib/format'
import { useAuditLogs } from '../../services/admin'

const ACTION_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
  'professional.submit': 'info',
  'admin.verification.approved': 'success',
  'admin.verification.rejected': 'danger',
  'admin.verification.suspended': 'danger',
  'admin.verification.under-review': 'warning',
  'admin.user.set-active': 'warning',
  'admin.safeguarding.escalated': 'danger',
  'admin.safeguarding.resolved': 'success',
  'admin.resource.create': 'info',
  'admin.resource.update': 'info',
  'admin.resource.delete': 'danger',
  'admin.community.moderate': 'warning',
}

export default function AdminAuditLogs() {
  const { data, isLoading } = useAuditLogs()

  const logs = data?.data.logs ?? []

  return (
    <div>
      <PageHeader title="Audit logs" description="A tamper-evident trail of sensitive admin actions." />

      {isLoading ? (
        <Loading label="Loading audit trail…" />
      ) : logs.length === 0 ? (
        <EmptyState title="No audit events yet" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Resource</th>
                    <th className="px-4 py-3 font-medium">Actor</th>
                    <th className="px-4 py-3 font-medium text-right">Resource ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 text-hub-muted">{l.createdAt ? formatRelative(String(l.createdAt)) : '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={ACTION_VARIANTS[String(l.action)] ?? 'secondary'}>{String(l.action)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-hub-text">{String(l.resource)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-hub-muted">{String(l.actor)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-slate-400">{String(l.resourceId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}