import { Router } from 'express'
import { ApiError, asyncHandler } from '../lib/errors'
import { paginated, ok } from '../lib/response'
import { requireAuth } from '../middleware/auth'
import Professional from '../models/Professional'
import type { FilterQuery } from 'mongoose'
import type { ProfessionalSchema } from '../models/Professional'

const router = Router()

type LeanProfessional = ProfessionalSchema & { _id: unknown }

function publicProfessional(p: LeanProfessional) {
  return {
    id: String(p._id),
    name: p.name,
    providerType: p.providerType,
    title: p.title,
    about: p.about,
    city: p.city,
    location: p.location,
    languages: p.languages,
    specializations: p.specializations,
    supportAreas: p.supportAreas,
    experienceYears: p.experienceYears,
    experience: p.experience,
    qualifications: p.qualifications,
    sessionTypes: p.sessionTypes,
    pricePerSession: p.pricePerSession,
    currency: p.currency,
    availability: p.availability,
    availabilityLabel: p.availabilityLabel,
    consultationModes: p.consultationModes,
    // Only the verified status is public. Verification documents (licences,
    // certificates) and internal account ids are never exposed.
    verification: { status: 'Approved', documents: [] },
    rating: p.rating,
    reviewCount: p.reviewCount,
    reviews: (p.reviews ?? []).map((r) => ({
      author: r.anonymous === false ? r.author : 'Anonymous',
      rating: r.rating,
      body: r.body,
      createdAt: r.createdAt,
      anonymous: r.anonymous ?? true,
    })),
    isDemo: p.isDemo ?? true,
    featured: p.featured ?? false,
  }
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const {
      q = '',
      specialization,
      language,
      city,
      providerType,
      experience = 'any',
      sort = 'recommended',
      page = '1',
      pageSize = '12',
      gender,
      sessionType,
      verified,
    } = req.query as Record<string, string>

    const filter: FilterQuery<ProfessionalSchema> = {
      active: true,
      'verification.status': 'Approved',
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { about: { $regex: q, $options: 'i' } },
        { specializations: { $regex: q, $options: 'i' } },
      ]
    }
    if (specialization) filter.specializations = { $in: [specialization] }
    if (language) filter.languages = { $in: [language] }
    if (city) filter.city = city
    if (providerType) filter.providerType = providerType
    if (sessionType) filter.sessionTypes = { $in: [sessionType] }
    if (gender && gender !== 'No preference') {
      filter.supportAreas = { $in: [gender.startsWith('Female') ? 'Women & wellbeing' : 'Men & wellbeing'] }
    }
    if (experience !== 'any') {
      const [min, max] = String(experience).split('-').map(Number)
      if (min !== undefined && max !== undefined) filter.experienceYears = { $gte: min, $lte: max }
      else if (String(experience) === 'plus') filter.experienceYears = { $gte: 10 }
    }
    if (verified === 'true') filter.isDemo = false

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      recommended: { featured: -1, rating: -1 },
      availability: { availabilityLabel: 1, rating: -1 },
      experience: { experienceYears: -1 },
      rating: { rating: -1 },
      'price-low': { pricePerSession: 1 },
      'price-high': { pricePerSession: -1 },
    }
    const sortQuery = sortMap[sort] ?? sortMap.recommended

    const pageNum = Math.max(1, Number(page) || 1)
    const pageSizeNum = Math.min(50, Math.max(1, Number(pageSize) || 12))
    const total = await Professional.countDocuments(filter)
    const results = await Professional.find(filter).sort(sortQuery).skip((pageNum - 1) * pageSizeNum).limit(pageSizeNum).lean()

    res.json(paginated(results.map((p) => publicProfessional(p)), pageNum, pageSizeNum, total))
  }),
)

router.get(
  '/cities',
  asyncHandler(async (_req, res) => {
    const cities = await Professional.distinct('city', { active: true, 'verification.status': 'Approved' })
    res.json(ok({ cities }, 'Success'))
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const professional = await Professional.findById(req.params.id).lean()
    if (!professional || !professional.active || professional.verification.status !== 'Approved') {
      throw ApiError.notFound('Professional not found.')
    }
    res.json(ok({ professional: publicProfessional(professional) }, 'Success'))
  }),
)

router.get(
  '/:id/availability',
  requireAuth,
  asyncHandler(async (req, res) => {
    const professional = await Professional.findById(req.params.id).select('availability availabilityLabel').lean()
    if (!professional) throw ApiError.notFound('Professional not found.')
    res.json(ok({ availability: professional.availability, availabilityLabel: professional.availabilityLabel }, 'Success'))
  }),
)

export default router