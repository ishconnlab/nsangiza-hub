import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'

const conversationSchema = new Schema(
  {
    participants: { type: [Schema.Types.ObjectId], ref: 'User', required: true, index: true },
    professional: { type: Schema.Types.ObjectId, ref: 'Professional', default: null },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    participantNames: { type: Map, of: String, default: {} },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: '' },
    unread: { type: Map, of: Number, default: {} },
    status: { type: String, enum: ['active', 'reported', 'blocked'], default: 'active' },
    reportedBy: { type: Schema.Types.ObjectId, default: null },
    reportReason: { type: String, default: '' },
  },
  { timestamps: true },
)

export type ConversationSchema = InferSchemaType<typeof conversationSchema>
export type ConversationDocument = HydratedDocument<ConversationSchema>

const Conversation = model('Conversation', conversationSchema)
export default Conversation