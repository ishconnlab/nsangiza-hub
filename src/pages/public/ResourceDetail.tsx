import { Link, useParams } from 'react-router-dom'
import { Clock3, Tag } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Loading, EmptyState } from '../../components/PageHeader'
import { ResourceCard } from '../../components/ResourceCard'
import { SafetyNotice } from '../../components/SafetyNotice'
import { formatDate } from '../../lib/format'
import { resourcePhoto } from '../../lib/images'
import { useResourceDetail } from '../../services/resources'

export default function ResourceDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, isError } = useResourceDetail(slug ?? '')

  if (isLoading) return <div className="container-hub py-16"><Loading label="Loading resource…" /></div>
  if (isError || !data) {
    return (
      <div className="container-hub py-16">
        <EmptyState title="Resource not found" action={<Link to="/resources"><Button variant="outline">Browse resources</Button></Link>} />
      </div>
    )
  }

  const { resource, related } = data.data

  return (
    <div className="container-hub py-10">
      <p className="mb-4 text-sm text-hub-muted">
        <Link to="/resources" className="hover:text-hub-primary">Resources</Link> → {resource.category}
      </p>

      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{resource.category}</Badge>
          {resource.readingTimeMin ? (
            <span className="inline-flex items-center gap-1 text-xs text-hub-muted">
              <Clock3 className="h-3.5 w-3.5" />
              {resource.readingTimeMin} min read
            </span>
          ) : null}
          {resource.publishedAt ? <span className="text-xs text-slate-400">{formatDate(resource.publishedAt)}</span> : null}
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-hub-text">{resource.title}</h1>
        <p className="mt-3 text-hub-muted">{resource.summary}</p>

        {resource.featuredImage !== 'hidden' && (
          <img
            src={resourcePhoto(resource)}
            alt=""
            className="mt-6 h-56 w-full rounded-2xl object-cover"
            loading="lazy"
          />
        )}

        {resource.body && (
          <article className="prose-hub mt-6 whitespace-pre-line text-[15px] leading-7 text-hub-text">
            {resource.body}
          </article>
        )}

        {resource.tags && resource.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {resource.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                <Tag className="h-3 w-3" />
                {t}
              </span>
            ))}
          </div>
        )}

        <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
          This resource is for general information and is not a substitute for professional care. If you're struggling,
          reach out to a professional or the emergency contacts below.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-3xl"><SafetyNotice compact /></div>

      {related.length > 0 && (
        <div className="mx-auto mt-10 max-w-5xl">
          <h2 className="mb-4 text-xl font-bold text-hub-text">Keep reading</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </div>
      )}
    </div>
  )
}