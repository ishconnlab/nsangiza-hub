import { Badge, type BadgeProps } from './badge'

type BadgeVariant = NonNullable<BadgeProps['variant']>

const STATUS_LOOKUP: Record<string, { label: string; variant: BadgeVariant }> = {
  requested: { label: 'Requested', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  rescheduled: { label: 'Rescheduled', variant: 'info' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  'no-show': { label: 'No show', variant: 'danger' },
}

function titleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const known = STATUS_LOOKUP[status]
  return <Badge variant={known?.variant ?? 'secondary'} className={className}>{known?.label ?? titleCase(status)}</Badge>
}