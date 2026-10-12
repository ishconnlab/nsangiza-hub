import type { NextFunction, Request, Response } from 'express'

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown[]

  constructor(status: number, message: string, code = 'ERROR', details?: unknown[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: unknown[]): ApiError {
    return new ApiError(400, message, code, details)
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(401, message, code)
  }

  static forbidden(message = 'You do not have permission to access this area', code = 'FORBIDDEN'): ApiError {
    return new ApiError(403, message, code)
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND'): ApiError {
    return new ApiError(404, message, code)
  }

  static conflict(message: string, code = 'CONFLICT'): ApiError {
    return new ApiError(409, message, code)
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req, res, next).catch(next)
  }
}