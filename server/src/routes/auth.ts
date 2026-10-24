import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { createHash, randomBytes } from 'node:crypto'
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
const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests. Please try again later.',
})
const passwordResetSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many password reset attempts. Please try again later.',
})

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[char]!)
}

async function sendPasswordResetEmail(to: string, displayName: string, resetUrl: string) {
  if (!env.resendApiKey || !env.passwordResetFrom) {
    throw new ApiError(503, 'Password reset email is not configured yet. Please contact support.', 'EMAIL_NOT_CONFIGURED')
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.passwordResetFrom,
      to: [to],
      subject: 'Reset your Nsangiza Hub password',
      text: `Hello ${displayName},\n\nUse this link to choose a new password. It expires in 30 minutes and can only be used once:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#17332e"><h1>Reset your password</h1><p>Hello ${escapeHtml(displayName)},</p><p>Use the button below to choose a new password. This link expires in 30 minutes and can only be used once.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;background:#167d69;color:#fff;text-decoration:none;border-radius:8px">Choose a new password</a></p><p>If you did not request this, you can ignore this email.</p></div>`,
    }),
  })
  if (!response.ok) {
    throw new Error(`Password reset email provider returned ${response.status}.`)
  }
}

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
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

    const accessToken = signAccessToken(String(user._id), user.role, user.authVersion ?? 0)
    res.cookie(REFRESH_COOKIE, signRefreshToken(String(user._id), user.authVersion ?? 0), refreshCookieOptions)

    res.status(201).json(
      ok(
        { user: { ...publicUser(user), professionalId }, accessToken },
        'Your account has been created. Welcome to Nsangiza Hub.',
      ),
    )
  }),
)

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
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

    const accessToken = signAccessToken(String(user._id), user.role, user.authVersion ?? 0)
    res.cookie(REFRESH_COOKIE, signRefreshToken(String(user._id), user.authVersion ?? 0), refreshCookieOptions)

    res.json(ok({ user: publicUser(user), accessToken }, 'Welcome back.'))
  }),
)

router.post(
  '/forgot-password',
  passwordResetRequestLimiter,
  asyncHandler(async (req, res) => {
    const body = z.object({ email: z.string().trim().toLowerCase().email('Please enter a valid email address.') }).parse(req.body)
    if (!env.resendApiKey || !env.passwordResetFrom) {
      throw new ApiError(503, 'Password reset email is not configured yet. Please contact support.', 'EMAIL_NOT_CONFIGURED')
    }
    const user = await User.findOne({ email: body.email }).select('_id email displayName')
    if (user) {
      const token = randomBytes(32).toString('hex')
      const tokenHash = hashResetToken(token)
      user.set({ passwordResetTokenHash: tokenHash, passwordResetExpiresAt: new Date(Date.now() + 30 * 60_000) })
      await user.save()
      const resetUrl = `${env.publicAppUrl.replace(/\/$/, '')}/reset-password?token=${token}`
      try {
        await sendPasswordResetEmail(user.email, user.displayName, resetUrl)
      } catch (error) {
        await User.updateOne({ _id: user._id, passwordResetTokenHash: tokenHash }, { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } })
        console.error('Password reset email delivery failed.', error instanceof Error ? error.message : 'Unknown provider error')
      }
    }
    res.json(ok({}, 'If an account matches that email, a password reset link has been sent.'))
  }),
)

router.post(
  '/reset-password',
  passwordResetSubmitLimiter,
  asyncHandler(async (req, res) => {
    const body = z.object({
      token: z.string().regex(/^[a-f0-9]{64}$/i, 'This password reset link is invalid or expired.'),
      password: z.string().min(8, 'Password must be at least 8 characters.'),
    }).parse(req.body)
    const tokenHash = hashResetToken(body.token)
    const now = new Date()
    const user = await User.findOne({ passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: now } })
      .select('_id')
      .select('+passwordResetTokenHash +passwordResetExpiresAt')
      .lean()
    if (!user) throw ApiError.badRequest('This password reset link is invalid or expired.', 'RESET_LINK_INVALID')

    const passwordHash = await bcrypt.hash(body.password, 10)
    const result = await User.updateOne(
      { _id: user._id, passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: now } },
      {
        $set: { passwordHash },
        $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
        $inc: { authVersion: 1 },
      },
    )
    if (result.modifiedCount !== 1) throw ApiError.badRequest('This password reset link is invalid or expired.', 'RESET_LINK_INVALID')
    await AuditLog.create({ actor: String(user._id), action: 'auth.password-reset', resource: 'User', resourceId: String(user._id) })
    res.json(ok({}, 'Your password has been reset. Sign in with your new password.'))
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
    if ((payload.ver ?? 0) !== (user.authVersion ?? 0)) throw ApiError.unauthorized('Your password changed. Please sign in again.', 'SESSION_REVOKED')
    const accessToken = signAccessToken(String(user._id), user.role, user.authVersion ?? 0)
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
