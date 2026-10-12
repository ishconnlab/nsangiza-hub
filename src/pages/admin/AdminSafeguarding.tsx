import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate, formatRelative } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useSafeguardingCases, useSafeguardingUpdate } from '../../services/admin'

const RISK_VARIANTS: Record<string, 'danger' | 'warning' | 'secondary' | 'info'> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'secondary',
}

const STATUS_OPTIONS = ['New', 'Under Review', 'Escalated', 'Resolved']

export default function AdminSafeguarding() {
  const { data, isLoading } = useSafeguardingCases()
  const update = useSafeguardingUpdate()

  const [changeTo, setChangeTo] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})

  const cases = data?.data.cases ?? []

  async function save(id: string) {
    const next = changeTo[id]
    if (!next) return
    try {
      await update.mutateAsync({ id, body: { status: next, note: notes[id] || undefined } })
      toast.success('Case updated.')
      setChangeTo((s) => { const r = { ...s }; delete r[id]; return r })
      setNotes((s) => { const r = { ...s }; delete r[id]; return r })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update case.')
    }
  }

  return (
    <div>
      <PageHeader title="Safeguarding cases" description="Risk-flagged profiles requiring careful review. Access is restricted." />

      {isLoading ? (
        <Loading label="Loading cases…" />
      ) : cases.length === 0 ? (
        <EmptyState title="No open cases" description="Great — nothing needs attention right now." />
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={RISK_VARIANTS[c.riskLevel] ?? 'secondary'}>{c.riskLevel.toUpperCase()} RISK</Badge>
                    <p className="font-mono text-sm text-hub-text">{c.caseId}</p>
                    <Badge variant={c.status === 'Resolved' ? 'secondary' : 'warning'}>{c.status}</Badge>
                  </div>
                  <span className="text-xs text-slate-400">created {c.createdAt ? formatRelative(c.createdAt) : ''}</span>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                  <div>
                    <Label className="text-xs text-hub-muted">Assigned reviewer</Label>
                    <Input value={c.assignedReviewer} readOnly className="mt-1 h-9 w-52 bg-slate-50" />
                  </div>
                  <div>
                    <Label className="text-xs text-hub-muted">Move to</Label>
                    <Select value={changeTo[c.id] ?? ''} onValueChange={(v) => setChangeTo((s) => ({ ...s, [c.id]: v }))}>
                      <SelectTrigger className="mt-1 h-9 w-40"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-hub-muted">Case note</Label>
                    <Input value={notes[c.id] ?? ''} onChange={(e) => setNotes((s) => ({ ...s, [c.id]: e.target.value }))} placeholder="What was agreed…" className="mt-1 h-9" />
                  </div>
                  <Button size="sm" onClick={() => void save(c.id)} disabled={!changeTo[c.id]}>Update</Button>
                </div>

                <p className="text-xs text-slate-400">
                  Cases marked <span className="font-medium">Escalated</span> are routed to the safeguarding supervisor. See the{' '}
                  <Link to="/help/safeguarding" className="underline">safeguarding policy</Link> for handling guidance. Last reviewed {c.createdAt ? formatDate(c.createdAt) : ''}.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}