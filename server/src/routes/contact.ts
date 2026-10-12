import { Router } from 'express'
import { EMERGENCY_CONTACTS_DEFAULT } from '../constants'
import { ok } from '../lib/response'
import { asyncHandler } from '../lib/errors'

const router = Router()

router.get(
  '/contacts',
  asyncHandler(async (_req, res) => {
    // Replace demo emergency contacts with clinically and legally verified Rwanda contacts before production.
    res.json(ok(EMERGENCY_CONTACTS_DEFAULT, 'Emergency contacts (demo placeholder)'))
  }),
)

export default router