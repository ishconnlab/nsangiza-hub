import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { env } from './config/env'
import { ok } from './lib/response'
import { errorHandler, notFoundHandler } from './middleware/error'

import authRouter from './routes/auth'
import usersRouter from './routes/users'
import professionalsRouter from './routes/professionals'
import matchingRouter from './routes/matching'
import appointmentsRouter from './routes/appointments'
import conversationsRouter from './routes/conversations'
import resourcesRouter from './routes/resources'
import communityRouter from './routes/community'
import notificationsRouter from './routes/notifications'
import followupsRouter from './routes/followups'
import professionalRouter from './routes/professional'
import adminRouter from './routes/admin'
import contactRouter from './routes/contact'
import documentsRouter from './routes/documents'

const app = express()

app.set('trust proxy', 1)

app.use(
  cors({
    origin: env.clientOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'))
}

// Uploaded verification documents are never served anonymously. They are
// streamed only through the authenticated /api/v1/documents route.
app.get('/api/v1/health', (_req, res) => {
  res.json(ok({ status: 'ok', service: 'nsangiza-hub-api', time: new Date().toISOString() }))
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/professionals', professionalsRouter)
app.use('/api/v1/matching', matchingRouter)
app.use('/api/v1/appointments', appointmentsRouter)
app.use('/api/v1/conversations', conversationsRouter)
app.use('/api/v1/resources', resourcesRouter)
app.use('/api/v1/community', communityRouter)
app.use('/api/v1/notifications', notificationsRouter)
app.use('/api/v1/follow-ups', followupsRouter)
app.use('/api/v1/professional', professionalRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/documents', documentsRouter)
app.use('/api/v1/emergency', contactRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app