import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { CHECKIN_FACTORS, MOOD_LEVELS } from '../constants'

const checkInSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mood: { type: String, enum: MOOD_LEVELS, required: true },
    factors: { type: [String], enum: CHECKIN_FACTORS, default: [] },
    note: { type: String, default: '' },
  },
  { timestamps: true },
)

export type CheckInSchema = InferSchemaType<typeof checkInSchema>
export type CheckInDocument = HydratedDocument<CheckInSchema>

const CheckIn = model('CheckIn', checkInSchema)
export default CheckIn