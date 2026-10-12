import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { FOLLOWUP_STATUS } from '../constants'

const followUpSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    professional: { type: Schema.Types.ObjectId, ref: 'Professional', default: null },
    professionalName: { type: String, default: '' },
    dueAt: { type: Date, required: true },
    status: { type: String, enum: FOLLOWUP_STATUS, default: 'pending' },
    kind: { type: String, default: 'check-in' },
    notes: { type: String, default: '' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type FollowUpSchema = InferSchemaType<typeof followUpSchema>
export type FollowUpDocument = HydratedDocument<FollowUpSchema>

const FollowUp = model('FollowUp', followUpSchema)
export default FollowUp