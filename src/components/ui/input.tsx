import * as React from 'react'

import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, invalid, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-hub-text placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hub-primary/40 disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-hub-danger focus-visible:ring-hub-danger/40',
        className,
      )}
      ref={ref}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }