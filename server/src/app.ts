import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import { env } from './config/env'
import { ok } from './lib/response'
import { securityHeaders } from './middleware/security'
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

const allowedOrigins = env.clientOrigin
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(securityHeaders)
app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server requests (no Origin header).
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      // Unknown origins get no CORS headers rather than a hard error.
      return callback(null, false)
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'))
}

// Health check used by Render (and any uptime monitor). Reports DB connectivity
// so a deploy that cannot reach MongoDB is marked unhealthy.
const health = (_req: express.Request, res: express.Response): void => {
  const dbUp = mongoose.connection.readyState === 1
  res.status(dbUp ? 200 : 503).json(
    ok({
      status: dbUp ? 'ok' : 'degraded',
      service: 'nsangiza-hub-api',
      database: dbUp ? 'up' : 'down',
      time: new Date().toISOString(),
    }),
  )
}
app.get('/health', health)
app.get('/api/v1/health', health)

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