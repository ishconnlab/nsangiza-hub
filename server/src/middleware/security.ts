import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env'

/**
 * Baseline security headers for the API. The frontend is a separate static
 * deployment (Vercel); these headers protect API responses and set HSTS in
 * production where Render terminates TLS.
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-DNS-Prefetch-Control', 'off')
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(self), camera=(self), display-capture=(self)')
  if (env.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
  }
  next()
}
