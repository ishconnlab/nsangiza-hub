import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'

const communityGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    members: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    memberCount: { type: Number, default: 0 },
    moderated: { type: Boolean, default: true },
    rules: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export type CommunityGroupSchema = InferSchemaType<typeof communityGroupSchema>
export type CommunityGroupDocument = HydratedDocument<CommunityGroupSchema>

const CommunityGroup = model('CommunityGroup', communityGroupSchema)
export default CommunityGroup