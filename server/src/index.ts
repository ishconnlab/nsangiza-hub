import app from './app'
import { connectDb, disconnectDb } from './lib/db'
import { env } from './config/env'

async function start(): Promise<void> {
  // Connect to MongoDB before accepting traffic so a bad MONGODB_URI fails the
  // deploy (and the Render health check) instead of serving broken requests.
  try {
    await connectDb()
  } catch (err) {
    console.error(
      '[server] failed to connect to MongoDB:',
      err instanceof Error ? err.message : err,
    )
    process.exit(1)
  }

  const server = app.listen(env.port, () => {
    console.log(`[server] Nsangiza Hub API listening on port ${env.port} (${env.nodeEnv})`)
  })

  const shutdown = (signal: NodeJS.Signals): void => {
    console.log(`[server] ${signal} received - shutting down gracefully`)
    server.close(() => {
      void disconnectDb().finally(() => process.exit(0))
    })
    // Force-exit if connections do not drain in time.
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

void start()
