import { Link } from 'react-router-dom'
import { ShieldCheck, UsersRound } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { coverPhoto } from '../../lib/images'
import { useCommunityGroups } from '../../services/community'

export default function Community() {
  const { data, isLoading, isError } = useCommunityGroups()

  return (
    <div>
      <PageHeader
        title="Community spaces"
        description="Kind, moderated spaces to connect with people navigating similar experiences."
      />

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-hub-info/20 bg-hub-info/5 px-4 py-3 text-sm text-slate-700">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-hub-info" />
        <p>
          Every group is moderated with care. Be kind, keep what's shared here confidential, and report anything that
          doesn't feel safe.
        </p>
      </div>

      {isLoading ? (
        <Loading label="Loading community…" />
      ) : isError ? (
        <EmptyState title="Could not load community" description="Please check your connection and try again." />
      ) : (data?.data.groups ?? []).length === 0 ? (
        <EmptyState title="No groups yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.data.groups ?? []).map((g) => (
            <Link key={g.id} to={`/app/community/${g.id}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                  <img src={coverPhoto(g.id)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-hub-primary backdrop-blur">{g.category}</span>
                </div>
                <CardContent className="p-5">
                  <h2 className="font-semibold text-hub-text">{g.name}</h2>
                  <p className="mt-1.5 line-clamp-2 text-sm text-hub-muted">{g.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-hub-muted">
                    <span className="inline-flex items-center gap-1">
                      <UsersRound className="h-4 w-4 text-hub-primary" />
                      {g.memberCount} members
                    </span>
                    {g.moderated ? <span className="text-hub-success">Moderated</span> : <span>Open</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}