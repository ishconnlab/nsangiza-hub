import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { env } from '../config/env'
import { ApiError, asyncHandler } from '../lib/errors'
import User from '../models/User'

export interface AuthedRequest extends Request {
  userId?: string
  role?: string
}

export interface AccessTokenPayload extends JwtPayload {
  sub: string
  role: string
  ver?: number
}

export function signAccessToken(userId: string, role: string, authVersion = 0): string {
  const payload: AccessTokenPayload = { sub: userId, role, ver: authVersion }
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  } as jwt.SignOptions)
}

export function signRefreshToken(userId: string, authVersion = 0): string {
  const payload: AccessTokenPayload = { sub: userId, role: 'USER', ver: authVersion }
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } as jwt.SignOptions)
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload
}

export function verifyRefreshToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as AccessTokenPayload
}

export const requireAuth = asyncHandler(async (req: AuthedRequest, _res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized()
  }

  let payload: AccessTokenPayload
  try {
    payload = verifyAccessToken(header.slice(7))
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.', 'TOKEN_EXPIRED')
  }

  if (!payload.sub || !mongoose.isValidObjectId(payload.sub)) {
    throw ApiError.unauthorized('Your session is invalid. Please sign in again.', 'INVALID_TOKEN_SUBJECT')
  }

  const user = await User.findById(payload.sub).select('_id role active authVersion').lean()
  if (!user) {
    throw ApiError.unauthorized('Account not found.', 'ACCOUNT_NOT_FOUND')
  }
  if (!user.active) {
    throw ApiError.forbidden('This account is no longer active.', 'ACCOUNT_DEACTIVATED')
  }
  if ((payload.ver ?? 0) !== (user.authVersion ?? 0)) {
    throw ApiError.unauthorized('Your password changed. Please sign in again.', 'SESSION_REVOKED')
  }

  req.userId = user._id.toString()
  req.role = user.role
  next()
})

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.userId || !req.role || !roles.includes(req.role)) {
      throw ApiError.forbidden()
    }
    next()
  }
}
