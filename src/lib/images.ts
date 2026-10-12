const BASE = '/images'

export const PROVIDER_PHOTOS: string[] = [
  `${BASE}/pro-1.jpg`,
  `${BASE}/pro-2.jpg`,
  `${BASE}/pro-3.jpg`,
  `${BASE}/pro-4.jpg`,
  `${BASE}/pro-5.jpg`,
  `${BASE}/pro-6.jpg`,
  `${BASE}/pro-7.jpg`,
  `${BASE}/pro-8.jpg`,
  `${BASE}/pro-9.jpg`,
  `${BASE}/pro-10.jpg`,
  `${BASE}/pro-11.jpg`,
  `${BASE}/pro-12.jpg`,
]

export const COVERS: Record<string, string> = {
  calm: `${BASE}/cover-calm.jpg`,
  forest: `${BASE}/cover-forest.jpg`,
  nature: `${BASE}/cover-nature.jpg`,
  community: `${BASE}/cover-community.jpg`,
  plant: `${BASE}/cover-plant.jpg`,
  tea: `${BASE}/cover-tea.jpg`,
  windmill: `${BASE}/cover-windmill.jpg`,
  sustainability: `${BASE}/cover-sustainability.jpg`,
  meditate: `${BASE}/cover-meditate.jpg`,
  yoga: `${BASE}/cover-yoga.jpg`,
}

const COVER_LIST = Object.values(COVERS)

function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export function providerPhoto(seed: string): string {
  return PROVIDER_PHOTOS[hash(seed || 'nsangiza') % PROVIDER_PHOTOS.length]
}

export function coverPhoto(seed: string): string {
  return COVER_LIST[hash(seed || 'nsangiza') % COVER_LIST.length]
}

export const RESOURCE_IMAGES: Record<string, string> = {
  stress: `${BASE}/resources/stress.jpg`,
  relationships: `${BASE}/resources/relationships.jpg`,
  sleep: `${BASE}/resources/sleep.jpg`,
  wellbeing: `${BASE}/resources/wellbeing.jpg`,
  grief: `${BASE}/resources/grief.jpg`,
  students: `${BASE}/resources/students.jpg`,
  work: `${BASE}/resources/work.jpg`,
  anxiety: `${BASE}/resources/anxiety.jpg`,
  mindfulness: `${BASE}/resources/mindfulness.jpg`,
  money: `${BASE}/resources/money.jpg`,
  community: `${BASE}/resources/community.jpg`,
  studying: `${BASE}/resources/studying.jpg`,
  morning: `${BASE}/resources/morning.jpg`,
  nature: `${BASE}/resources/nature.jpg`,
  conversation: `${BASE}/resources/conversation.jpg`,
  technology: `${BASE}/resources/technology.jpg`,
  tea: `${BASE}/resources/tea.jpg`,
  growth: `${BASE}/resources/growth.jpg`,
  counselling: `${BASE}/resources/counselling.jpg`,
  candle: `${BASE}/resources/candle.jpg`,
  exam: `${BASE}/resources/exam.jpg`,
}

const CATEGORY_IMAGE: Record<string, string> = {
  Stress: 'stress',
  Sleep: 'sleep',
  Grief: 'grief',
  Students: 'students',
  'Work & burnout': 'work',
  Relationships: 'relationships',
  Family: 'conversation',
  Anxiety: 'anxiety',
}

const RESOURCE_KEYWORDS: [RegExp, string][] = [
  [/sleep|insomnia|night|bedroom|roommate/, 'sleep'],
  [/grief|loss\b|bereave|mourn/, 'grief'],
  [/exam|study|studying|school|student|academic/, 'students'],
  [/money|financ|budget|debt/, 'money'],
  [/relationship|partner|marriage|dating|couple/, 'relationships'],
  [/friend|disclos|listen/, 'conversation'],
  [/family|parent|teen|child|caregiv|sibling/, 'conversation'],
  [/burnout|workplace|career|\bjob\b|\bwork\b/, 'work'],
  [/morning|routine|day\b/, 'morning'],
  [/panic|anxi|stress|overwhelm|tension/, 'anxiety'],
  [/counsel|therapy|session|professional|referral|support/, 'counselling'],
  [/mindful|meditat|yoga|breath|calm/, 'mindfulness'],
  [/lonely|loneli|community|connect|moderat|belong/, 'community'],
  [/digital|phone|online|screen|privacy|data|internet/, 'technology'],
  [/recover|wellbeing|well-being|self-esteem|confidence|emotion|\bfeel|resili|esteem|body|gently/, 'wellbeing'],
  [/nature|forest|garden|plant|outdoor|walk|sea|wave/, 'nature'],
]

const GENERAL_POOL = ['wellbeing', 'nature', 'mindfulness', 'morning', 'growth', 'tea', 'community', 'counselling']

export interface ResourceImageInput {
  slug?: string
  id?: string
  category?: string
  title?: string
  tags?: string[]
  featuredImage?: string
}

export function resourcePhoto(resource: ResourceImageInput): string {
  const explicit = resource.featuredImage
  if (explicit && explicit !== '/og-default.png') return explicit

  const seed = resource.slug || resource.id || 'nsangiza'
  const text = `${seed} ${resource.title ?? ''} ${(resource.tags ?? []).join(' ')}`.toLowerCase()
  for (const [pattern, key] of RESOURCE_KEYWORDS) {
    if (pattern.test(text)) return RESOURCE_IMAGES[key]
  }
  const category = CATEGORY_IMAGE[resource.category ?? '']
  if (category) return RESOURCE_IMAGES[category]
  return RESOURCE_IMAGES[GENERAL_POOL[hash(seed) % GENERAL_POOL.length]]
}
