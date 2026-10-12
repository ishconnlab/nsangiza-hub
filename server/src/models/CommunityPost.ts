import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'

const communityPostSchema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: 'CommunityGroup', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, default: '' },
    body: { type: String, required: true },
    reactions: {
      supportive: { type: Number, default: 0 },
      thoughtful: { type: Number, default: 0 },
      grateful: { type: Number, default: 0 },
    },
    reactedBy: {
      supportive: { type: [Schema.Types.ObjectId], default: [] },
      thoughtful: { type: [Schema.Types.ObjectId], default: [] },
      grateful: { type: [Schema.Types.ObjectId], default: [] },
    },
    commentCount: { type: Number, default: 0 },
    comments: {
      type: [
        {
          authorName: { type: String, default: '' },
          body: { type: String, default: '' },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    reported: { type: Boolean, default: false },
    reportReason: { type: String, default: '' },
    moderated: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export type CommunityPostSchema = InferSchemaType<typeof communityPostSchema>
export type CommunityPostDocument = HydratedDocument<CommunityPostSchema>

const CommunityPost = model('CommunityPost', communityPostSchema)
export default CommunityPost