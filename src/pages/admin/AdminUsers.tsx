import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Card, CardContent } from '../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useAdminUsers, useAdminUserStatus } from '../../services/admin'

const ROLE_VARIANTS: Record<string, 'default' | 'secondary' | 'info' | 'warning' | 'danger'> = {
  USER: 'default',
  PROFESSIONAL: 'secondary',
  MODERATOR: 'info',
  SUPERVISOR: 'warning',
  ADMIN: 'warning',
  SUPER_ADMIN: 'danger',
}

export default function AdminUsers() {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [role, setRole] = useState('')
  const { data, isLoading } = useAdminUsers({ q: debounced || undefined, role: role || undefined, pageSize: 50 })
  const statusMutation = useAdminUserStatus()

  const users = useMemo(() => data?.data.users ?? [], [data])

  function search(value: string) {
    setQ(value)
    window.setTimeout(() => setDebounced(value), 350)
  }

  async function toggle(id: string, active: boolean) {
    try {
      await statusMutation.mutateAsync({ id, active })
      toast.success(active ? 'User enabled.' : 'User disabled.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update user.')
    }
  }

  return (
    <div>
      <PageHeader title="Users" description="Manage access to the platform." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => search(e.target.value)} placeholder="Search by name or email…" className="w-64 pl-9" />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All roles</SelectItem>
            {['USER', 'PROFESSIONAL', 'MODERATOR', 'SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Loading label="Loading users…" />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 font-medium text-hub-text">{u.displayName}</td>
                      <td className="px-4 py-3 text-hub-muted">{u.email}</td>
                      <td className="px-4 py-3"><Badge variant={ROLE_VARIANTS[u.role] ?? 'default'}>{u.role}</Badge></td>
                      <td className="px-4 py-3 text-hub-muted">{u.city || '—'}</td>
                      <td className="px-4 py-3 text-hub-muted">{u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant={u.active ? 'ghost' : 'outline'} onClick={() => void toggle(u.id, !u.active)}>
                          {u.active ? 'Disable' : 'Enable'}
                        </Button>
                      </td>
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