import { Badge, type BadgeProps } from './badge'
import { useI18n } from '../../i18n/LanguageProvider'

type BadgeVariant = NonNullable<BadgeProps['variant']>

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  requested: 'warning',
  confirmed: 'success',
  rescheduled: 'info',
  completed: 'secondary',
  cancelled: 'danger',
  declined: 'danger',
  'no-show': 'danger',
  overdue: 'danger',
  pending: 'warning',
  active: 'info',
  resolved: 'secondary',
  hidden: 'secondary',
  dismissed: 'secondary',
  review: 'warning',
  verified: 'success',
  rejected: 'danger',
  published: 'success',
  draft: 'secondary',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { tl } = useI18n()
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'secondary'} className={className}>
      {tl(`status.${status}`)}
    </Badge>
  )
}