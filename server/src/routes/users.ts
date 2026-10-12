import { Router } from 'express'
import { z } from 'zod'
import { ApiError, asyncHandler } from '../lib/errors'
import { ok } from '../lib/response'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import User from '../models/User'
import Assessment from '../models/Assessment'
import CheckIn from '../models/CheckIn'
import { COMMUNICATION_PREFERENCES, LANGUAGES } from '../constants'

const router = Router()

const profileSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  language: z.enum(LANGUAGES).optional(),
  preferredSupportLanguage: z.enum(LANGUAGES).optional(),
  ageRange: z.string().optional(),
  city: z.string().optional(),
  communicationPreference: z.enum(COMMUNICATION_PREFERENCES).optional(),
  notificationSettings: z
    .object({
      appointmentReminders: z.boolean().optional(),
      messages: z.boolean().optional(),
      followUps: z.boolean().optional(),
      community: z.boolean().optional(),
      system: z.boolean().optional(),
    })
    .optional(),
  privacySettings: z
    .object({
      reduceMotion: z.boolean().optional(),
      simpleView: z.boolean().optional(),
      allowAnalytics: z.boolean().optional(),
    })
    .optional(),
})

router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = profileSchema.parse(req.body)
    const user = await User.findById(req.userId)
    if (!user) throw ApiError.notFound('Account not found.')

    if (body.displayName !== undefined) user.displayName = body.displayName.trim()
    if (body.language !== undefined) user.language = body.language
    if (body.preferredSupportLanguage !== undefined) user.preferredSupportLanguage = body.preferredSupportLanguage
    if (body.ageRange !== undefined) user.ageRange = body.ageRange
    if (body.city !== undefined) user.city = body.city
    if (body.communicationPreference !== undefined) user.communicationPreference = body.communicationPreference
    if (body.notificationSettings) {
      const s = body.notificationSettings
      user.notificationSettings.appointmentReminders = s.appointmentReminders ?? user.notificationSettings.appointmentReminders
      user.notificationSettings.messages = s.messages ?? user.notificationSettings.messages
      user.notificationSettings.followUps = s.followUps ?? user.notificationSettings.followUps
      user.notificationSettings.community = s.community ?? user.notificationSettings.community
      user.notificationSettings.system = s.system ?? user.notificationSettings.system
    }
    if (body.privacySettings) {
      const s = body.privacySettings
      user.privacySettings.reduceMotion = s.reduceMotion ?? user.privacySettings.reduceMotion
      user.privacySettings.simpleView = s.simpleView ?? user.privacySettings.simpleView
      user.privacySettings.allowAnalytics = s.allowAnalytics ?? user.privacySettings.allowAnalytics
    }

    await user.save()
    res.json(ok({ user: { id: String(user._id), ...body } }, 'Profile updated.'))
  }),
)

router.post(
  '/onboarding/consent',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.userId)
    if (!user) throw ApiError.notFound('Account not found.')
    user.consent = { accepted: true, acceptedAt: new Date(), version: '2026.1' }
    user.onboarding.consentSeen = true
    await user.save()
    res.json(ok({ consent: user.consent }, 'Consent recorded.'))
  }),
)

router.post(
  '/onboarding/preferences',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = profileSchema.partial().parse(req.body)
    const user = await User.findById(req.userId)
    if (!user) throw ApiError.notFound('Account not found.')
    if (body.displayName !== undefined) user.displayName = body.displayName.trim()
    if (body.language !== undefined) user.language = body.language
    if (body.preferredSupportLanguage !== undefined) user.preferredSupportLanguage = body.preferredSupportLanguage
    if (body.ageRange !== undefined) user.ageRange = body.ageRange
    if (body.city !== undefined) user.city = body.city
    if (body.communicationPreference !== undefined) user.communicationPreference = body.communicationPreference
    user.onboarding.preferencesComplete = true
    await user.save()
    res.json(ok({ preferences: { displayName: user.displayName, language: user.language, preferredSupportLanguage: user.preferredSupportLanguage, ageRange: user.ageRange, city: user.city, communicationPreference: user.communicationPreference } }, 'Preferences saved.'))
  }),
)

const assessmentSchemaRaw = z.object({
  answers: z.record(z.string(), z.unknown()),
  responses: z.array(z.object({ questionId: z.string(), value: z.unknown() })).optional(),
  safetyFlag: z.boolean().optional(),
  safetyNote: z.string().optional(),
  summary: z.string().optional(),
})

router.post(
  '/onboarding/assessment',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = assessmentSchemaRaw.parse(req.body)
    const user = await User.findById(req.userId)
    if (!user) throw ApiError.notFound('Account not found.')

    const assessment = await Assessment.findOneAndUpdate(
      { user: req.userId },
      {
        user: req.userId,
        answers: body.answers,
        responses: body.responses ?? [],
        summary: body.summary ?? '',
        safetyFlag: body.safetyFlag === true,
        safetyNote: body.safetyNote ?? '',
        completedAt: new Date(),
      },
      { upsert: true, new: true },
    )

    user.onboarding.assessmentComplete = true
    await user.save()

    res.json(
      ok(
        { assessment: { id: String(assessment._id), summary: assessment.summary, safetyFlag: assessment.safetyFlag } },
        'Your responses are saved. They help us understand what kind of support may fit you.',
      ),
    )
  }),
)

router.get(
  '/onboarding/status',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.userId).lean()
    if (!user) throw ApiError.notFound('Account not found.')
    res.json(
      ok({
        status: user.onboarding,
        complete: user.onboarding.consentSeen && user.onboarding.preferencesComplete && user.onboarding.assessmentComplete,
      }),
    )
  }),
)

const checkInSchema = z.object({
  mood: z.enum(['very-difficult', 'difficult', 'okay', 'good', 'very-good']),
  factors: z.array(z.string()).optional(),
  note: z.string().max(500).optional(),
})

router.post(
  '/check-ins',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = checkInSchema.parse(req.body)
    const record = await CheckIn.create({ user: req.userId, mood: body.mood, factors: body.factors ?? [], note: body.note ?? '' })
    res.status(201).json(ok({ checkIn: record }, 'Thank you for checking in.'))
  }),
)

router.get(
  '/check-ins',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const records = await CheckIn.find({ user: req.userId }).sort({ createdAt: -1 }).limit(60).lean()
    res.json(ok({ checkIns: records }))
  }),
)

router.get(
  '/wellbeing/trend',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const records = await CheckIn.find({ user: req.userId }).sort({ createdAt: 1 }).select('mood factors createdAt').lean()
    const series = records.map((r) => ({ date: r.createdAt, mood: r.mood }))
    const factors = new Map<string, number>()
    for (const r of records) {
      for (const f of r.factors) factors.set(f, (factors.get(f) ?? 0) + 1)
    }
    const topFactors = [...factors.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
    res.json(ok({ trend: series, topFactors, totalCheckIns: records.length }))
  }),
)

export default router