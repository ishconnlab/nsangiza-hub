import { useId } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'

export function BrandMark({ className }: { className?: string }) {
  const raw = useId()
  const gid = `nsz-${raw.replace(/[^a-zA-Z0-9]/g, '')}`
  const left = 'M24 12.8C22.3 10.4 19.8 10 16.3 10 11.2 10 7 13.9 7 19.4c0 6.2 6.6 11.8 17 19.1Z'
  const right = 'M24 12.8C25.7 10.4 28.2 10 31.7 10 36.8 10 41 13.9 41 19.4c0 6.2-6.6 11.8-17 19.1Z'
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={cn('h-9 w-9', className)}>
      <defs>
        <linearGradient id={gid} x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3E8F66" />
          <stop offset="1" stopColor="#214B38" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={`url(#${gid})`} />
      <path fill="#DCEFE3" d={left} />
      <path fill="#FFFFFF" d={right} />
    </svg>
  )
}

interface BrandProps {
  to?: string
  className?: string
}

export default function Brand({ to = '/', className }: BrandProps) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)} aria-label="Nsangiza Hub home">
      <BrandMark />
      <span className="text-lg font-extrabold tracking-tight text-hub-primary">
        Nsangiza <span className="text-hub-text">Hub</span>
      </span>
    </Link>
  )
}
