import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5',
  {
    variants: {
      variant: {
        default: 'bg-hub-primary-light text-hub-primary',
        secondary: 'bg-slate-100 text-slate-700',
        success: 'bg-green-50 text-hub-success',
        warning: 'bg-amber-50 text-hub-warning',
        danger: 'bg-red-50 text-hub-danger',
        info: 'bg-blue-50 text-hub-info',
        outline: 'border border-slate-200 text-slate-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }