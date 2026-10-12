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
