import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { CITIES, LANGUAGES, PROFESSIONAL_STATUS, PROFESSIONAL_TYPES, SUPPORT_CATEGORIES } from '../constants'

const credentialSchema = new Schema(
  {
    title: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number },
    type: { type: String, default: 'qualification' },
  },
  { _id: true },
)

const availabilitySchema = new Schema(
  {
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
    enabled: { type: Boolean, default: true },
  },
  { _id: true },
)

const professionalSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    providerType: { type: String, enum: PROFESSIONAL_TYPES, required: true },
    title: { type: String, default: '' },
    about: { type: String, default: '' },
    city: { type: String, enum: CITIES, default: 'Kigali' },
    location: { type: String, default: '' },
    languages: { type: [String], enum: LANGUAGES, default: ['English', 'Kinyarwanda'] },
    specializations: { type: [String], enum: SUPPORT_CATEGORIES, default: [] },
    supportAreas: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0 },
    experience: { type: String, default: '' },
    qualifications: { type: [credentialSchema], default: [] },
    credentials: { type: [credentialSchema], default: [] },
    documents: {
      type: [
        {
          label: { type: String, default: '' },
          status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
          fileName: { type: String, default: '' },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    sessionTypes: { type: [String], enum: ['Secure chat', 'Audio call', 'Video call', 'In-person'], default: ['Video call'] },
    pricePerSession: { type: Number, default: 18000 },
    currency: { type: String, default: 'RWF' },
    availability: { type: [availabilitySchema], default: [] },
    availabilityLabel: { type: String, default: '' },
    consultationModes: {
      video: { type: Boolean, default: true },
      audio: { type: Boolean, default: true },
      chat: { type: Boolean, default: true },
      inPerson: { type: Boolean, default: false },
    },
    verification: {
      type: {
        status: { type: String, enum: Object.values(PROFESSIONAL_STATUS), default: 'Draft' },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        reviewedAt: { type: Date, default: null },
        reviewNote: { type: String, default: '' },
        documents: { type: [String], default: [] },
      },
      default: () => ({ status: 'Draft', documents: [] }),
    },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 0 },
    reviews: {
      type: [
        {
          author: { type: String, default: '' },
          rating: { type: Number, default: 5 },
          body: { type: String, default: '' },
          createdAt: { type: Date, default: Date.now },
          anonymous: { type: Boolean, default: true },
        },
      ],
      default: [],
    },
    isDemo: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    onboarding: {
      type: {
        step: { type: Number, default: 1 },
        profileComplete: { type: Boolean, default: false },
        availabilityComplete: { type: Boolean, default: false },
        submitted: { type: Boolean, default: false },
      },
      default: () => ({ step: 1 }),
    },
  },
  { timestamps: true },
)

export type ProfessionalSchema = InferSchemaType<typeof professionalSchema>
export type ProfessionalDocument = HydratedDocument<ProfessionalSchema>

const Professional = model('Professional', professionalSchema)
export default Professional