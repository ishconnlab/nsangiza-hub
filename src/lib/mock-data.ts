export type SupportCategory =
  | 'Stress & overwhelm'
  | 'Relationship strain'
  | 'Sleep and energy'
  | 'Work or study pressure'
  | 'Trauma recovery'
  | 'Family or parenting stress'
  | 'Connection and loneliness'

export type SupportFormat = 'Video call' | 'Phone support' | 'Chat' | 'In-person'

export interface Provider {
  id: string
  name: string
  role: string
  city: string
  languages: string[]
  focus: SupportCategory[]
  experience: string
  availability: string
  rating: number
  reviewCount: number
  fee: string
  status: 'Available' | 'Booked' | 'New'
  isDemo: boolean
}

export interface Resource {
  id: string
  title: string
  category: string
  summary: string
  duration: string
  level: 'Beginner' | 'Practical' | 'Guided'
  tag: string
}

export const supportCategories: SupportCategory[] = [
  'Stress & overwhelm',
  'Relationship strain',
  'Sleep and energy',
  'Work or study pressure',
  'Trauma recovery',
  'Family or parenting stress',
  'Connection and loneliness',
]

export const cities = ['Kigali', 'Huye', 'Musanze', 'Rubavu', 'Muhanga', 'Rwamagana', 'Nyagatare', 'Rusizi', 'Karongi']

export const providers: Provider[] = [
  {
    id: 'provider-1',
    name: 'Aline Uwase',
    role: 'Counsellor',
    city: 'Kigali',
    languages: ['Kinyarwanda', 'English'],
    focus: ['Stress & overwhelm', 'Work or study pressure'],
    experience: '8 years supporting young adults and professionals',
    availability: 'Next opening today at 16:30',
    rating: 4.9,
    reviewCount: 132,
    fee: 'From 18,000 RWF',
    status: 'Available',
    isDemo: true,
  },
  {
    id: 'provider-2',
    name: 'Jean Baptiste Nkurunziza',
    role: 'Clinical Psychologist',
    city: 'Huye',
    languages: ['French', 'English'],
    focus: ['Trauma recovery', 'Family or parenting stress'],
    experience: '12 years in trauma-informed care and family support',
    availability: 'Available this week',
    rating: 5.0,
    reviewCount: 98,
    fee: 'From 25,000 RWF',
    status: 'New',
    isDemo: true,
  },
  {
    id: 'provider-3',
    name: 'Mireille Mukamana',
    role: 'Mental Health Support Provider',
    city: 'Musanze',
    languages: ['Kinyarwanda', 'English', 'French'],
    focus: ['Connection and loneliness', 'Relationship strain'],
    experience: 'Community support and group facilitation',
    availability: 'Next opening tomorrow morning',
    rating: 4.8,
    reviewCount: 76,
    fee: 'From 15,000 RWF',
    status: 'Available',
    isDemo: true,
  },
  {
    id: 'provider-4',
    name: 'Emmanuel Habimana',
    role: 'Wellbeing Coach',
    city: 'Rubavu',
    languages: ['Kinyarwanda', 'English'],
    focus: ['Sleep and energy', 'Stress & overwhelm'],
    experience: 'Practical wellbeing coaching for life transitions',
    availability: '2 openings this week',
    rating: 4.7,
    reviewCount: 64,
    fee: 'From 12,000 RWF',
    status: 'Available',
    isDemo: true,
  },
]

export const resources: Resource[] = [
  {
    id: 'res-1',
    title: 'Managing stress after a difficult week',
    category: 'Stress regulation',
    summary: 'Simple grounding techniques designed for busy days and emotional overload.',
    duration: '8 min read',
    level: 'Beginner',
    tag: 'Practical',
  },
  {
    id: 'res-2',
    title: 'Supporting a friend who seems withdrawn',
    category: 'Relationships',
    summary: 'Healthy, respectful ways to check in and offer support without pressure.',
    duration: '6 min read',
    level: 'Guided',
    tag: 'Care',
  },
  {
    id: 'res-3',
    title: 'Sleep routines for anxious thoughts',
    category: 'Sleep',
    summary: 'A gentle evening routine to help reduce racing thoughts before sleep.',
    duration: '10 min read',
    level: 'Practical',
    tag: 'Wellbeing',
  },
  {
    id: 'res-4',
    title: 'Recognising when a referral may help',
    category: 'Safety',
    summary: 'A brief guide to understanding when professional support or a referral is appropriate.',
    duration: '5 min read',
    level: 'Guided',
    tag: 'Responsible support',
  },
]

export const dashboardMessages = [
  {
    sender: 'Aline Uwase',
    preview: 'Thanks for sharing. We can talk about a calmer next step this week.',
    time: '12 mins ago',
  },
  {
    sender: 'Support team',
    preview: 'Your booking reminder is ready for Friday, 10:00.',
    time: 'Yesterday',
  },
]

export const consultationSchedule = [
  { title: 'Initial consultation', date: 'Fri, 10:00', mode: 'Video call' },
  { title: 'Follow-up check-in', date: 'Tue, 16:30', mode: 'Phone support' },
]

export const wellbeingMetrics = [
  { label: 'Check-ins this month', value: '4' },
  { label: 'Support goals', value: '2 active' },
  { label: 'Resource saves', value: '9' },
]
