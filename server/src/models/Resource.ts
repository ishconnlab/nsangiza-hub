import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { LANGUAGES, RESOURCE_CATEGORIES, REVIEW_STATUS } from '../constants'

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    summary: { type: String, default: '' },
    body: { type: String, default: '' },
    category: { type: String, enum: RESOURCE_CATEGORIES, default: 'Mental wellbeing' },
    language: { type: String, enum: LANGUAGES, default: 'English' },
    readingTimeMin: { type: Number, default: 6 },
    author: { type: String, default: 'Nsangiza Hub Content Team' },
    reviewer: { type: String, default: '' },
    reviewStatus: { type: String, enum: REVIEW_STATUS, default: 'Draft' },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    featuredImage: { type: String, default: '/og-default.png' },
    tags: { type: [String], default: [] },
    relatedSlugs: { type: [String], default: [] },
  },
  { timestamps: true },
)

export type ResourceSchema = InferSchemaType<typeof resourceSchema>
export type ResourceDocument = HydratedDocument<ResourceSchema>

const Resource = model('Resource', resourceSchema)
export default Resource