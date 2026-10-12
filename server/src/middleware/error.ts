import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../lib/errors'
import { fail } from '../lib/response'

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound('The requested endpoint does not exist.', 'ROUTE_NOT_FOUND'))
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
    res.status(400).json({ ...fail('Please check the information you provided.', 'VALIDATION_ERROR'), errors: details })
    return
  }

  if (err instanceof ApiError) {
    res.status(err.status).json(fail(err.message, err.code))
    return
  }

  // Malformed request body (body-parser JSON syntax error)
  if (err instanceof SyntaxError && 'status' in err && (err as { status?: number }).status === 400) {
    res.status(400).json(fail('Please check the information you provided.', 'INVALID_JSON'))
    return
  }

  // Mongoose malformed id / cast errors
  if (err instanceof Error && err.name === 'CastError') {
    res.status(400).json(fail('The requested resource identifier is not valid.', 'INVALID_ID'))
    return
  }

  console.error('[error]', err)
  res.status(500).json(fail('Something went wrong on our side. Please try again.', 'INTERNAL_ERROR'))
}