import { Link } from 'react-router-dom'
import { CalendarCheck, CheckCircle2, Clock, MessageSquareText, TrendingUp, UsersRound } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { EmptyState, Loading, PageHeader, StatCard } from '../../components/PageHeader'
import { Progress } from '../../components/ui/progress'
import { formatDate, formatTime } from '../../lib/format'
import { useProfessionalDashboard } from '../../services/professional'
import { useUpcomingAppointments } from '../../services/appointments'

export default function ProDashboard() {
  const { data, isLoading } = useProfessionalDashboard()
  const upcoming = useUpcomingAppointments()

  if (isLoading) return <Loading label="Loading your dashboard…" />

  const stats = data?.data.stats

  return (
    <div>
      <PageHeader
        title="Professional dashboard"
        description="A clear view of your sessions, clients and wellbeing."
        actions={
          stats && stats.profileCompleteness < 100 ? (
            <Link to="/professional/profile"><Button size="sm" variant="outline">Complete profile ({stats.profileCompleteness}%)</Button></Link>
          ) : undefined
        }
      />

      {stats ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Today" value={stats.todayAppointments} hint="sessions today" icon={<CalendarCheck className="h-4 w-4 text-hub-primary" />} />
          <StatCard label="Pending requests" value={stats.pendingRequests} hint="awaiting your confirmation" icon={<Clock className="h-4 w-4 text-hub-warning" />} />
          <StatCard label="Unread messages" value={stats.unreadMessages} hint="across conversations" icon={<MessageSquareText className="h-4 w-4 text-hub-info" />} />
          <StatCard label="This week" value={stats.sessionsThisWeek} hint="completed sessions" icon={<TrendingUp className="h-4 w-4 text-hub-success" />} />
          <StatCard label="Clients" value={stats.upcomingCount} hint="upcoming appointments" icon={<UsersRound className="h-4 w-4 text-hub-secondary" />} />
          <StatCard label="Response rate" value={`${stats.responseRate}%`} hint="booking responses" icon={<CheckCircle2 className="h-4 w-4 text-hub-primary" />} />
          <StatCard label="Follow-ups" value={stats.pendingFollowUps} hint="check with clients" icon={<Clock className="h-4 w-4 text-hub-warning" />} />
          <StatCard label="Completed" value={stats.completedSessions} hint="all-time sessions" icon={<CheckCircle2 className="h-4 w-4 text-hub-secondary" />} />
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-hub-muted">Upcoming sessions</h2>
          {(upcoming.data?.data.appointments ?? []).length === 0 ? (
            <EmptyState title="No upcoming sessions" description="New appointment requests will appear here for you to confirm." />
          ) : (
            <div className="space-y-3">
              {(upcoming.data?.data.appointments ?? []).map((a) => (
                <Card key={a._id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-hub-text">{a.type}</p>
                        <Badge variant={a.status === 'confirmed' ? 'success' : 'warning'}>{a.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-hub-muted">
                        {formatDate(a.date)} at {formatTime(a.date)} · {a.durationMin} min{a.notes ? ` · ${a.notes}` : ''}
                      </p>
                    </div>
                    <Link to="/professional/sessions"><Button size="sm" variant="ghost">Manage</Button></Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-hub-muted">Profile completeness</h2>
          {stats ? (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-hub-text">{stats.profileCompleteness}%</p>
                  <span className="text-xs text-hub-muted">{stats.profileCompleteness === 100 ? 'Ready to be discovered' : 'Almost there'}</span>
                </div>
                <Progress value={stats.profileCompleteness} className="mt-3" />
                <p className="mt-3 text-xs text-hub-muted">
                  {stats.profileCompleteness < 100
                    ? 'Fill in your name, about, provider type and qualifications to be matched with users.'
                    : 'Your profile is complete and discoverable in search.'}
                </p>
                <Link to="/professional/profile" className="mt-4 block">
                  <Button variant="outline" size="sm" className="w-full">{stats.profileCompleteness < 100 ? 'Finish my profile' : 'View my profile'}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}