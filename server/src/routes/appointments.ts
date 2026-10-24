import { Router } from 'express'
import { z } from 'zod'
import { APPOINTMENT_STATUS } from '../constants'
import { ApiError, asyncHandler } from '../lib/errors'
import { ok } from '../lib/response'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import Appointment, { type AppointmentDocument } from '../models/Appointment'
import Professional from '../models/Professional'
import Notification from '../models/Notification'
import User from '../models/User'
import { randomBytes } from 'node:crypto'
const router = Router()
router.use(requireAuth)
const TERMINAL = ['completed', 'cancelled', 'no-show']
interface Access {
  appointment: AppointmentDocument
  actor: 'user' | 'professional'
}
async function assertAccess(appointmentId: string, req: AuthedRequest): Promise<Access> {
  const appointment = await Appointment.findById(appointmentId)
  if (!appointment) throw ApiError.notFound('Appointment not found.')
  if (String(appointment.user) === req.userId) {
    return { appointment, actor: 'user' }
  }
  const user = await User.findById(req.userId).lean()
  if (user?.role === 'PROFESSIONAL') {
    const profile = await Professional.findOne({ user: req.userId }).lean()
    if (profile && String(appointment.professional) === String(profile._id)) {
      return { appointment, actor: 'professional' }
    }
  }
  throw ApiError.forbidden()
}
/** who may move an appointment to a given status */
function assertTransition(current: string, next: string, actor: 'user' | 'professional', appointment?: AppointmentDocument) {
  if (TERMINAL.includes(current)) {
    throw ApiError.badRequest('This session is already closed and cannot be changed.')
  }
  if (current === next) return
  const userAllowed = ['cancelled', 'rescheduled']
  const proAllowed = ['confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled']
  const allowed = actor === 'professional' ? proAllowed : userAllowed
  if (!allowed.includes(next)) {
    throw ApiError.forbidden(
      actor === 'user'
        ? 'Only your professional can confirm, complete or mark this session.'
        : 'That status change is not allowed.',
    )
  }
  if (next === 'confirmed' && !['requested', 'rescheduled'].includes(current)) {
    throw ApiError.badRequest('Only a requested session can be confirmed.')
  }
  if (next === 'confirmed' && appointment && Date.now() >= new Date(appointment.date).getTime()) {
    throw ApiError.badRequest('A session cannot be confirmed after its scheduled start time.')
  }
  if (next === 'completed' && current !== 'confirmed') {
    throw ApiError.badRequest('Only a confirmed session can be marked completed.')
  }
  if (next === 'no-show' && current !== 'confirmed') {
    throw ApiError.badRequest('Only a confirmed session can be marked as a no-show.')
  }
  if (next === 'completed' && appointment && Date.now() < new Date(appointment.date).getTime()) {
    throw ApiError.badRequest('A session cannot be completed before its scheduled start time.')
  }
  if (next === 'no-show' && appointment) {
    const end = appointment.endDate ? new Date(appointment.endDate).getTime() : new Date(appointment.date).getTime() + (appointment.durationMin ?? 45) * 60_000
    if (Date.now() < end + 15 * 60_000) throw ApiError.badRequest('Mark a session as no-show 15 minutes after its scheduled end.')
  }
  if (next === 'cancelled' && actor === 'user' && appointment && Date.now() >= new Date(appointment.date).getTime()) {
    throw ApiError.badRequest('A session cannot be cancelled after its scheduled start time.')
  }
}
async function findConflict(professionalId: string, start: Date, end: Date, excludeId?: string) {
  const windowStart = new Date(start.getTime() - 180 * 60_000)
  const candidates = await Appointment.find({
    professional: professionalId,
    status: { $nin: ['cancelled'] },
    date: { $lt: end, $gt: windowStart },
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })
    .select('date endDate durationMin')
    .lean()
  return candidates.find((c) => {
    const cStart = new Date(c.date).getTime()
    const cEnd = (c.endDate ? new Date(c.endDate) : new Date(cStart + (c.durationMin ?? 45) * 60_000)).getTime()
    return cStart < end.getTime() && cEnd > start.getTime()
  })
}
type AvailabilitySlot = { day?: string | null; start?: string; end?: string; enabled?: boolean }
function assertWithinAvailability(professional: { availability?: readonly AvailabilitySlot[] | null }, date: Date, durationMin: number) {
  const slots = (professional.availability ?? []).filter((s) => s.enabled && s.day && s.start && s.end)
  if (slots.length === 0) return
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Africa/Kigali' }).format(date)
  const [h, m] = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Kigali' })
    .format(date)
    .split(':')
    .map(Number)
  const minutes = (h % 24) * 60 + (m ?? 0)
  const daySlots = slots.filter((s) => s.day === day)
  if (daySlots.length === 0) {
    throw ApiError.badRequest(`The professional is not available on ${day}. Choose another day.`)
  }
  const within = daySlots.some((s) => {
    const [sh, sm] = s.start!.split(':').map(Number)
    const [eh, em] = s.end!.split(':').map(Number)
    return minutes >= sh * 60 + sm && minutes + durationMin <= eh * 60 + em
  })
  if (!within) {
    throw ApiError.badRequest('That time is outside the professional\'s available hours. Pick a listed slot.')
  }
}
const createSchema = z.object({
  professionalId: z.string().min(1),
  date: z.string().min(1, 'Please choose a date and time.'),
  durationMin: z.number().int().min(15).max(180).optional(),
  type: z.enum(['Secure chat', 'Audio call', 'Video call', 'In-person']).optional(),
  notes: z.string().max(500).optional(),
})
router.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { status, page = '1', pageSize = '50' } = req.query as Record<string, string>
    const user = await User.findById(req.userId).lean()
    const filter: Record<string, unknown> = {}
    if (user?.role === 'PROFESSIONAL') {
      const professional = await Professional.findOne({ user: req.userId }).lean()
      if (!professional) throw ApiError.notFound('Professional profile not found.')
      filter.professional = String(professional._id)
    } else {
      filter.user = req.userId
    }
    if (status) filter.status = status
    const pageNum = Math.max(1, Number(page) || 1)
    const size = Math.min(50, Math.max(1, Number(pageSize) || 50))
    const total = await Appointment.countDocuments(filter)
    const items = await Appointment.find(filter).sort({ date: -1 }).skip((pageNum - 1) * size).limit(size).lean()
    const professionalIds = [...new Set(items.map((appointment) => String(appointment.professional)))]
    const professionals = professionalIds.length
      ? await Professional.find({ _id: { $in: professionalIds } }).select('sessionTypes').lean()
      : []
    const typesByProfessional = new Map(professionals.map((professional) => [
      String(professional._id), professional.sessionTypes?.length ? professional.sessionTypes : ['Video call'],
    ]))
    const enrichedAppointments = items.map((appointment) => ({
      ...appointment,
      availableSessionTypes: [...new Set([
        ...(typesByProfessional.get(String(appointment.professional)) ?? ['Video call']),
        appointment.type,
      ])],
    }))
    res.json(ok({ appointments: enrichedAppointments, total, page: pageNum, pageSize: size }))
  }),
)
router.post(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = createSchema.parse(req.body)
    const professional = await Professional.findById(body.professionalId).lean()
    if (!professional || professional.verification.status !== 'Approved' || professional.active === false) {
      throw ApiError.notFound('Professional not found.')
    }
    const date = new Date(body.date)
    if (Number.isNaN(date.getTime())) throw ApiError.badRequest('Please choose a valid date and time.')
    if (date.getTime() < Date.now() + 5 * 60_000) {
      throw ApiError.badRequest('Please choose a time at least a few minutes from now.')
    }
    const durationMin = body.durationMin ?? 45
    const endDate = new Date(date.getTime() + durationMin * 60_000)
    assertWithinAvailability(professional, date, durationMin)
    const conflict = await findConflict(String(professional._id), date, endDate)
    if (conflict) throw ApiError.badRequest('That time is already taken. Please pick another slot.')
    const appointment = await Appointment.create({
      user: req.userId,
      professional: professional._id,
      professionalName: professional.name,
      providerType: professional.providerType,
      date,
      endDate,
      durationMin,
      type: body.type ?? 'Video call',
      status: 'requested',
      notes: body.notes ?? '',
      joinToken: randomBytes(24).toString('hex'),
    })
    const profUser = professional.user ? String(professional.user) : undefined
    if (profUser) {
      await Notification.create({
        user: profUser,
        type: 'appointment',
        title: 'New appointment request',
        body: `A user has requested a ${appointment.type} session.`,
        link: '/professional/appointments',
      })
    }
    await Notification.create({
      user: req.userId,
      type: 'appointment',
      title: 'Appointment requested',
      body: `Your session with ${professional.name} has been requested and awaits confirmation.`,
      link: '/app/appointments',
    })
    res.status(201).json(ok({ appointment }, 'Appointment requested.'))
  }),
)
router.get(
  '/upcoming',
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.userId).lean()
    const filter: Record<string, unknown> = { date: { $gte: new Date() }, status: { $in: ['requested', 'confirmed', 'rescheduled'] } }
    if (user?.role === 'PROFESSIONAL') {
      const professional = await Professional.findOne({ user: req.userId }).lean()
      if (!professional) throw ApiError.notFound('Professional profile not found.')
      filter.professional = String(professional._id)
    } else {
      filter.user = req.userId
    }
    const items = await Appointment.find(filter).sort({ date: 1 }).limit(10).lean()
    res.json(ok({ appointments: items }))
  }),
)
router.get(
  '/:id',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { appointment } = await assertAccess(req.params.id, req)
    res.json(ok({ appointment }))
  }),
)
router.patch(
  '/:id',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = z
      .object({
        status: z.enum(APPOINTMENT_STATUS).optional(),
        date: z.string().optional(),
        type: z.enum(['Secure chat', 'Audio call', 'Video call', 'In-person']).optional(),
        notes: z.string().optional(),
      })
      .parse(req.body)
    const { appointment, actor } = await assertAccess(req.params.id, req)
    if (TERMINAL.includes(appointment.status)) {
      throw ApiError.badRequest('This session is already closed and cannot be changed.')
    }
    if (body.status) {
      assertTransition(appointment.status, body.status, actor, appointment)
      appointment.status = body.status
      if (body.status === 'cancelled') {
        appointment.cancelledBy = actor
      }
    }
    if (body.date) {
      if (Date.now() >= new Date(appointment.date).getTime()) throw ApiError.badRequest('A session cannot be rescheduled after its scheduled start time.')
      const date = new Date(body.date)
      if (Number.isNaN(date.getTime())) throw ApiError.badRequest('Please choose a valid date and time.')
      if (date.getTime() < Date.now() + 5 * 60_000) {
        throw ApiError.badRequest('Please choose a time at least a few minutes from now.')
      }
      const professional = await Professional.findById(appointment.professional).select('availability sessionTypes').lean()
      if (!professional) throw ApiError.notFound('Professional not found.')
      assertWithinAvailability(professional, date, appointment.durationMin)
      const supportedTypes = professional.sessionTypes?.length ? professional.sessionTypes : ['Video call']
      const nextType = body.type ?? appointment.type
      if (body.type !== undefined && body.type !== appointment.type && !supportedTypes.includes(body.type)) {
        throw ApiError.badRequest('This professional does not offer that session type.')
      }
      const endDate = new Date(date.getTime() + appointment.durationMin * 60_000)
      const conflict = await findConflict(String(appointment.professional), date, endDate, String(appointment._id))
      if (conflict) throw ApiError.badRequest('That time is already taken. Please pick another slot.')
      appointment.date = date
      appointment.endDate = endDate
      appointment.type = nextType
      if (appointment.status !== 'cancelled') appointment.status = 'rescheduled'
    }
    if (body.type !== undefined && body.date === undefined) {
      const professional = await Professional.findById(appointment.professional).select('sessionTypes').lean()
      const supportedTypes = professional?.sessionTypes?.length ? professional.sessionTypes : ['Video call']
      if (body.type !== appointment.type && !supportedTypes.includes(body.type)) throw ApiError.badRequest('This professional does not offer that session type.')
      appointment.type = body.type
      if (appointment.status !== 'cancelled') appointment.status = 'rescheduled'
    }
    if (body.notes !== undefined) appointment.notes = body.notes
    await appointment.save()
    if (body.date !== undefined || body.type !== undefined) {
      if (actor === 'user') {
        const professional = await Professional.findById(appointment.professional).select('user').lean()
        if (professional?.user) await Notification.create({
          user: professional.user,
          type: 'appointment',
          title: 'Session change requested',
          body: `A client requested a new time or session type (${appointment.type}). Please review the change.`,
          link: '/professional/appointments',
        })
      } else {
        await Notification.create({
          user: appointment.user,
          type: 'appointment',
          title: 'Session updated',
          body: `Your session with ${appointment.professionalName} was updated to ${appointment.type}.`,
          link: '/app/appointments',
        })
      }
    }
    res.json(ok({ appointment }, 'Appointment updated.'))
  }),
)
router.patch(
  '/:id/status',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = z.object({ status: z.enum(['confirmed', 'completed', 'cancelled', 'no-show']) }).parse(req.body)
    const { appointment, actor } = await assertAccess(req.params.id, req)
    const previousStatus = appointment.status
    assertTransition(appointment.status, body.status, actor, appointment)
    appointment.status = body.status
    if (body.status === 'cancelled') appointment.cancelledBy = actor
    await appointment.save()
    const wasDeclined = body.status === 'cancelled' && actor === 'professional' && ['requested', 'rescheduled'].includes(previousStatus)
    const notificationTitle = wasDeclined
      ? 'Appointment declined'
      : body.status === 'completed' ? 'Session completed' : 'Appointment update'
    const notificationBody = wasDeclined
      ? `Your appointment request with ${appointment.professionalName} was declined.`
      : body.status === 'completed'
        ? `Your session with ${appointment.professionalName} was marked complete.`
        : `Your appointment with ${appointment.professionalName} is now ${body.status}.`
    await Notification.create({
      user: appointment.user,
      type: 'appointment',
      title: notificationTitle,
      body: notificationBody,
      link: '/app/appointments',
    })
    if (actor === 'user' && body.status === 'cancelled') {
      const profile = await Professional.findById(appointment.professional).lean()
      if (profile?.user) {
        await Notification.create({
          user: String(profile.user),
          type: 'appointment',
          title: 'Appointment cancelled',
          body: 'A user has cancelled their session with you.',
          link: '/professional/appointments',
        })
      }
    }
    res.json(ok({ appointment }, 'Appointment updated.'))
  }),
)
router.delete(
  '/:id',
  asyncHandler(async (req: AuthedRequest, res) => {
    const { appointment, actor } = await assertAccess(req.params.id, req)
    if (TERMINAL.includes(appointment.status)) {
      throw ApiError.badRequest('This session is already closed and cannot be changed.')
    }
    if (Date.now() >= new Date(appointment.date).getTime()) {
      throw ApiError.badRequest('A session cannot be cancelled after its scheduled start time.')
    }
    appointment.status = 'cancelled'
    appointment.cancelledBy = actor
    await appointment.save()
    await Notification.create({
      user: appointment.user,
      type: 'appointment',
      title: 'Appointment cancelled',
      body: `Your appointment with ${appointment.professionalName} has been cancelled.`,
      link: '/app/appointments',
    })
    if (actor === 'user') {
      const profile = await Professional.findById(appointment.professional).lean()
      if (profile?.user) {
        await Notification.create({
          user: String(profile.user),
          type: 'appointment',
          title: 'Appointment cancelled',
          body: 'A user has cancelled their session with you.',
          link: '/professional/appointments',
        })
      }
    }
    res.json(ok({ id: req.params.id }, 'Appointment cancelled.'))
  }),
)
export default router
