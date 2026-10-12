export type Role = 'USER' | 'PROFESSIONAL' | 'MODERATOR' | 'SUPERVISOR' | 'ADMIN' | 'SUPER_ADMIN'

export type Language = 'Kinyarwanda' | 'English' | 'French'
export type CommunicationPreference = 'Secure chat' | 'Audio' | 'Video'

export interface ApiMeta {
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
  [key: string]: unknown
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message: string
  code?: string
  errors?: unknown[]
  meta?: ApiMeta
}

export interface Consent {
  accepted: boolean
  acceptedAt: string | null
  version: string
}

export interface OnboardingStatus {
  welcomeSeen?: boolean
  consentSeen?: boolean
  preferencesComplete?: boolean
  assessmentComplete?: boolean
  resultsSeen?: boolean
  step?: number
  profileComplete?: boolean
  availabilityComplete?: boolean
  submitted?: boolean
}

export interface NotificationSettings {
  appointmentReminders: boolean
  messages: boolean
  followUps: boolean
  community: boolean
  system: boolean
}

export interface PrivacySettings {
  reduceMotion: boolean
  simpleView: boolean
  allowAnalytics: boolean
  largeText?: boolean
  highContrast?: boolean
  dyslexiaFriendly?: boolean
  autoReadAloud?: boolean
  enableReadAloud?: boolean
}

export interface User {
  id: string
  email: string
  displayName: string
  role: Role
  language: Language
  preferredSupportLanguage: Language
  ageRange?: string
  city?: string
  communicationPreference?: CommunicationPreference
  consent: Consent
  onboarding: OnboardingStatus
  notificationSettings: NotificationSettings
  privacySettings: PrivacySettings
  professionalId?: string
}

export type AppointmentStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show'
export type SessionType = 'Secure chat' | 'Audio call' | 'Video call' | 'In-person'

export interface AvailabilitySlot {
  day: string
  start: string
  end: string
  enabled: boolean
}

export interface Qualification {
  title: string
  institution: string
  year?: number
  type?: string
}

export interface VerificationInfo {
  status: string
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewNote?: string
  documents?: string[]
}

export interface ProfessionalDocument {
  _id: string
  label: string
  status: 'pending' | 'verified' | 'rejected'
  fileName?: string
  uploadedAt?: string
}

export interface ProfessionalReview {
  author: string
  rating: number
  body: string
  createdAt: string
  anonymous?: boolean
}

export interface ConsultationModes {
  video: boolean
  audio: boolean
  chat: boolean
  inPerson: boolean
}

export interface Professional {
  id: string
  userId?: string
  name: string
  providerType: string
  title?: string
  about?: string
  city?: string
  location?: string
  languages: Language[]
  specializations: string[]
  supportAreas: string[]
  experienceYears?: number
  experience?: string
  qualifications: Qualification[]
  sessionTypes: SessionType[]
  pricePerSession?: number
  currency?: string
  availability: AvailabilitySlot[]
  availabilityLabel?: string
  consultationModes?: ConsultationModes
  documents?: ProfessionalDocument[]
  verification: VerificationInfo
  rating: number
  reviewCount: number
  reviews?: ProfessionalReview[]
  isDemo: boolean
  featured?: boolean
}

export interface MatchRecommendation {
  id: string
  name: string
  providerType: string
  city?: string
  languages: Language[]
  specializations: string[]
  experienceYears?: number
  rating: number
  pricePerSession?: number
  currency?: string
  sessionTypes: SessionType[]
  availabilityLabel?: string
  isDemo: boolean
  matchReason: string
  matchScore: number
}

export interface Appointment {
  _id: string
  user: string
  professional: string
  professionalName: string
  providerType?: string
  date: string
  endDate?: string
  durationMin: number
  type: SessionType
  status: AppointmentStatus
  notes?: string
  joinToken?: string
  cancelledBy?: 'user' | 'professional'
  createdAt?: string
}

export interface ConversationSummary {
  id: string
  participantName: string
  lastMessagePreview?: string
  lastMessageAt: string
  unreadCount: number
  status?: string
  professionalId?: string
}

export interface Message {
  _id: string
  conversation: string
  sender: string
  senderRole: Role
  body: string
  kind: 'text' | 'emoji' | 'audio' | 'attachment' | 'system'
  status?: string
  createdAt?: string
}

export interface CommunityGroup {
  id: string
  name: string
  slug: string
  description: string
  category: string
  memberCount: number
  moderated: boolean
  rules?: string[]
}

export interface CommunityPostComment {
  _id: string
  authorName?: string
  body?: string
  createdAt?: string
}

export type ReactionKind = 'supportive' | 'thoughtful' | 'grateful'

export interface ReactionSummary {
  supportive: number
  thoughtful: number
  grateful: number
  my: ReactionKind | null
}

export interface CommunityPost {
  id: string
  authorName?: string
  body: string
  reactions?: ReactionSummary
  commentCount?: number
  comments?: CommunityPostComment[]
  createdAt: string
  moderated?: boolean
  hidden?: boolean
}

export interface Resource {
  id: string
  title: string
  slug: string
  summary?: string
  body?: string
  category: string
  language?: string
  readingTimeMin?: number
  author?: string
  reviewStatus?: string
  published?: boolean
  publishedAt?: string
  featuredImage?: string
  tags?: string[]
  createdAt?: string
}

export interface ResourceDetail extends Resource {
  body?: string
  itent?: never
}

export interface AppNotification {
  id: string
  type: 'appointment' | 'message' | 'follow-up' | 'professional' | 'community' | 'system'
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: string
}

export interface FollowUp {
  id: string
  professionalName: string
  dueAt: string
  status: 'pending' | 'upcoming' | 'completed' | 'overdue'
  kind?: string
  notes?: string
}

export type MoodLevel = 'very-difficult' | 'difficult' | 'okay' | 'good' | 'very-good'

export interface CheckIn {
  _id: string
  user: string
  mood: MoodLevel
  factors: string[]
  note?: string
  createdAt: string
}

export interface WellbeingTrend {
  trend: { date: string; mood: MoodLevel }[]
  topFactors: { label: string; count: number }[]
  totalCheckIns: number
}

export interface ClientSummary {
  id: string
  displayName: string
  city: string
  language: string
  lastInteraction: string | null
  appointmentCount: number
  lastSession: string | null
}

export interface ProfessionalDashboard {
  stats: {
    todayAppointments: number
    pendingRequests: number
    unreadMessages: number
    upcomingCount: number
    sessionsThisWeek: number
    responseRate: number
    completedSessions: number
    pendingFollowUps: number
    profileCompleteness: number
  }
  upcomingSessions: Appointment[]
}

export interface AdminUserRow {
  id: string
  displayName: string
  email: string
  role: Role
  city?: string
  active: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface AdminProfessionalRow {
  id: string
  userId?: string
  name: string
  providerType: string
  city?: string
  languages: string[]
  specializations: string[]
  verification: VerificationInfo
  documents?: string[]
  isDemo?: boolean
  createdAt: string
}

export interface SafeguardingCase {
  id: string
  caseId: string
  riskLevel: 'low' | 'medium' | 'high' | 'urgent'
  status: 'New' | 'Under Review' | 'Escalated' | 'Resolved'
  createdAt: string
  assignedReviewer: string
}

export interface AdminDashboard {
  stats: {
    totalUsers: number
    activeUsers: number
    verifiedProfessionals: number
    pendingProfessionals: number
    appointmentsTotal: number
    sessionsCompleted: number
    reportedPosts: number
    safeguardingOpen: number
    resourcesPublished: number
    communityGroups: number
  }
  series: {
    userGrowth: { month: string; count: number }[]
    sessions: { month: string; count: number }[]
  }
  charts: {
    supportCategories: { label: string; value: number }[]
    providerActivity: { label: string; value: number }[]
    appointmentCompletion: { label: string; value: number }[]
  }
}

export interface EmergencyContacts {
  primary: { label: string; phone: string }
  medical: { label: string; phone: string }
  note?: string
}

export interface Paged<T> {
  items: T
  page: number
  pageSize: number
  total: number
}

export function isRoleAllowed(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role)
}