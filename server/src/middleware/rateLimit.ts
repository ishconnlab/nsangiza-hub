import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../lib/errors'

interface Bucket {
  count: number
  resetAt: number
}

/**
 * Small in-memory fixed-window rate limiter. This is intentionally dependency
 * free; for multi-instance deployments swap the Map for a shared store.
 */
export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  const buckets = new Map<string, Bucket>()

  const cleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, options.windowMs)
  cleanup.unref?.()

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown'
    const now = Date.now()
    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs })
      next()
      return
    }

    bucket.count += 1
    if (bucket.count > options.max) {
      next(
        new ApiError(
          429,
          options.message ?? 'Too many requests. Please try again later.',
          'TOO_MANY_REQUESTS',
        ),
      )
      return
    }
    next()
  }
}
