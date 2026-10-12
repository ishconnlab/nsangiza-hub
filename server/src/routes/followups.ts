import { Router } from 'express'
import { z } from 'zod'
import { ok } from '../lib/response'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import { ApiError, asyncHandler } from '../lib/errors'
import FollowUp from '../models/FollowUp'

const router = Router()
router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await FollowUp.find({ user: req.userId }).sort({ dueAt: 1 }).lean()
    res.json(
      ok({
        followUps: items.map((f) => ({
          id: String(f._id),
          professionalName: f.professionalName,
          dueAt: f.dueAt,
          status: f.status,
          kind: f.kind,
          notes: f.notes,
        })),
      }),
    )
  }),
)

const completeSchema = z.object({ notes: z.string().optional() })

router.patch(
  '/:id/complete',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = completeSchema.parse(req.body)
    const followUp = await FollowUp.findOne({ _id: req.params.id, user: req.userId })
    if (!followUp) throw ApiError.notFound('Follow-up not found.')
    followUp.status = 'completed'
    followUp.completedAt = new Date()
    if (body.notes !== undefined) followUp.notes = body.notes
    await followUp.save()
    res.json(ok({ followUp }, 'Follow-up completed.'))
  }),
)

export default router