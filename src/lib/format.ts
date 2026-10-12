import { getCurrentLocale } from '../i18n/locale'

export function formatDate(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(getCurrentLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function formatTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(getCurrentLocale(), { hour: 'numeric', minute: '2-digit' }).format(date)
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return `${formatDate(value)} · ${formatTime(value)}`
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(getCurrentLocale()).format(value)
}

export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.round(diffMs / 60_000)
  const minutesAbs = Math.abs(minutes)

  try {
    const rtf = new Intl.RelativeTimeFormat(getCurrentLocale(), { numeric: 'auto', style: 'short' })
    if (minutesAbs < 1) return rtf.format(0, 'minute')
    if (minutesAbs < 60) return rtf.format(-minutes, 'minute')
    const hours = Math.round(minutes / 60)
    if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour')
    const days = Math.round(hours / 24)
    if (Math.abs(days) < 7) return rtf.format(-days, 'day')
  } catch {
    // locale not supported by Intl — fall through to an absolute date
  }

  return formatDate(date)
}

export function formatPrice(value: number | undefined | null, currency = 'RWF'): string {
  if (value === undefined || value === null) return '—'
  const number = formatNumber(value)
  if (currency === 'RWF') return `${number} RWF`
  return new Intl.NumberFormat(getCurrentLocale(), { style: 'currency', currency }).format(value)
}

export function initials(name: string | undefined | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
