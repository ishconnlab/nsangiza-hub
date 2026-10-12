import { Router } from 'express'
import { ok } from '../lib/response'
import { asyncHandler } from '../lib/errors'
import { requireAuth } from '../middleware/auth'
import Professional from '../models/Professional'
import type { FilterQuery } from 'mongoose'
import type { ProfessionalSchema } from '../models/Professional'

const router = Router()

router.get(
  '/recommendations',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { topics, city, language, limit = '4' } = req.query as Record<string, string>
    const limitNum = Math.min(12, Math.max(1, Number(limit) || 4))
    const query: FilterQuery<ProfessionalSchema> = { active: true, 'verification.status': 'Approved' }

    const topicList = topics ? topics.split(',').filter(Boolean) : []
    if (topicList.length) query.specializations = { $in: topicList }
    if (city && city !== 'Anywhere') query.city = city
    if (language) {
      const lang = language as unknown as ProfessionalSchema['languages'][number]
      query.languages = { $in: [lang] }
    }

    let base = await Professional.find(query).sort({ rating: -1, featured: -1 }).limit(limitNum).lean()
    if (base.length < limitNum) {
      const fallback: FilterQuery<ProfessionalSchema> = { active: true, 'verification.status': 'Approved' }
      const ids = base.map((p) => String(p._id))
      if (ids.length) fallback._id = { $nin: ids }
      const extra = await Professional.find(fallback).sort({ rating: -1 }).limit(limitNum - base.length).lean()
      base = [...base, ...extra]
    }

    const recommendations = base.map((p) => {
      const isBest = topicList.length > 0 && (p.specializations ?? []).some((s) => topicList.includes(s))
      const isLanguage = language ? (p.languages ?? []).includes(language as unknown as ProfessionalSchema['languages'][number]) : false
      const badge = isBest
        ? 'Best match'
        : isLanguage
          ? 'Good language match'
          : String(p.city) === city
            ? 'Specialises in your area'
            : 'Recommended'
      const score = Math.round((isBest ? 95 : isLanguage ? 88 : 80) + Math.min(5, p.rating * 10 - 44))
      return {
        id: String(p._id),
        name: p.name,
        providerType: p.providerType,
        city: p.city,
        languages: p.languages,
        specializations: p.specializations,
        experienceYears: p.experienceYears,
        rating: p.rating,
        verification: { status: p.verification.status, documents: [] },
        pricePerSession: p.pricePerSession,
        currency: p.currency,
        sessionTypes: p.sessionTypes,
        availabilityLabel: p.availabilityLabel,
        isDemo: p.isDemo ?? true,
        matchReason: badge,
        matchScore: score,
      }
    })

    res.json(
      ok(
        { recommendations, note: 'Frontend recommendation demo — not clinically validated.' },
        'Here are some support options that may fit you.',
      ),
    )
  }),
)

export default router