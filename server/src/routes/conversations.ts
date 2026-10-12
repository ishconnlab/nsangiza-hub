import { Router } from 'express'
import { z } from 'zod'
import { ApiError, asyncHandler } from '../lib/errors'
import { ok } from '../lib/response'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import Conversation from '../models/Conversation'
import Message from '../models/Message'
import Professional from '../models/Professional'
import User from '../models/User'
import Notification from '../models/Notification'

const router = Router()
router.use(requireAuth)

async function accessibleConversation(id: string, userId: string) {
  const conversation = await Conversation.findById(id)
  if (!conversation) throw ApiError.notFound('Conversation not found.')
  if (!conversation.participants.some((p) => String(p) === userId)) throw ApiError.forbidden()
  return conversation
}

router.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const conversations = await Conversation.find({ participants: req.userId })
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .lean()

    const otherIds = new Set<string>()
    for (const c of conversations) {
      for (const p of c.participants) {
        const id = String(p)
        if (id !== req.userId) otherIds.add(id)
      }
    }
    const others = otherIds.size
      ? await User.find({ _id: { $in: [...otherIds] } }).select('displayName').lean()
      : []
    const nameById = new Map(others.map((u) => [String(u._id), u.displayName]))

    const enriched = conversations.map((c) => {
      const unreadRecord = (c.unread as unknown as Record<string, number> | null) ?? {}
      const unreadCount = Number(unreadRecord[String(req.userId)] ?? 0)
      const names = (c.participantNames as unknown as Record<string, string> | null) ?? {}
      const otherId = c.participants.map(String).find((id) => id !== req.userId)
      const stored = names[String(req.userId)]
      const storedIsName = Boolean(stored && stored !== 'Client' && stored !== 'Support')
      const otherName = (storedIsName ? stored : otherId ? nameById.get(otherId) : undefined) ?? 'Support'
      return {
        id: String(c._id),
        participantName: otherName,
        lastMessagePreview: c.lastMessagePreview ?? '',
        lastMessageAt: c.lastMessageAt,
        unreadCount,
        status: c.status,
        professionalId: c.professional ? String(c.professional) : undefined,
      }
    })

    res.json(ok({ conversations: enriched }))
  }),
)

const startSchema = z.object({
  professionalId: z.string().min(1),
})

router.post(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = startSchema.parse(req.body)
    const professional = await Professional.findById(body.professionalId).lean()
    if (!professional || !professional.user) throw ApiError.notFound('Professional not found.')

    const professionalUserId = String(professional.user)
    let conversation = await Conversation.findOne({
      professional: professional._id,
      participants: { $all: [req.userId, professionalUserId] },
    })

    if (!conversation) {
      const me = await User.findById(req.userId).lean()
      conversation = await Conversation.create({
        participants: [req.userId!, professionalUserId],
        professional: professional._id,
        user: req.userId!,
        participantNames: {
          [req.userId!]: professional.name,
          [professionalUserId]: me?.displayName ?? 'Client',
        },
        lastMessageAt: new Date(),
        lastMessagePreview: 'Support conversation started',
        unread: { [req.userId!.toString()]: 0, [professionalUserId.toString()]: 0 },
      })
    }

    res.status(201).json(ok({ conversation: { id: String(conversation._id) } }, 'Conversation ready.'))
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req: AuthedRequest, res) => {
    const conversation = await accessibleConversation(req.params.id, req.userId!)
    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 }).lean()
    res.json(ok({ conversation: { id: String(conversation._id), status: conversation.status }, messages }))
  }),
)

const sendSchema = z.object({
  body: z.string().max(2000).optional(),
  kind: z.enum(['text', 'emoji', 'audio', 'attachment', 'system']).optional(),
})

router.post(
  '/:id/messages',
  asyncHandler(async (req: AuthedRequest, res) => {
    const conversation = await accessibleConversation(req.params.id, req.userId!)
    if (conversation.status === 'blocked') throw ApiError.forbidden('This conversation is no longer open.')
    const body = sendSchema.parse(req.body)
    if (!body.body && !body.kind) throw ApiError.badRequest('Message cannot be empty.')

    const user = await User.findById(req.userId).lean()
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.userId,
      senderRole: user?.role ?? 'USER',
      body: body.body ?? '',
      kind: body.kind ?? 'text',
      status: 'sent',
    })

    conversation.lastMessageAt = new Date()
    conversation.lastMessagePreview = (body.body ?? `[${body.kind}]`).slice(0, 120)
    const otherId = conversation.participants.find((p) => String(p) !== req.userId)
    if (otherId) {
      conversation.unread.set(String(otherId), (conversation.unread.get(String(otherId)) ?? 0) + 1)
      await Notification.create({
        user: otherId,
        type: 'message',
        title: 'New secure message',
        // Keep clinical content out of the notification feed; open the
        // conversation to read it privately.
        body: 'You have a new message in your secure conversation.',
        link: user?.role === 'USER' ? '/professional/messages' : '/app/messages',
      })
    }
    await conversation.save()
    res.status(201).json(ok({ message }, 'Message sent.'))
  }),
)

router.patch(
  '/:id/read',
  asyncHandler(async (req: AuthedRequest, res) => {
    const conversation = await accessibleConversation(req.params.id, req.userId!)
    conversation.unread.set(String(req.userId), 0)
    await conversation.save()
    await Message.updateMany({ conversation: conversation._id, sender: { $ne: req.userId }, status: { $in: ['sent', 'delivered'] } }, { status: 'read' })
    res.json(ok({}, 'Conversation marked as read.'))
  }),
)

const reportSchema = z.object({ reason: z.string().min(1).max(300) })

router.post(
  '/:id/report',
  asyncHandler(async (req: AuthedRequest, res) => {
    const conversation = await accessibleConversation(req.params.id, req.userId!)
    const body = reportSchema.parse(req.body)
    conversation.status = 'reported'
    conversation.reportedBy = req.userId as unknown as typeof conversation.reportedBy
    conversation.reportReason = body.reason
    await conversation.save()
    res.json(ok({ id: conversation._id }, 'Conversation reported. A human reviewer will look into it.'))
  }),
)

export default router