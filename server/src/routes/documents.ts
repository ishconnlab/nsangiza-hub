import { Router } from 'express'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { ApiError, asyncHandler } from '../lib/errors'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import Professional from '../models/Professional'

const router = Router()

const STAFF_ROLES = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPERVISOR']

router.get(
  '/:name',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const raw = req.params.name ?? ''
    const name = path.basename(decodeURIComponent(raw))
    // Reject traversal and any path-like input; a stored name is a flat file
    // such as "<userId>-<timestamp>-<label>.<ext>".
    if (!name || name !== raw || !/^[A-Za-z0-9._-]+$/.test(name) || name.includes('..')) {
      throw ApiError.badRequest('Invalid document identifier.')
    }
    const requested = path.join('uploads', 'documents', name)

    let owns = false
    if (STAFF_ROLES.includes(req.role ?? '')) {
      owns = true
    } else if (req.role === 'PROFESSIONAL') {
      const professional = await Professional.findOne({ user: req.userId }).lean()
      const listed = professional?.documents?.some((d) => d.fileName === name)
      const referenced = professional?.verification?.documents?.includes(`uploads/documents/${name}`)
      owns = Boolean(listed || referenced)
    }

    if (!owns) throw ApiError.forbidden()

    const absolute = path.join(process.cwd(), requested)
    try {
      await fs.access(absolute)
    } catch {
      throw ApiError.notFound('Document not found.')
    }
    res.sendFile(absolute)
  }),
)

export default router