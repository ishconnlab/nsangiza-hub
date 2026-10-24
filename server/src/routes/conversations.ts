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
import Appointment from '../models/Appointment'

const router = Router()
router.use(requireAuth)

async function accessibleConversation(id: string, userId: string) {
  const conversation = await Conversation.findById(id)
  if (!conversation) throw ApiError.notFound('Conversation not found.')
  if (!conversation.participants.some((p) => String(p) === userId)) throw ApiError.forbidden()
  if (conversation.participants.length !== 2 || !conversation.user || !conversation.professional) {
    throw ApiError.forbidden('This conversation is not a private user?professional thread.')
  }
  const professional = await Professional.findById(conversation.professional).select('user').lean()
  const clientId = String(conversation.user)
  const professionalUserId = professional?.user ? String(professional.user) : ''
  const ids = conversation.participants.map(String)
  if (!professionalUserId || clientId === professionalUserId || !ids.includes(clientId) || !ids.includes(professionalUserId) || ids.includes(userId) === false) {
    throw ApiError.forbidden('This conversation does not match its assigned participants.')
  }
  const appointment = await Appointment.exists({
    user: conversation.user,
    professional: conversation.professional,
    status: { $in: ['requested', 'confirmed', 'rescheduled', 'completed'] },
  })
  if (!appointment) throw ApiError.forbidden('An appointment is required to access this conversation.')
  return conversation
}

async function openDirectConversation(clientId: string, clientName: string, professional: { _id: unknown; user?: unknown; name: string }) {
  if (!professional.user) throw ApiError.notFound('Professional not found.')
  const professionalUserId = String(professional.user)
  let conversation = await Conversation.findOne({
    professional: professional._id,
    user: clientId,
    participants: { $all: [clientId, professionalUserId], $size: 2 },
  })
  if (conversation?.status === 'blocked') throw ApiError.forbidden('This conversation is no longer open.')
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [clientId, professionalUserId],
      professional: professional._id,
      user: clientId,
      participantNames: { [clientId]: professional.name, [professionalUserId]: clientName },
      lastMessageAt: new Date(),
      lastMessagePreview: 'Support conversation started',
      unread: { [clientId]: 0, [professionalUserId]: 0 },
    })
  }
  return conversation
}

router.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const actor = await User.findById(req.userId).select('role displayName').lean()
    if (!actor) throw ApiError.forbidden()
    const filter: Record<string, unknown> = { participants: req.userId, $expr: { $eq: [{ $size: '$participants' }, 2] } }
    if (actor.role === 'USER') filter.user = req.userId
    else if (actor.role === 'PROFESSIONAL') {
      const profile = await Professional.findOne({ user: req.userId }).select('_id').lean()
      if (!profile) throw ApiError.forbidden()
      filter.professional = profile._id
    } else throw ApiError.forbidden()
    const candidates = await Conversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .lean()
    const professionalIds = [...new Set(candidates.map((c) => String(c.professional)).filter(Boolean))]
    const professionalProfiles = professionalIds.length
      ? await Professional.find({ _id: { $in: professionalIds } }).select('user').lean()
      : []
    const ownerByProfile = new Map(professionalProfiles.map((p) => [String(p._id), p.user ? String(p.user) : '']))
    const eligibleAppointments = await Appointment.find({
      professional: actor.role === 'PROFESSIONAL' ? (await Professional.findOne({ user: req.userId }).select('_id').lean())?._id : undefined,
      user: actor.role === 'USER' ? req.userId : undefined,
      status: { $in: ['requested', 'confirmed', 'rescheduled', 'completed'] },
    }).select('user professional').lean()
    const eligiblePairs = new Set(eligibleAppointments.map((a) => `${String(a.user)}:${String(a.professional)}`))
    const conversations = candidates.filter((c) => {
      if (!c.user || !c.professional || c.participants.length !== 2) return false
      const clientId = String(c.user)
      const professionalUserId = ownerByProfile.get(String(c.professional))
      const participants = c.participants.map(String)
      return Boolean(professionalUserId && clientId !== professionalUserId && participants.includes(clientId) && participants.includes(professionalUserId) && eligiblePairs.has(`${clientId}:${String(c.professional)}`))
    })

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
    const me = await User.findById(req.userId).lean()
    if (me?.role !== 'USER') throw ApiError.forbidden('Only clients can start a support conversation.')
    const professional = await Professional.findById(body.professionalId).lean()
    if (!professional || !professional.user || professional.active === false || professional.verification.status !== 'Approved') {
      throw ApiError.notFound('Professional not found.')
    }
    const appointment = await Appointment.exists({
      user: me._id, professional: professional._id,
      status: { $in: ['requested', 'confirmed', 'rescheduled', 'completed'] },
    })
    if (!appointment) throw ApiError.forbidden('Request an appointment before messaging this professional.')
    const conversation = await openDirectConversation(String(me._id), me.displayName ?? 'Client', professional)
    res.status(201).json(ok({ conversation: { id: String(conversation._id) } }, 'Conversation ready.'))
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req: AuthedRequest, res) => {
    const conversation = await accessibleConversation(req.params.id, req.userId!)
    const messages = await Message.find({ conversation: conversation._id })
      .select('conversation sender senderRole body kind status createdAt updatedAt attachment.name attachment.mimeType attachment.size')
      .sort({ createdAt: 1 }).lean()
    const confirmedCalls = await Appointment.find({
      user: conversation.user,
      professional: conversation.professional,
      status: 'confirmed',
      type: { $in: ['Audio call', 'Video call'] },
    }).sort({ date: 1 }).select('_id type date endDate durationMin').lean()
    const now = Date.now()
    const callAppointment = confirmedCalls.find((appointment) => {
      const start = new Date(appointment.date).getTime()
      const end = appointment.endDate
        ? new Date(appointment.endDate).getTime()
        : start + (appointment.durationMin ?? 45) * 60_000
      return now <= end + 15 * 60_000
    })
    res.json(ok({
      conversation: {
        id: String(conversation._id),
        status: conversation.status,
        callAppointmentId: callAppointment ? String(callAppointment._id) : undefined,
        callType: callAppointment?.type,
      },
      messages,
    }))
  }),
)

router.post(
  '/session/:appointmentId',
  asyncHandler(async (req: AuthedRequest, res) => {
    const appointment = await Appointment.findById(req.params.appointmentId).lean()
    if (!appointment) throw ApiError.notFound('Appointment not found.')
    if (appointment.status !== 'confirmed') throw ApiError.badRequest('Only confirmed sessions can be started.')
    const start = new Date(appointment.date).getTime()
    const end = appointment.endDate ? new Date(appointment.endDate).getTime() : start + (appointment.durationMin ?? 45) * 60_000
    const now = Date.now()
    if (now > end + 15 * 60_000) throw ApiError.badRequest('This session has ended.')

    const profile = await Professional.findById(appointment.professional).lean()
    if (!profile?.user) throw ApiError.notFound('The assigned professional is unavailable.')
    const clientId = String(appointment.user)
    const professionalUserId = String(profile.user)
    if (req.userId !== clientId && req.userId !== professionalUserId) throw ApiError.forbidden()
    const client = await User.findById(clientId).select('displayName role').lean()
    if (client?.role !== 'USER') throw ApiError.forbidden('This appointment is not assigned to a client account.')
    const conversation = await openDirectConversation(clientId, client.displayName ?? 'Client', profile)
    const roomName = ['Video call', 'Audio call'].includes(appointment.type)
      ? `nsangiza-${appointment.joinToken || String(appointment._id)}`
      : undefined
    res.json(ok({ conversation: { id: String(conversation._id) }, roomName, callType: roomName ? appointment.type : undefined }, 'Session ready.'))
  }),
)

router.get(
  '/:id/messages/:messageId/attachment',
  asyncHandler(async (req: AuthedRequest, res) => {
    const conversation = await accessibleConversation(req.params.id, req.userId!)
    const message = await Message.findOne({ _id: req.params.messageId, conversation: conversation._id })
      .select('attachment.name attachment.mimeType attachment.dataUrl attachment.size').lean()
    if (!message?.attachment?.dataUrl) throw ApiError.notFound('Attachment not found.')
    res.json(ok({ attachment: message.attachment }))
  }),
)

const sendSchema = z.object({
  body: z.string().max(2000).optional(),
  kind: z.enum(['text', 'emoji', 'audio', 'attachment', 'system']).optional(),
  attachment: z.object({
    name: z.string().trim().min(1).max(160),
    mimeType: z.enum([
      'image/jpeg', 'image/png', 'image/webp', 'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', 'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg',
    ]),
    dataUrl: z.string().max(7_000_000),
    size: z.number().int().positive().max(5 * 1024 * 1024),
  }).optional(),
})

router.post(
  '/:id/messages',
  asyncHandler(async (req: AuthedRequest, res) => {
    const conversation = await accessibleConversation(req.params.id, req.userId!)
    if (conversation.status === 'blocked') throw ApiError.forbidden('This conversation is no longer open.')
    const body = sendSchema.parse(req.body)
    if (!body.body && !body.attachment && !body.kind) throw ApiError.badRequest('Message cannot be empty.')
    if (['audio', 'attachment'].includes(body.kind ?? '') && !body.attachment) throw ApiError.badRequest('Add a file to this message and try again.')
    if (body.attachment && !['audio', 'attachment'].includes(body.kind ?? '')) throw ApiError.badRequest('This file type is not valid for the selected message.')
    if (body.attachment) {
      const encoded = body.attachment.dataUrl.match(/^data:([^;,]+);base64,([A-Za-z0-9+/]+=*)$/)
      if (!encoded || encoded[1] !== body.attachment.mimeType) throw ApiError.badRequest('This file could not be read. Choose a supported file and try again.')
      const bytes = Buffer.from(encoded[2], 'base64')
      if (bytes.byteLength !== body.attachment.size || bytes.byteLength > 5 * 1024 * 1024) {
        throw ApiError.badRequest('Files must be 5 MB or smaller.')
      }
      if (body.kind === 'audio' && !body.attachment.mimeType.startsWith('audio/')) throw ApiError.badRequest('Voice messages must be audio files.')
      if (body.kind === 'attachment' && body.attachment.mimeType.startsWith('audio/')) throw ApiError.badRequest('Choose an image or document for this attachment.')
    }

    const user = await User.findById(req.userId).lean()
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.userId,
      senderRole: user?.role ?? 'USER',
      body: body.body ?? '',
      kind: body.kind ?? 'text',
      attachment: body.attachment,
      status: 'sent',
    })

    const otherId = conversation.participants.find((p) => String(p) !== req.userId)

    // Use atomic operators: mutating the `unread` Map on a hydrated document
    // throws "Mongoose maps do not support keys that start with '$'".
    await Conversation.updateOne(
      { _id: conversation._id },
      {
        $set: {
          lastMessageAt: new Date(),
          lastMessagePreview: (body.body ?? `[${body.kind}]`).slice(0, 120),
        },
      },
    )
    if (otherId) {
      await Conversation.updateOne(
        { _id: conversation._id },
        { $inc: { [`unread.${String(otherId)}`]: 1 } },
      )
      await Notification.create({
        user: otherId,
        type: 'message',
        title: 'New secure message',
        // Keep clinical content out of the notification feed; open the
        // conversation to read it privately.
        body: 'You have a new message in your secure conversation.',
        link: user?.role === 'USER' ? `/professional/messages/${conversation._id}` : `/app/messages/${conversation._id}`,
      })
    }
    const messageResponse = message.toObject()
    const attachmentMetadata = messageResponse.attachment
      ? {
          name: messageResponse.attachment.name,
          mimeType: messageResponse.attachment.mimeType,
          size: messageResponse.attachment.size,
        }
      : undefined
    res.status(201).json(ok({ message: { ...messageResponse, attachment: attachmentMetadata } }, 'Message sent.'))
  }),
)

router.patch(
  '/:id/read',
  asyncHandler(async (req: AuthedRequest, res) => {
    const conversation = await accessibleConversation(req.params.id, req.userId!)
    await Conversation.updateOne(
      { _id: conversation._id },
      { $set: { [`unread.${String(req.userId)}`]: 0 } },
    )
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
