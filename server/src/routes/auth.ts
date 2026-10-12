import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { ROLES } from '../constants'
import { env } from '../config/env'
import { ApiError, asyncHandler } from '../lib/errors'
import { ok } from '../lib/response'
import { rateLimit } from '../middleware/rateLimit'
import { requireAuth, signAccessToken, signRefreshToken, verifyRefreshToken, type AuthedRequest } from '../middleware/auth'
import User from '../models/User'
import type { UserSchema } from '../models/User'
import Professional from '../models/Professional'
import AuditLog from '../models/AuditLog'

const router = Router()

const REFRESH_COOKIE = 'nh_refresh'
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000

// Refresh cookie options. When the frontend (Vercel) and API (Render) live on
// different sites this must be SameSite=None + Secure=False; in local dev it is
// SameSite=Lax. Controlled by env so the same build works in both places.
const refreshCookieOptions = {
  httpOnly: true,
  sameSite: env.cookieSameSite,
  secure: env.cookieSecure,
  maxAge: REFRESH_MAX_AGE,
  path: '/api/v1/auth',
  ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
} as const

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many authentication attempts. Please try again in a few minutes.',
})

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  displayName: z.string().min(2, 'Please enter your display name.').max(80),
  role: z.enum([ROLES.USER, ROLES.PROFESSIONAL]).optional(),
  consent: z.boolean().optional(),
})

type UserWithId = UserSchema & { _id: { toString(): string } }

function publicUser(user: UserWithId) {
  return {
    id: String(user._id),
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    language: user.language,
    preferredSupportLanguage: user.preferredSupportLanguage,
    ageRange: user.ageRange,
    city: user.city,
    communicationPreference: user.communicationPreference,
    consent: user.consent,
    onboarding: user.onboarding,
    notificationSettings: user.notificationSettings,
    privacySettings: user.privacySettings,
  }
}

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body)
    const existing = await User.findOne({ email: body.email.toLowerCase() }).lean()
    if (existing) throw ApiError.conflict('An account with this email already exists.', 'EMAIL_TAKEN')

    const passwordHash = await bcrypt.hash(body.password, 10)
    const role = body.role === ROLES.PROFESSIONAL ? ROLES.PROFESSIONAL : ROLES.USER

    const user = await User.create({
      email: body.email.toLowerCase(),
      passwordHash,
      displayName: body.displayName.trim(),
      role,
      consent: { accepted: body.consent === true, acceptedAt: body.consent ? new Date() : null, version: '2026.1' },
    })

    let professionalId: string | undefined
    if (role === ROLES.PROFESSIONAL) {
      const professional = await Professional.create({
        user: user._id,
        name: body.displayName.trim(),
        providerType: 'Counsellor',
        verification: { status: 'Draft', documents: [] },
        isDemo: false,
      })
      professionalId = String(professional._id)
    }

    await AuditLog.create({ actor: String(user._id), action: 'auth.register', resource: 'User', resourceId: String(user._id) })

    const accessToken = signAccessToken(String(user._id), user.role)
    res.cookie(REFRESH_COOKIE, signRefreshToken(String(user._id)), refreshCookieOptions)

    res.status(201).json(
      ok(
        { user: { ...publicUser(user), professionalId }, accessToken },
        'Your account has been created. Welcome to Nsangiza Hub.',
      ),
    )
  }),
)

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your password.'),
})

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body)
    const user = await User.findOne({ email: body.email.toLowerCase() }).select('+passwordHash').lean()
    if (!user) throw ApiError.unauthorized('The email or password is not correct.', 'INVALID_CREDENTIALS')

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) throw ApiError.unauthorized('The email or password is not correct.', 'INVALID_CREDENTIALS')
    if (!user.active) throw ApiError.forbidden('This account is no longer active.', 'ACCOUNT_DEACTIVATED')

    await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() })
    await AuditLog.create({ actor: String(user._id), action: 'auth.login', resource: 'User', resourceId: String(user._id) })

    const accessToken = signAccessToken(String(user._id), user.role)
    res.cookie(REFRESH_COOKIE, signRefreshToken(String(user._id)), refreshCookieOptions)

    res.json(ok({ user: publicUser(user), accessToken }, 'Welcome back.'))
  }),
)

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.nh_refresh
    if (!token) throw ApiError.unauthorized('No session found.', 'NO_REFRESH_TOKEN')
    let payload
    try {
      payload = verifyRefreshToken(token)
    } catch {
      throw ApiError.unauthorized('Session invalid.', 'INVALID_REFRESH_TOKEN')
    }
    if (!payload.sub || !isValidObjectId(payload.sub)) throw ApiError.unauthorized('Session invalid.', 'INVALID_REFRESH_TOKEN')
    const user = await User.findById(payload.sub).lean()
    if (!user || !user.active) throw ApiError.unauthorized('Session invalid.', 'INVALID_REFRESH_TOKEN')
    const accessToken = signAccessToken(String(user._id), user.role)
    res.json(ok({ accessToken, user: publicUser(user) }, 'Session refreshed.'))
  }),
)

router.post(
  '/logout',
  asyncHandler(async (_req, res) => {
    res.clearCookie(REFRESH_COOKIE, {
      path: '/api/v1/auth',
      sameSite: env.cookieSameSite,
      secure: env.cookieSecure,
      ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
    })
    res.json(ok({}, 'Signed out.'))
  }),
)

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.userId).lean()
    if (!user) throw ApiError.notFound('Account not found.')
    res.json(ok({ user: publicUser(user) }, 'Success'))
  }),
)

export default router