import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Eye, FileText } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate, formatPrice } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { openSecureDocument } from '../../lib/documents'
import { useAdminProfessional, useAdminProfessionals, useProfessionalVerification } from '../../services/admin'

const VERIFY_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  Approved: 'success',
  Submitted: 'warning',
  'Under Review': 'warning',
  Rejected: 'danger',
  Suspended: 'danger',
  Draft: 'secondary',
}

type VerifyStatus = 'Approved' | 'Rejected' | 'Under Review' | 'Suspended'

function Row({ label, value }: { label: string; value: ReactNode }) {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return null
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-hub-muted">{label}</dt>
      <dd className="text-hub-text">{value}</dd>
    </div>
  )
}

function DetailsDialog({ id, onClose, onVerify }: { id: string | null; onClose: () => void; onVerify: (id: string, next: VerifyStatus) => void }) {
  const { data, isLoading } = useAdminProfessional(id ?? undefined)
  const professional = data?.data.professional
  const account = data?.data.account

  return (
    <Dialog open={Boolean(id)} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{professional?.name ?? 'Professional application'}</DialogTitle>
          <DialogDescription>
            {account?.email ? `Account: ${account.email}` : 'Review the applicant’s full details before verifying.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !professional ? (
          <Loading label="Loading application details…" />
        ) : (
          <dl className="text-sm">
            <Row label="Status" value={<Badge variant={VERIFY_VARIANTS[professional.verification.status] ?? 'secondary'}>{professional.verification.status}</Badge>} />
            <Row label="Provider type" value={professional.providerType} />
            <Row label="Title" value={professional.title} />
            <Row label="City" value={professional.city} />
            <Row label="Location" value={professional.location} />
            <Row label="Languages" value={(professional.languages ?? []).join(', ')} />
            <Row label="Experience" value={professional.experienceYears ? `${professional.experienceYears} years${professional.experience ? ` · ${professional.experience}` : ''}` : professional.experience} />
            <Row label="Specializations" value={(professional.specializations ?? []).join(', ')} />
            <Row label="Support areas" value={(professional.supportAreas ?? []).join(', ')} />
            <Row label="Session types" value={(professional.sessionTypes ?? []).join(', ')} />
            <Row label="Price" value={professional.pricePerSession ? formatPrice(professional.pricePerSession, professional.currency) : undefined} />
            <Row label="About" value={professional.about} />
            <Row
              label="Qualifications"
              value={
                (professional.qualifications ?? []).length > 0 ? (
                  <ul className="list-disc space-y-1 pl-4">
                    {professional.qualifications.map((q, i) => (
                      <li key={`${q.title}-${i}`}>
                        {q.title}{q.institution ? `, ${q.institution}` : ''}{q.year ? ` (${q.year})` : ''}
                      </li>
                    ))}
                  </ul>
                ) : undefined
              }
            />
            <Row
              label="Documents"
              value={
                (professional.verification.documents ?? []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {professional.verification.documents!.map((d, i) => (
                      <button key={`${d}-${i}`} type="button" onClick={() => void openSecureDocument(d)} className="inline-flex items-center gap-1 text-xs font-medium text-hub-primary hover:underline">
                        <FileText className="h-3.5 w-3.5" />
                        {i === 0 ? 'Certificate / licence' : `document ${i + 1}`} ↗
                      </button>
                    ))}
                  </div>
                ) : undefined
              }
            />
            <Row label="Review note" value={professional.verification.reviewNote} />
          </dl>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => id && onVerify(id, 'Under Review')} disabled={!id}>Under review</Button>
          <Button variant="ghost" className="text-hub-danger" onClick={() => id && onVerify(id, 'Rejected')} disabled={!id}>Reject</Button>
          <Button onClick={() => id && onVerify(id, 'Approved')} disabled={!id}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminProfessionals() {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [viewId, setViewId] = useState<string | null>(null)
  const { data, isLoading } = useAdminProfessionals({ status: status || undefined, q: q || undefined, pageSize: 50 })
  const verify = useProfessionalVerification()

  const rows = data?.data.professionals ?? []

  async function setVerification(id: string, next: VerifyStatus) {
    try {
      await verify.mutateAsync({ id, body: { status: next, reviewNote: `Reviewed by admin as ${next.toLowerCase()}.` } })
      toast.success(`Application ${next.toLowerCase()}.`)
      setViewId(null)
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
                  {p.verification.reviewNote ? <p className="mt-2 text-xs text-slate-400">Note: {p.verification.reviewNote}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="inline-flex items-center gap-1.5" onClick={() => setViewId(p.id)}>
                    <Eye className="h-4 w-4" /> View details
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void setVerification(p.id, 'Under Review')}>Under review</Button>
                  <Button size="sm" onClick={() => void setVerification(p.id, 'Approved')}>Approve</Button>
                  <Button size="sm" variant="ghost" className="text-hub-danger" onClick={() => void setVerification(p.id, 'Suspended')}>Suspend</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DetailsDialog id={viewId} onClose={() => setViewId(null)} onVerify={(id, next) => void setVerification(id, next)} />
    </div>
  )
}
