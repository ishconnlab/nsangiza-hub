import { Router } from 'express'
import { ok } from '../lib/response'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/errors'
import Notification from '../models/Notification'

const router = Router()
router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { type, page = '1', pageSize = '30' } = req.query as Record<string, string>
    const filter: Record<string, unknown> = { user: req.userId }
    if (type) filter.type = type

    const pageNum = Math.max(1, Number(page) || 1)
    const size = Math.min(50, Math.max(1, Number(pageSize) || 30))
    const items = await Notification.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * size).limit(size).lean()
    const unread = await Notification.countDocuments({ user: req.userId, read: false })

    res.json(
      ok({
        notifications: items.map((n) => ({ id: String(n._id), type: n.type, title: n.title, body: n.body, link: n.link, read: n.read, createdAt: n.createdAt })),
        unreadCount: unread,
      }),
    )
  }),
)

router.patch(
  '/:id/read',
  asyncHandler(async (req: AuthedRequest, res) => {
    await Notification.updateOne({ _id: req.params.id, user: req.userId }, { read: true, readAt: new Date() })
    res.json(ok({}, 'Notification marked as read.'))
  }),
)

router.patch(
  '/read-all',
  asyncHandler(async (req: AuthedRequest, res) => {
    await Notification.updateMany({ user: req.userId, read: false }, { read: true, readAt: new Date() })
    res.json(ok({}, 'All notifications marked as read.'))
  }),
)

router.delete(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    await Notification.deleteMany({ user: req.userId })
    res.json(ok({}, 'Notifications cleared.'))
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req: AuthedRequest, res) => {
    await Notification.deleteOne({ _id: req.params.id, user: req.userId })
    res.json(ok({}, 'Notification dismissed.'))
  }),
)

export default router