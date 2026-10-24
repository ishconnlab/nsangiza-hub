import { Router } from 'express'
import { z } from 'zod'
import { ApiError, asyncHandler } from '../lib/errors'
import { ok } from '../lib/response'
import { requireRole, requireAuth, type AuthedRequest } from '../middleware/auth'
import Professional from '../models/Professional'
import Appointment from '../models/Appointment'
import Conversation from '../models/Conversation'
import FollowUp from '../models/FollowUp'
import User from '../models/User'
import AuditLog from '../models/AuditLog'
import Notification from '../models/Notification'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const router = Router()
router.use(requireAuth)

async function currentProfessional(req: AuthedRequest) {
  const professional = await Professional.findOne({ user: req.userId })
  if (!professional) throw ApiError.notFound('Professional profile not found. Complete professional onboarding first.')
  return professional
}

router.get(
  '/me',
  asyncHandler(async (req: AuthedRequest, res) => {
    const professional = await currentProfessional(req)
    res.json(ok({ professional }))
  }),
)

const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  providerType: z.string().optional(),
  title: z.string().optional(),
  about: z.string().max(2000).optional(),
  city: z.string().optional(),
  location: z.string().optional(),
  languages: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  supportAreas: z.array(z.string()).optional(),
  experienceYears: z.number().optional(),
  experience: z.string().optional(),
  qualifications: z.array(z.object({ title: z.string(), institution: z.string(), year: z.number().optional() })).optional(),
  sessionTypes: z.array(z.enum(['Secure chat', 'Audio call', 'Video call', 'In-person'])).optional(),
  pricePerSession: z.number().optional(),
  availability: z.array(z.object({ day: z.string(), start: z.string(), end: z.string(), enabled: z.boolean().optional() })).optional(),
  documents: z.array(z.object({ label: z.string(), status: z.enum(['pending', 'verified', 'rejected']).optional() })).optional(),
})

router.patch(
  '/me',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = profileSchema.parse(req.body)
    const professional = await currentProfessional(req)
    const step = (req.body.step as number | undefined)

    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined) {
        ;(professional as unknown as Record<string, unknown>)[key] = value
      }
    })
    if (step) professional.onboarding.step = step
    const keys = Object.keys(body)
    if (keys.includes('qualifications') || keys.includes('providerType') || keys.includes('about')) professional.onboarding.profileComplete = true
    if (keys.includes('availability')) professional.onboarding.availabilityComplete = true
    await professional.save()
    res.json(ok({ professional }, 'Professional profile updated.'))
  }),
)

router.post(
  '/me/submit',
  asyncHandler(async (req: AuthedRequest, res) => {
    const professional = await currentProfessional(req)
    if (professional.documents.length === 0) {
      throw ApiError.badRequest('Upload at least one document (e.g. your licence or degree certificate) before submitting for verification.')
    }
    const isNewSubmission = professional.verification.status !== 'Submitted'
    professional.verification.status = 'Submitted'
    professional.onboarding.submitted = true
    professional.onboarding.step = 8
    await professional.save()
    await AuditLog.create({ actor: String(req.userId), action: 'professional.submit', resource: 'Professional', resourceId: String(professional._id) })
    if (isNewSubmission) {
      const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPERVISOR'] }, active: true }).select('_id').lean()
      if (admins.length) await Notification.insertMany(admins.map((admin) => ({
        user: admin._id, type: 'professional', title: 'New professional application',
        body: 'A professional profile has been submitted for verification.', link: '/admin/professionals',
      })))
    }
    res.json(ok({ professional }, 'Application submitted. Your documents are being reviewed.'))
  }),
)

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024
const DATA_URL_PATTERN = /^data:(image\/(jpeg|png|webp)|application\/pdf);base64,/

router.post(
  '/me/documents',
  asyncHandler(async (req: AuthedRequest, res) => {
    const professional = await currentProfessional(req)
    if (professional.verification.status === 'Approved') {
      throw ApiError.badRequest('Your profile is verified. Contact support to change your documents.')
    }
    const body = z
      .object({
        label: z.string().min(1, 'Give the document a short label.').max(120),
        fileName: z.string().min(1).max(180),
        dataUrl: z.string().min(64),
      })
      .parse(req.body)

    const match = DATA_URL_PATTERN.exec(body.dataUrl)
    if (!match) {
      throw ApiError.badRequest('Upload a PDF, JPG, PNG or WebP file.')
    }
    const buffer = Buffer.from(body.dataUrl.slice(body.dataUrl.indexOf(',') + 1), 'base64')
    if (buffer.length === 0) throw ApiError.badRequest('That file appears to be empty.')
    if (buffer.length > MAX_DOCUMENT_BYTES) throw ApiError.badRequest('File is too large. Maximum size is 5 MB.')

    const ext = match[1].startsWith('image') ? match[2] : 'pdf'
    const base = (body.fileName
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[^a-zA-Z0-9._ -]/g, '_')
      .trim()
      .replace(/\s+/g, '_') || 'document').slice(0, 80)
    const stored = `${req.userId}-${Date.now()}-${base}.${ext}`

    const dir = path.join(process.cwd(), 'uploads', 'documents')
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, stored), buffer)

    professional.documents.push({ label: body.label, fileName: stored, status: 'pending' })
    professional.verification.documents.push(`uploads/documents/${stored}`)
    await professional.save()
    res.status(201).json(ok({ professional }, 'Document uploaded for review.'))
  }),
)

router.delete(
  '/me/documents/:docId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const professional = await currentProfessional(req)
    if (professional.verification.status === 'Approved') {
      throw ApiError.badRequest('Your profile is verified. Contact support to remove documents.')
    }
    const doc = professional.documents.find((d) => String(d._id) === req.params.docId)
    if (!doc) throw ApiError.notFound('Document not found.')
    professional.documents.pull(req.params.docId)
    professional.verification.documents = professional.verification.documents.filter((p) => p !== `uploads/documents/${doc.fileName}`)
    await professional.save()
    try {
      await fs.unlink(path.join(process.cwd(), 'uploads', 'documents', doc.fileName ?? ''))
    } catch {
      // file already gone — fine
    }
    res.json(ok({ professional }, 'Document removed.'))
  }),
)

router.get(
  '/dashboard',
  requireRole('PROFESSIONAL'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const professional = await currentProfessional(req)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay.getTime() - now.getDay() * 86400_000)

    const [todayAppointments, upcomingAppointments, pendingRequests, unreadMessages, pendingFollowUps, sessionsThisWeek, completedTotal] =
      await Promise.all([
        Appointment.countDocuments({ professional: professional._id, date: { $gte: startOfDay, $lt: new Date(startOfDay.getTime() + 86400_000) }, status: { $in: ['requested', 'confirmed'] } }),
        Appointment.find({ professional: professional._id, date: { $gte: now }, status: { $in: ['requested', 'confirmed'] } }).sort({ date: 1 }).limit(5).lean(),
        Appointment.countDocuments({ professional: professional._id, status: 'requested' }),
        (async () => {
          const conversations = await Conversation.find({ professional: professional._id }).lean()
          let total = 0
          for (const c of conversations) {
            total += Number((c.unread as unknown as Record<string, number>)?.[String(req.userId)] ?? 0)
          }
          return total
        })(),
        FollowUp.countDocuments({ professional: professional._id, status: { $in: ['pending', 'upcoming'] } }),
        Appointment.countDocuments({ professional: professional._id, date: { $gte: startOfWeek }, status: 'completed' }),
        Appointment.countDocuments({ professional: professional._id, status: 'completed' }),
      ])

    const profilePath = [
      'name',
      'about',
      'providerType',
      'qualifications',
    ] as const
    const profileCompleteness = Math.round(
      (profilePath.filter((key) => Boolean(professional[key])).length / profilePath.length) * 100,
    )

    res.json(
      ok({
        stats: {
          todayAppointments,
          pendingRequests,
          unreadMessages,
          upcomingCount: upcomingAppointments.length,
          sessionsThisWeek,
          responseRate: 96,
          completedSessions: completedTotal,
          pendingFollowUps,
          profileCompleteness,
        },
        upcomingSessions: upcomingAppointments,
      }),
    )
  }),
)

router.get(
  '/clients',
  requireRole('PROFESSIONAL'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const professional = await currentProfessional(req)
    const appointments = await Appointment.find({ professional: professional._id, status: { $in: ['confirmed', 'completed', 'requested', 'rescheduled'] } })
      .sort({ date: -1 })
      .select('user date status type')
      .lean()

    const userIds = [...new Set(appointments.map((a) => String(a.user)))]
    const users = await User.find({ _id: { $in: userIds } }).select('displayName city language lastLoginAt').lean()
    const usersById = new Map(users.map((u) => [String(u._id), u]))

    const clients = userIds.map((id) => {
      const userAppointments = appointments.filter((a) => String(a.user) === id).slice(0, 2)
      const user = usersById.get(id)
      return {
        id,
        displayName: user?.displayName ?? 'Client',
        city: user?.city ?? '',
        language: user?.language ?? '',
        lastInteraction: userAppointments[0]?.date ?? null,
        appointmentCount: appointments.filter((a) => String(a.user) === id).length,
        lastSession: userAppointments[0]?.date ?? null,
      }
    })

    res.json(ok({ clients }))
  }),
)

router.get(
  '/clients/:id',
  requireRole('PROFESSIONAL'),
  asyncHandler(async (req: AuthedRequest, res) => {
    const professional = await currentProfessional(req)

    // Least-privilege guard: only users with a real professional↔user
    // relationship (appointment or follow-up) may be viewed as clients.
    const eligibleStatuses = ['requested', 'confirmed', 'rescheduled', 'completed']
    const appointments = await Appointment.find({ professional: professional._id, user: req.params.id, status: { $in: eligibleStatuses } }).sort({ date: -1 }).lean()
    if (!appointments.length) throw ApiError.notFound('Client not found.')

    const user = await User.findById(req.params.id).select('displayName city language communicationPreference').lean()
    if (!user) throw ApiError.notFound('Client not found.')

    const conversation = await Conversation.findOne({ professional: professional._id, user: user._id, participants: { $all: [String(user._id), String(req.userId)], $size: 2 } }).lean()
    const followUps = await FollowUp.find({ professional: professional._id, user: user._id }).sort({ dueAt: 1 }).lean()

    // Least-privilege principle: only aggregate, non-clinical information by default.
    const summarized = appointments.map((a) => ({
      id: String(a._id),
      date: a.date,
      status: a.status,
      type: a.type,
    }))

    res.json(
      ok({
        client: {
          id: String(user._id),
          displayName: user.displayName,
          city: user.city,
          language: user.language,
          communicationPreference: user.communicationPreference,
        },
        appointments: summarized,
        conversationId: conversation ? String(conversation._id) : null,
        followUps,
        privacyNote: 'Only access information necessary for providing approved support.',
      }),
    )
  }),
)

export default router