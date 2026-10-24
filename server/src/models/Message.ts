import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'

const messageAttachmentSchema = new Schema(
  {
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    dataUrl: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false },
)

const messageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, default: 'USER' },
    body: { type: String, default: '' },
    kind: { type: String, enum: ['text', 'emoji', 'audio', 'attachment', 'system'], default: 'text' },
    attachment: { type: messageAttachmentSchema, default: undefined },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  },
  { timestamps: true },
)

export type MessageSchema = InferSchemaType<typeof messageSchema>
export type MessageDocument = HydratedDocument<MessageSchema>

const Message = model('Message', messageSchema)
export default Message
