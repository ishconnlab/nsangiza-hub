import type { ReactNode } from 'react'
import { Label } from './label'
import { cn } from '../../lib/utils'

interface FormFieldProps {
  label?: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, hint, error, required, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-hub-danger"> *</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-hub-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-hub-muted">{hint}</p>
      ) : null}
    </div>
  )
}