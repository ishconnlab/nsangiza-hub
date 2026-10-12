import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { APPOINTMENT_STATUS } from '../constants'

const appointmentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    professional: { type: Schema.Types.ObjectId, ref: 'Professional', required: true, index: true },
    professionalName: { type: String, default: '' },
    providerType: { type: String, default: '' },
    date: { type: Date, required: true },
    endDate: { type: Date, default: null },
    durationMin: { type: Number, default: 45 },
    type: { type: String, enum: ['Secure chat', 'Audio call', 'Video call', 'In-person'], default: 'Video call' },
    status: { type: String, enum: APPOINTMENT_STATUS, default: 'requested' },
    notes: { type: String, default: '' },
    joinToken: { type: String, default: '' },
    cancelledBy: { type: String, default: '' },
  },
  { timestamps: true },
)

export type AppointmentSchema = InferSchemaType<typeof appointmentSchema>
export type AppointmentDocument = HydratedDocument<AppointmentSchema>

const Appointment = model('Appointment', appointmentSchema)
export default Appointment