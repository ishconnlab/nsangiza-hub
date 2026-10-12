import { Link } from 'react-router-dom'
import { Clock3, Tag } from 'lucide-react'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import { formatDate } from '../lib/format'
import { resourcePhoto } from '../lib/images'
import type { Resource } from '../types'

export function ResourceCard({ resource }: { resource: Resource }) {
  const image = resourcePhoto(resource)

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative h-36 w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge variant="default">{resource.category}</Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-hub-muted">{resource.author ?? 'Nsangiza Hub'}</span>
          {resource.readingTimeMin ? (
            <span className="inline-flex items-center gap-1 text-xs text-hub-muted">
              <Clock3 className="h-3.5 w-3.5" />
              {resource.readingTimeMin} min
            </span>
          ) : null}
        </div>
        <Link to={`/resources/${resource.slug}`}>
          <h3 className="mt-2 font-semibold leading-snug text-hub-text transition-colors hover:text-hub-primary">
            {resource.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-hub-muted">{resource.summary}</p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-hub-muted">
          <span>{resource.publishedAt ? formatDate(resource.publishedAt) : ''}</span>
          {resource.tags?.length ? (
            <span className="inline-flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {resource.tags[0]}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
