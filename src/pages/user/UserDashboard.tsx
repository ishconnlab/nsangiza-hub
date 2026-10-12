import { Link } from 'react-router-dom'
import { CalendarDays, FileText, MessageCircle, Plus, Smile, UsersRound } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { StatCard, Loading } from '../../components/PageHeader'
import { formatDate, formatTime, formatRelative } from '../../lib/format'
import { getCurrentLocale } from '../../i18n/locale'
import { useAuth } from '../../hooks/auth-context'
import { useI18n } from '../../i18n/LanguageProvider'
import { useUpcomingAppointments } from '../../services/appointments'
import { useFollowUps } from '../../services/followups'
import { useWellbeingTrend } from '../../services/users'
import { useMatching } from '../../services/professionals'
import { useCommunityGroups } from '../../services/community'

export default function UserDashboard() {
  const { user } = useAuth()
  const { t, tl } = useI18n()
  const upcoming = useUpcomingAppointments()
  const followUps = useFollowUps()
  const trend = useWellbeingTrend()
  const matching = useMatching({ limit: 3 })
  const groups = useCommunityGroups()

  const nextAppointment = upcoming.data?.data.appointments[0]
  const checkInsTotal = trend.data?.data.totalCheckIns ?? 0
  const latestMood = trend.data?.data.trend.slice(-1)[0]?.mood

  const quickLinks = [
    { label: t('app.quick.checkin'), desc: t('app.quick.checkinDesc'), to: '/app/check-in', icon: Smile },
    { label: t('app.quick.book'), desc: t('app.quick.bookDesc'), to: '/app/appointments', icon: CalendarDays },
    { label: t('app.quick.messages'), desc: t('app.quick.messagesDesc'), to: '/app/messages', icon: MessageCircle },
    { label: t('app.quick.community'), desc: t('app.quick.communityDesc'), to: '/app/community', icon: UsersRound },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-hub-text">{t('app.greeting', { name: user?.displayName ?? '' })}</h1>
        <p className="mt-1 text-sm text-hub-muted">
          {t('app.today', { date: new Date().toLocaleDateString(getCurrentLocale(), { weekday: 'long', day: 'numeric', month: 'long' }) })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t('app.stat.checkins')} value={checkInsTotal} hint={t('app.stat.checkinsHint')} icon={<Smile className="h-4 w-4 text-hub-primary" />} />
        <StatCard label={t('app.stat.mood')} value={latestMood ? tl(`mood.${latestMood}`) : '—'} hint={t('app.stat.moodHint')} icon={<Smile className="h-4 w-4 text-hub-secondary" />} />
        <StatCard label={t('app.stat.upcoming')} value={upcoming.data?.data.appointments.length ?? 0} hint={t('app.stat.upcomingHint')} icon={<CalendarDays className="h-4 w-4 text-hub-primary" />} />
        <StatCard label={t('app.stat.followups')} value={followUps.data?.data.followUps.filter((f) => f.status !== 'completed').length ?? 0} hint={t('app.stat.followupsHint')} icon={<MessageCircle className="h-4 w-4 text-hub-warning" />} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((q) => (
          <Link key={q.to} to={q.to} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lg">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hub-primary-light">
              <q.icon className="h-5 w-5 text-hub-primary" />
            </span>
            <p className="mt-3 font-semibold text-hub-text group-hover:text-hub-primary">{q.label}</p>
            <p className="mt-0.5 text-xs text-hub-muted">{q.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {nextAppointment ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-hub-primary" />
                  {t('app.next.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-hub-text">{nextAppointment.professionalName}</p>
                    <p className="text-sm text-hub-muted">
                      {nextAppointment.type} · {formatDate(nextAppointment.date)} at {formatTime(nextAppointment.date)}
                      {nextAppointment.durationMin ? ` · ${t('common.minutes', { count: nextAppointment.durationMin })}` : ''}
                    </p>
                    <div className="mt-2"><Badge variant={nextAppointment.status === 'confirmed' ? 'success' : 'warning'}>{tl(`status.${nextAppointment.status}`)}</Badge></div>
                  </div>
                  <Link to="/app/appointments">
                    <Button variant="outline" size="sm">{t('common.viewDetails')}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('app.next.none')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-hub-muted">{t('app.next.noneBody')}</p>
                <Link to="/professionals" className="mt-3 inline-flex">
                  <Button size="sm">{t('app.next.find')}</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{t('app.matched.title')}</CardTitle>
              <Link to="/professionals" className="text-sm font-medium text-hub-primary hover:underline">{t('common.browseAll')}</Link>
            </CardHeader>
            <CardContent>
              {matching.isLoading ? <Loading label={t('app.matched.finding')} /> : (
                <div className="space-y-3">
                  {(matching.data?.data.recommendations ?? []).map((rec) => (
                    <Link key={rec.id} to={`/professionals/${rec.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 transition-colors hover:border-hub-primary/40">
                      <div>
                        <p className="text-sm font-semibold text-hub-text">{rec.name}</p>
                        <p className="text-xs text-hub-muted">{rec.providerType}</p>
                      </div>
                      <div className="text-right">
                        <Badge>{rec.matchReason}</Badge>
                        <p className="mt-1 text-xs text-hub-muted">{t('common.fit', { score: rec.matchScore })}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{t('app.followups.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {followUps.data?.data.followUps.length ? (
                <ul className="space-y-3">
                  {followUps.data.data.followUps.slice(0, 4).map((f) => (
                    <li key={f.id} className="rounded-xl border border-slate-100 px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-hub-text">{f.professionalName}</p>
                        <Badge variant={f.status === 'completed' ? 'success' : f.status === 'overdue' ? 'danger' : 'warning'}>{tl(`status.${f.status}`)}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-hub-muted">{t('app.due', { date: formatRelative(f.dueAt) })}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-hub-muted">{t('app.followups.empty')}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{t('app.community.title')}</CardTitle>
              <Link to="/app/community" className="text-sm font-medium text-hub-primary hover:underline">{t('app.community.open')}</Link>
            </CardHeader>
            <CardContent>
              {(groups.data?.data.groups ?? []).slice(0, 3).map((g) => (
                <Link key={g.id} to={`/app/community/${g.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 text-sm hover:border-hub-primary/40">
                  <span className="font-medium text-hub-text">{g.name}</span>
                  <span className="text-xs text-hub-muted">{t('common.members', { count: g.memberCount })}</span>
                </Link>
              ))}
              <Link to="/app/resources" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-hub-primary hover:underline">
                <FileText className="h-4 w-4" />
                {t('app.resources.link')}
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-hub-text">{t('app.today.question')}</p>
              <Link to="/app/check-in" className="mt-3 inline-flex">
                <Button size="sm" className="inline-flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t('app.today.quickCheckin')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}