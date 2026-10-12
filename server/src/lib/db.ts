import mongoose from 'mongoose'
import { env } from '../config/env'

export async function connectDb(): Promise<void> {
  mongoose.set('strictQuery', true)
  await mongoose.connect(env.mongodbUri)
  console.log(`[db] connected to MongoDB at ${env.mongodbUri}`)
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect()
}