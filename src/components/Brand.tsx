import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={cn('h-8 w-8', className)}>
      <rect width="48" height="48" rx="11" fill="#2F6B4F" />
      <path
        d="M24 12c-7.2 0-13 5.1-13 11.4 0 3.4 1.8 6.4 4.7 8.3-.2 1.6-.9 3.4-2.1 4.7-.2.2 0 .6.3.5 2-.5 3.7-1.4 5-2.5 1.7.5 3.4.7 5.1.7 7.2 0 13-5.1 13-11.4S31.2 12 24 12Z"
        fill="#fff"
      />
      <circle cx="18.5" cy="23.5" r="1.7" fill="#2F6B4F" />
      <circle cx="24" cy="23.5" r="1.7" fill="#2F6B4F" />
      <circle cx="29.5" cy="23.5" r="1.7" fill="#2F6B4F" />
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