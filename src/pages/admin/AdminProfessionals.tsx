import { useState } from 'react'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { openSecureDocument } from '../../lib/documents'
import { useAdminProfessionals, useProfessionalVerification } from '../../services/admin'
import type { AdminProfessionalRow } from '../../types'

const VERIFY_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  Approved: 'success',
  Submitted: 'warning',
  'Under Review': 'warning',
  Rejected: 'danger',
  Suspended: 'danger',
  Draft: 'secondary',
}

export default function AdminProfessionals() {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const { data, isLoading } = useAdminProfessionals({ status: status || undefined, q: q || undefined, pageSize: 50 })
  const verify = useProfessionalVerification()

  const rows = data?.data.professionals ?? []

  async function setVerification(p: AdminProfessionalRow, next: 'Approved' | 'Rejected' | 'Under Review' | 'Suspended') {
    try {
      await verify.mutateAsync({ id: p.id, body: { status: next, reviewNote: `Reviewed by admin as ${next.toLowerCase()}.` } })
      toast.success(`Application ${next.toLowerCase()}.`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update verification.')
    }
  }

  return (
    <div>
      <PageHeader title="Professionals" description="Review applications, verify and manage professional access." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or type…" className="w-64" />
        <Select value={status} onValueChange={(v) => setStatus(v === '__all' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All statuses</SelectItem>
            {['Approved', 'Submitted', 'Under Review', 'Rejected', 'Suspended', 'Draft'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Loading label="Loading professionals…" />
      ) : rows.length === 0 ? (
        <EmptyState title="No professionals found" />
      ) : (
        <div className="space-y-3">
          {rows.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-hub-text">{p.name}</p>
                    <Badge variant={VERIFY_VARIANTS[p.verification.status] ?? 'secondary'}>{p.verification.status}</Badge>
                    {p.isDemo ? <Badge variant="secondary">demo</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-hub-muted">
                    {p.providerType} · {p.city || '—'} · {p.verification.status === 'Approved' ? `reviewed ${formatDate(p.verification.reviewedAt ?? p.createdAt)}` : `joined ${formatDate(p.createdAt)}`}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(p.specializations ?? []).slice(0, 4).map((s) => <Badge key={s} variant="secondary" className="bg-slate-100">{s}</Badge>)}
                  </div>
                  {(p.documents ?? []).length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-hub-muted">Uploaded:</span>
                      {p.documents!.map((d, i) => (
                        <button key={`${d}-${i}`} type="button" onClick={() => void openSecureDocument(d)} className="inline-flex items-center gap-1 text-xs font-medium text-hub-primary hover:underline">
                          <FileText className="h-3.5 w-3.5" />
                          {i === 0 ? 'Certificate / licence' : `document ${i + 1}`} ↗
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {p.verification.reviewNote ? <p className="mt-2 text-xs text-slate-400">Note: {p.verification.reviewNote}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => void setVerification(p, 'Under Review')}>Under review</Button>
                  <Button size="sm" onClick={() => void setVerification(p, 'Approved')}>Approve</Button>
                  <Button size="sm" variant="ghost" className="text-hub-danger" onClick={() => void setVerification(p, 'Suspended')}>Suspend</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}