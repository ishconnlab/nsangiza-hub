export const CITIES = ['Kigali', 'Huye', 'Musanze', 'Rubavu', 'Muhanga', 'Rwamagana', 'Nyagatare', 'Rusizi', 'Karongi'] as const

export const LANGUAGES = ['Kinyarwanda', 'English', 'French'] as const

export const COMMUNICATION_PREFERENCES = ['Secure chat', 'Audio', 'Video'] as const

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

export const MOOD_LABELS: Record<string, { label: string; color: string }> = {
  'very-difficult': { label: 'Very difficult', color: 'bg-hub-danger' },
  difficult: { label: 'Difficult', color: 'bg-hub-warning' },
  okay: { label: 'Okay', color: 'bg-sky-500' },
  good: { label: 'Good', color: 'bg-hub-secondary' },
  'very-good': { label: 'Very good', color: 'bg-hub-primary' },
}

export const CHECKIN_FACTORS = ['Stress', 'Work', 'School', 'Family', 'Relationships', 'Sleep', 'Money', 'Loneliness', 'Other'] as const

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const