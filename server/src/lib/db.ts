import mongoose from 'mongoose'
import { env } from '../config/env'

const DEFAULT_DB_NAME = 'nsangiza_hub'

// Extract the database name from a connection string, if present.
// Handles both mongodb://user:pass@host,host2/db?opts and mongodb+srv://host/db?opts.
function databaseFromUri(uri: string): string | undefined {
  const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+)/)
  if (!match?.[1]) return undefined
  return decodeURIComponent(match[1])
}

// Never silently fall back to MongoDB's default `test` database: if the URI
// does not name one, use our own. MONGODB_DB_NAME overrides everything.
const DB_NAME =
  process.env.MONGODB_DB_NAME || databaseFromUri(env.mongodbUri) || DEFAULT_DB_NAME

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.mongodbUri, { dbName: DB_NAME })
  // Never log the URI itself (it contains credentials).
  console.log(`[db] connected to MongoDB database "${DB_NAME}"`)
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect()
}
