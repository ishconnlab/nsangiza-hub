import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { NOTIFICATION_TYPES } from '../constants'

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type NotificationSchema = InferSchemaType<typeof notificationSchema>
export type NotificationDocument = HydratedDocument<NotificationSchema>

const Notification = model('Notification', notificationSchema)
export default Notification