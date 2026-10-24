import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, Star } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { formatPrice, initials } from '../lib/format'
import { providerPhoto } from '../lib/images'
import { useAuth } from '../hooks/auth-context'
import type { Professional } from '../types'

export function ProviderCard({ provider, verifiedOnly = true }: { provider: Professional; verifiedOnly?: boolean }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  if (verifiedOnly && provider.verification.status !== 'Approved') return null

  const profileHref = `/professionals/${provider.id}`

  function openProfile() {
    if (isAuthenticated) {
      navigate(profileHref)
    } else {
      navigate('/login', { state: { from: profileHref } })
    }
  }

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
              <AvatarImage src={providerPhoto(provider.id)} alt="" />
              <AvatarFallback>{initials(provider.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Link to={profileHref} className="block break-words text-sm font-semibold leading-tight text-hub-text hover:text-hub-primary sm:text-base">
                {provider.name}
              </Link>
              <p className="line-clamp-2 text-xs font-medium text-hub-primary">{provider.providerType}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-hub-text sm:text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {provider.rating.toFixed(1)}
            <span className="text-xs font-normal text-hub-muted">({provider.reviewCount})</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {provider.specializations.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary">
              {s}
            </Badge>
          ))}
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-hub-muted">{provider.about}</p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-hub-muted">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5" />
            {provider.city ?? 'Rwanda'}
          </span>
          {provider.pricePerSession !== undefined && (
            <span className="font-semibold text-hub-text">
              {formatPrice(provider.pricePerSession)}
              <span className="ml-1 font-normal text-hub-muted">/ session</span>
            </span>
          )}
        </div>

        <Button className="mt-4 w-full" size="sm" onClick={openProfile}>
          View profile
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardContent>
    </Card>
  )
}
