import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { ApiError, asyncHandler } from '../lib/errors'
import { ok } from '../lib/response'
import { requireAuth, requireRole, type AuthedRequest as AReq } from '../middleware/auth'
import User from '../models/User'
import Professional from '../models/Professional'
import Appointment from '../models/Appointment'
import CommunityPost from '../models/CommunityPost'
import CommunityGroup from '../models/CommunityGroup'
import Resource from '../models/Resource'
import SafeguardingCase from '../models/SafeguardingCase'
import AuditLog from '../models/AuditLog'
import Notification from '../models/Notification'

const router = Router()
router.use(requireAuth)
router.use(requireRole('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPERVISOR'))

// The most sensitive administrative actions are reserved for real
// administrators. Moderators and supervisors keep verification review,
// community moderation and safeguarding work.
const requireAdminOnly = requireRole('ADMIN', 'SUPER_ADMIN')

router.get(
  '/dashboard',
  asyncHandler(async (_req: AReq, res) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [totalUsers, activeUsers, verifiedProfessionals, pendingProfessionals, appointmentsTotal, sessionsCompleted, reportedPosts, safeguardingOpen, resourcesPublished, communityGroups] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ lastLoginAt: { $gte: startOfMonth } }),
        Professional.countDocuments({ 'verification.status': 'Approved' }),
        Professional.countDocuments({ 'verification.status': { $in: ['Submitted', 'Under Review'] } }),
        Appointment.countDocuments(),
        Appointment.countDocuments({ status: 'completed' }),
        CommunityPost.countDocuments({ reported: true, hidden: false }),
        SafeguardingCase.countDocuments({ status: { $in: ['New', 'Under Review', 'Escalated'] } }),
        Resource.countDocuments({ published: true }),
        CommunityGroup.countDocuments({ active: true }),
      ])

    // Growth series (last 12 buckets to keep seed fast)
    const userGrowth = await mongoose.connection.collection('users')
      .aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ])
      .toArray()

    const sessionsSeries = await mongoose.connection.collection('appointments')
      .aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ])
      .toArray()

    const supportCategoryBreakdown = await mongoose.connection.collection('professionals')
      .aggregate([
        { $unwind: '$specializations' },
        { $group: { _id: '$specializations', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ])
      .toArray()

    const providerActivity = await mongoose.connection.collection('professionals')
      .aggregate([
        { $group: { _id: { $ifNull: ['$city', 'Kigali'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 9 },
      ])
      .toArray()

    const appointmentCompletion = await mongoose.connection.collection('appointments')
      .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      .toArray()

    res.json(
      ok({
        stats: {
          totalUsers,
          activeUsers,
          verifiedProfessionals,
          pendingProfessionals,
          appointmentsTotal,
          sessionsCompleted,
          reportedPosts,
          safeguardingOpen,
          resourcesPublished,
          communityGroups,
        },
        series: {
          userGrowth: userGrowth.map((r) => ({ month: r._id as string, count: r.count as number })),
          sessions: sessionsSeries.map((r) => ({ month: r._id as string, count: r.count as number })),
        },
        charts: {
          supportCategories: supportCategoryBreakdown.map((r) => ({ label: r._id as string, value: r.count as number })),
          providerActivity: providerActivity.map((r) => ({ label: r._id as string, value: r.count as number })),
          appointmentCompletion: appointmentCompletion.map((r) => ({ label: r._id as string, value: r.count as number })),
        },
      }),
    )
  }),
)

router.get(
  '/users',
  requireAdminOnly,
  asyncHandler(async (req: AReq, res) => {
    const { q, role, page = '1', pageSize = '20' } = req.query as Record<string, string>
    const filter: Record<string, unknown> = {}
    if (q) filter.$or = [{ displayName: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }]
    if (role) filter.role = role

    const pageNum = Math.max(1, Number(page) || 1)
    const size = Math.min(50, Math.max(1, Number(pageSize) || 20))
    const total = await User.countDocuments(filter)
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * size).limit(size).lean()
    res.json(
      ok({
        users: users.map((u) => ({ id: String(u._id), displayName: u.displayName, email: u.email, role: u.role, city: u.city, active: u.active, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt })),
        total,
        page: pageNum,
        pageSize: size,
      }),
    )
  }),
)

router.patch(
  '/users/:id/status',
  requireAdminOnly,
  asyncHandler(async (req: AReq, res) => {
    const body = z.object({ active: z.boolean() }).parse(req.body)
    if (req.params.id === req.userId && !body.active) {
      throw ApiError.badRequest('You cannot deactivate your own account.')
    }
    const target = await User.findById(req.params.id).select('role active').lean()
    if (!target) throw ApiError.notFound('User not found.')
    if (!body.active && target.role !== 'USER' && req.role !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Only a super administrator can deactivate staff accounts.')
    }
    await User.updateOne({ _id: req.params.id }, { active: body.active })
    await AuditLog.create({ actor: String(req.userId), action: 'admin.user.set-active', resource: 'User', resourceId: req.params.id })
    res.json(ok({ id: req.params.id, active: body.active }, 'User status updated.'))
  }),
)

router.get(
  '/professionals',
  asyncHandler(async (req: AReq, res) => {
    const { status, q, page = '1', pageSize = '20' } = req.query as Record<string, string>
    const filter: Record<string, unknown> = {}
    if (status) filter['verification.status'] = status
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { providerType: { $regex: q, $options: 'i' } }]

    const pageNum = Math.max(1, Number(page) || 1)
    const size = Math.min(50, Math.max(1, Number(pageSize) || 20))
    const total = await Professional.countDocuments(filter)
    const items = await Professional.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * size).limit(size).lean()
    res.json(
      ok({
        professionals: items.map((p) => ({ id: String(p._id), userId: p.user ? String(p.user) : undefined, name: p.name, providerType: p.providerType, city: p.city, languages: p.languages, specializations: p.specializations, verification: p.verification, documents: p.verification?.documents ?? [], isDemo: p.isDemo, createdAt: p.createdAt })),
        total,
        page: pageNum,
        pageSize: size,
      }),
    )
  }),
)

router.get(
  '/professionals/pending',
  asyncHandler(async (req: AReq, res) => {
    const items = await Professional.find({ 'verification.status': { $in: ['Submitted', 'Under Review'] } }).sort({ createdAt: 1 }).limit(100).lean()
    res.json(ok({ professionals: items.map((p) => ({ id: String(p._id), name: p.name, providerType: p.providerType, verification: p.verification, createdAt: p.createdAt })) }))
  }),
)

const verificationSchema = z.object({
  status: z.enum(['Approved', 'Rejected', 'Under Review', 'Suspended', 'Request Changes']),
  reviewNote: z.string().optional(),
})

router.patch(
  '/professionals/:id/verification',
  asyncHandler(async (req: AReq, res) => {
    const body = verificationSchema.parse(req.body)
    const professional = await Professional.findById(req.params.id)
    if (!professional) throw ApiError.notFound('Professional not found.')
    professional.verification.status = body.status === 'Request Changes' ? 'Rejected' : body.status
    professional.verification.reviewedBy = req.userId as unknown as typeof professional.verification.reviewedBy
    professional.verification.reviewedAt = new Date()
    professional.verification.reviewNote = body.reviewNote ?? ''
    await professional.save()
    if (professional.user) {
      await Notification.create({
        user: professional.user,
        type: 'professional',
        title: 'Application update',
        body: `Your application status is now: ${professional.verification.status}.`,
        link: '/professional/verification',
      })
    }
    await AuditLog.create({ actor: String(req.userId), action: `admin.verification.${body.status.toLowerCase().replace(' ', '-')}`, resource: 'Professional', resourceId: req.params.id })
    res.json(ok({ id: req.params.id, verification: professional.verification }, `Application ${body.status.toLowerCase()}.`))
  }),
)

router.get(
  '/safeguarding',
  asyncHandler(async (_req: AReq, res) => {
    const cases = await SafeguardingCase.find().sort({ createdAt: -1 }).limit(100).lean()
    res.json(
      ok({
        restricted: true,
        cases: cases.map((c) => ({ id: String(c._id), caseId: c.caseId, riskLevel: c.riskLevel, status: c.status, createdAt: c.createdAt, assignedReviewer: c.assignedReviewerName ?? '' })),
      }),
    )
  }),
)

const safeguardingSchema = z.object({ status: z.string(), assignedReviewerName: z.string().optional(), note: z.string().optional() })

router.patch(
  '/safeguarding/:id',
  asyncHandler(async (req: AReq, res) => {
    const body = safeguardingSchema.parse(req.body)
    const item = await SafeguardingCase.findById(req.params.id)
    if (!item) throw ApiError.notFound('Case not found.')
    item.status = body.status as typeof item.status
    if (body.assignedReviewerName !== undefined) item.assignedReviewerName = body.assignedReviewerName
    if (body.note) item.actions.push({ note: body.note, by: String(req.userId), at: new Date() })
    await item.save()
    await AuditLog.create({ actor: String(req.userId), action: `admin.safeguarding.${body.status.toLowerCase().replace(' ', '-')}`, resource: 'SafeguardingCase', resourceId: req.params.id })
    res.json(ok({ id: req.params.id, status: item.status }, 'Safeguarding case updated.'))
  }),
)

const resourceSchema = z.object({
  title: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must use lowercase letters, numbers and dashes.'),
  summary: z.string().optional(),
  body: z.string().optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  readingTimeMin: z.number().optional(),
  author: z.string().optional(),
  reviewer: z.string().optional(),
  reviewStatus: z.string().optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

router.get(
  '/resources',
  asyncHandler(async (req: AReq, res) => {
    const { q, page = '1', pageSize = '20' } = req.query as Record<string, string>
    const filter: Record<string, unknown> = {}
    if (q) filter.$or = [{ title: { $regex: q, $options: 'i' } }, { slug: { $regex: q, $options: 'i' } }]
    const pageNum = Math.max(1, Number(page) || 1)
    const size = Math.min(50, Math.max(1, Number(pageSize) || 20))
    const total = await Resource.countDocuments(filter)
    const items = await Resource.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * size).limit(size).lean()
    res.json(ok({ resources: items.map((r) => ({ ...r, id: String(r._id) })), total, page: pageNum, pageSize: size }))
  }),
)

router.post(
  '/resources',
  requireAdminOnly,
  asyncHandler(async (req: AReq, res) => {
    const body = resourceSchema.parse(req.body)
    const existing = await Resource.findOne({ slug: body.slug }).lean()
    if (existing) throw ApiError.conflict('A resource with this slug already exists.', 'SLUG_TAKEN')
    const resource = await Resource.create({ ...body, published: body.published ?? false, publishedAt: body.published ? new Date() : null })
    await AuditLog.create({ actor: String(req.userId), action: 'admin.resource.create', resource: 'Resource', resourceId: String(resource._id) })
    res.status(201).json(ok({ resource: { ...resource.toObject(), id: String(resource._id) } }, 'Resource created.'))
  }),
)

router.patch(
  '/resources/:id',
  requireAdminOnly,
  asyncHandler(async (req: AReq, res) => {
    const body = resourceSchema.partial().parse(req.body)
    const resource = await Resource.findById(req.params.id)
    if (!resource) throw ApiError.notFound('Resource not found.')
    Object.assign(resource, body)
    if (body.published !== undefined) {
      resource.published = body.published
      resource.publishedAt = body.published ? (resource.publishedAt ?? new Date()) : null
    }
    await resource.save()
    await AuditLog.create({ actor: String(req.userId), action: 'admin.resource.update', resource: 'Resource', resourceId: req.params.id })
    res.json(ok({ resource: { ...resource.toObject(), id: String(resource._id) } }, 'Resource updated.'))
  }),
)

router.delete(
  '/resources/:id',
  requireAdminOnly,
  asyncHandler(async (req: AReq, res) => {
    await Resource.deleteOne({ _id: req.params.id })
    await AuditLog.create({ actor: String(req.userId), action: 'admin.resource.delete', resource: 'Resource', resourceId: req.params.id })
    res.json(ok({ id: req.params.id }, 'Resource deleted.'))
  }),
)

router.get(
  '/community/reports',
  asyncHandler(async (_req: AReq, res) => {
    const posts = await CommunityPost.find({ reported: true, hidden: false }).sort({ updatedAt: -1 }).limit(100).lean()
    const groups = await CommunityGroup.find().lean()
    const groupMap = new Map(groups.map((g) => [String(g._id), g.name]))
    res.json(ok({ reports: posts.map((p) => ({ id: String(p._id), groupName: groupMap.get(String(p.group)) ?? 'Unknown', authorName: p.authorName, body: p.body.slice(0, 160), reason: p.reportReason, createdAt: p.createdAt })) }))
  }),
)

router.patch(
  '/community/posts/:id/moderate',
  asyncHandler(async (req: AReq, res) => {
    const body = z.object({ hidden: z.boolean().optional(), resolve: z.boolean().optional() }).parse(req.body)
    const post = await CommunityPost.findById(req.params.id)
    if (!post) throw ApiError.notFound('Post not found.')
    if (body.hidden !== undefined) {
      post.hidden = body.hidden
      post.moderated = true
    }
    if (body.resolve) {
      post.reported = false
      post.reportReason = ''
    }
    await post.save()
    await AuditLog.create({ actor: String(req.userId), action: 'admin.community.moderate', resource: 'CommunityPost', resourceId: req.params.id })
    res.json(ok({ id: req.params.id, hidden: post.hidden, reported: post.reported }, 'Post moderation updated.'))
  }),
)

router.get(
  '/analytics',
  requireAdminOnly,
  asyncHandler(async (req: AReq, res) => {
    const { from, to, groupBy = 'day' } = req.query as Record<string, string>
    const db = mongoose.connection
    const match: Record<string, unknown> = {}
    if (from) match.createdAt = { $gte: new Date(from) }
    if (to) match.createdAt = { ...(match.createdAt as Record<string, Date>), $lte: new Date(to) }
    const format = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d'

    const summary = await Promise.all([
      db.collection('users').aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray(),
      db.collection('appointments').aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray(),
      db.collection('checkins').aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray(),
    ])

    res.json(
      ok({
        users: summary[0].map((r) => ({ bucket: r._id as string, count: r.count as number })),
        appointments: summary[1].map((r) => ({ bucket: r._id as string, count: r.count as number })),
        checkIns: summary[2].map((r) => ({ bucket: r._id as string, count: r.count as number })),
      }),
    )
  }),
)

router.get(
  '/audit-logs',
  requireAdminOnly,
  asyncHandler(async (req: AReq, res) => {
    const { page = '1', pageSize = '30' } = req.query as Record<string, string>
    const pageNum = Math.max(1, Number(page) || 1)
    const size = Math.min(100, Math.max(1, Number(pageSize) || 30))
    const total = await AuditLog.countDocuments()
    const logs = await AuditLog.find().sort({ createdAt: -1 }).skip((pageNum - 1) * size).limit(size).lean()
    res.json(ok({ logs, total, page: pageNum, pageSize: size }))
  }),
)

export default router