export const ROLES = {
  USER: 'USER',
  PROFESSIONAL: 'PROFESSIONAL',
  MODERATOR: 'MODERATOR',
  SUPERVISOR: 'SUPERVISOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const PROFESSIONAL_STATUS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
  EXPIRED: 'Expired',
} as const

export const PROFESSIONAL_TYPES = [
  'Clinical Psychologist',
  'Counsellor',
  'Psychosocial Support Provider',
  'Mental Health Support Provider',
  'Wellbeing Coach',
  'Peer Support Worker',
  'Social Worker',
  'Psychiatric Nurse',
] as const

export const SUPPORT_CATEGORIES = [
  'Stress',
  'Anxiety',
  'Low mood',
  'Loneliness',
  'Relationships',
  'Family concerns',
  'Academic pressure',
  'Work & burnout',
  'Grief & loss',
  'Trauma support',
  'Self-esteem',
  'Social challenges',
  'Sleep & wellbeing',
  'General wellbeing',
] as const

export const RESOURCE_CATEGORIES = [
  'Mental wellbeing',
  'Stress',
  'Anxiety',
  'Relationships',
  'Students',
  'Work & burnout',
  'Sleep',
  'Self-care',
  'Grief',
  'Family',
  'Youth wellbeing',
] as const

export const CITIES = [
  'Kigali',
  'Huye',
  'Musanze',
  'Rubavu',
  'Muhanga',
  'Rwamagana',
  'Nyagatare',
  'Rusizi',
  'Karongi',
] as const

export const LANGUAGES = ['Kinyarwanda', 'English', 'French'] as const

export const COMMUNICATION_PREFERENCES = ['Secure chat', 'Audio', 'Video'] as const

export const APPOINTMENT_STATUS = [
  'requested',
  'confirmed',
  'completed',
  'cancelled',
  'rescheduled',
  'no-show',
] as const

export const SESSION_TYPES = ['Secure chat', 'Audio call', 'Video call'] as const

export const MOOD_LEVELS = ['very-difficult', 'difficult', 'okay', 'good', 'very-good'] as const

export const CHECKIN_FACTORS = [
  'Stress',
  'Work',
  'School',
  'Family',
  'Relationships',
  'Sleep',
  'Money',
  'Loneliness',
  'Other',
] as const

export const NOTIFICATION_TYPES = [
  'appointment',
  'message',
  'follow-up',
  'professional',
  'community',
  'system',
] as const

export const FOLLOWUP_STATUS = ['pending', 'upcoming', 'completed', 'overdue'] as const

export const RISK_LEVELS = ['low', 'medium', 'high', 'urgent'] as const

export const SAFEGUARDING_STATUS = ['New', 'Under Review', 'Escalated', 'Resolved'] as const

export const REVIEW_STATUS = ['Draft', 'In Review', 'Reviewed', 'Published'] as const

export const EMERGENCY_CONTACTS_DEFAULT = {
  primary: {
    label: 'Rwanda National Police Emergency',
    // Replace with clinically and legally verified Rwanda contacts before production.
    phone: '112',
  },
  medical: {
    label: 'Rwanda Ambulance Service',
    phone: '912',
  },
  note: 'If you are in immediate danger, contact emergency services or a trusted person now.',
} as const