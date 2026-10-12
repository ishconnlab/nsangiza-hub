import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose'
import { COMMUNICATION_PREFERENCES, LANGUAGES, ROLES, type Role } from '../constants'

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER as Role },
    language: { type: String, enum: LANGUAGES, default: 'English' },
    preferredSupportLanguage: { type: String, enum: LANGUAGES, default: 'English' },
    ageRange: { type: String, default: '' },
    city: { type: String, default: '' },
    communicationPreference: {
      type: String,
      enum: COMMUNICATION_PREFERENCES,
      default: 'Secure chat',
    },
    consent: {
      type: {
        accepted: { type: Boolean, default: false },
        acceptedAt: { type: Date, default: null },
        version: { type: String, default: '2026.1' },
      },
      default: () => ({}),
    },
    onPreferences: {
      type: {
        communityPreference: { type: String, default: 'Mixed' },
        genderPreference: { type: String, default: 'No preference' },
        supportTopics: { type: [String], default: [] },
      },
      default: () => ({}),
    },
    onboarding: {
      type: {
        welcomeSeen: { type: Boolean, default: false },
        consentSeen: { type: Boolean, default: false },
        preferencesComplete: { type: Boolean, default: false },
        assessmentComplete: { type: Boolean, default: false },
        resultsSeen: { type: Boolean, default: false },
      },
      default: () => ({}),
    },
    notificationSettings: {
      type: {
        appointmentReminders: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        followUps: { type: Boolean, default: true },
        community: { type: Boolean, default: false },
        system: { type: Boolean, default: true },
      },
      default: () => ({}),
    },
    privacySettings: {
      type: {
        reduceMotion: { type: Boolean, default: false },
        simpleView: { type: Boolean, default: false },
        allowAnalytics: { type: Boolean, default: true },
      },
      default: () => ({}),
    },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type UserSchema = InferSchemaType<typeof userSchema>
export type UserDocument = HydratedDocument<UserSchema>

const User = model('User', userSchema)
export default User