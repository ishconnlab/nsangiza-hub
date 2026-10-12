import app from './app'
import { connectDb, disconnectDb } from './lib/db'
import { env } from './config/env'

const server = app.listen(env.port, () => {
  console.log(`[server] NSANGIZA HUB API listening on http://localhost:${env.port}`)
  console.log(`[server] environment: ${env.nodeEnv}`)
})

void connectDb().catch((err) => {
  console.error('[db] failed to connect to MongoDB:', err instanceof Error ? err.message : err)
  process.exitCode = 1
})

async function shutdown(signal: string): Promise<void> {
  console.log(`[server] ${signal} received — shutting down`)
  server.close(async () => {
    await disconnectDb()
    process.exit(0)
  })
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))