import { Link } from 'react-router-dom'
import { BookOpen, MessageSquareWarning, ShieldCheck, UsersRound } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { EmptyState, Loading, PageHeader, StatCard } from '../../components/PageHeader'
import { useAdminDashboard } from '../../services/admin'

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard()

  if (isLoading) return <Loading label="Loading platform overview…" />
  if (!data?.data) return <EmptyState title="Could not load dashboard" />

  const { stats, series, charts } = data.data

  return (
    <div>
      <PageHeader title="Platform overview" description="Monthly health of the Nsangiza Hub community." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} hint={`${stats.activeUsers} active this month`} icon={<UsersRound className="h-4 w-4 text-hub-primary" />} />
        <StatCard label="Verified pros" value={stats.verifiedProfessionals} hint={`${stats.pendingProfessionals} pending review`} icon={<ShieldCheck className="h-4 w-4 text-hub-success" />} />
        <StatCard label="Appointments" value={stats.appointmentsTotal} hint={`${stats.sessionsCompleted} completed`} icon={<ShieldCheck className="h-4 w-4 text-hub-secondary" />} />
        <StatCard label="Open cases" value={stats.safeguardingOpen} hint="requiring attention" icon={<MessageSquareWarning className="h-4 w-4 text-hub-danger" />} />
        <StatCard label="Resources" value={stats.resourcesPublished} hint="published articles" icon={<BookOpen className="h-4 w-4 text-hub-info" />} />
        <StatCard label="Groups" value={stats.communityGroups} hint="active spaces" icon={<UsersRound className="h-4 w-4 text-hub-primary" />} />
        <StatCard label="Reports" value={stats.reportedPosts} hint="unresolved posts" icon={<MessageSquareWarning className="h-4 w-4 text-hub-warning" />} />
        <StatCard label="Completion" value={`${charts.appointmentCompletion.length ? charts.appointmentCompletion[0].value : 0}%`} hint="top appointment outcome" icon={<ShieldCheck className="h-4 w-4 text-hub-success" />} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-hub-muted">User growth</h2>
            {(series.userGrowth ?? []).length === 0 ? <p className="mt-4 text-sm text-hub-muted">No data yet.</p> : (
              <div className="mt-4 flex h-32 items-end gap-2">
                {(series.userGrowth ?? []).map((g) => (
                  <div key={g.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg bg-hub-primary" style={{ height: `${Math.max(8, Math.min(100, g.count * 6))}%` }} />
                    <span className="text-[9px] text-slate-400">{g.month.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-hub-muted">Support demand</h2>
            {(charts.supportCategories ?? []).length === 0 ? <p className="mt-4 text-sm text-hub-muted">No data yet.</p> : (
              <ul className="mt-4 space-y-2">
                {(charts.supportCategories ?? []).map((c) => (
                  <li key={c.label} className="flex items-center justify-between text-sm">
                    <span className="text-hub-text">{c.label}</span>
                    <span className="text-hub-muted">{c.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-hub-muted">Provider activity</h2>
            {(charts.providerActivity ?? []).length === 0 ? <p className="mt-4 text-sm text-hub-muted">No data yet.</p> : (
              <ul className="mt-4 space-y-2">
                {(charts.providerActivity ?? []).map((c) => (
                  <li key={c.label} className="flex items-center justify-between text-sm">
                    <span className="text-hub-text">{c.label}</span>
                    <span className="text-hub-muted">{c.value} sessions</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-hub-muted">Appointment outcomes</h2>
            {(charts.appointmentCompletion ?? []).length === 0 ? <p className="mt-4 text-sm text-hub-muted">No data yet.</p> : (
              <ul className="mt-4 space-y-2">
                {(charts.appointmentCompletion ?? []).map((c) => (
                  <li key={c.label} className="flex items-center justify-between text-sm">
                    <span className="text-hub-text">{c.label}</span>
                    <span className="text-hub-muted">{c.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/admin/professionals"><Button variant="outline" size="sm">Review pending applications</Button></Link>
        <Link to="/admin/safeguarding"><Button variant="outline" size="sm">Open safeguarding cases</Button></Link>
        <Link to="/admin/community"><Button variant="outline" size="sm">Community reports</Button></Link>
      </div>
    </div>
  )
}