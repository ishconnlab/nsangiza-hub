import type { Lang } from './translations'

export const LOCALES: Record<Lang, string> = {
  en: 'en-GB',
  rw: 'rw-RW',
  fr: 'fr-FR',
}

let currentLocale: string = LOCALES.en

export function setCurrentLocale(lang: Lang): void {
  currentLocale = LOCALES[lang] ?? LOCALES.en
}

export function getCurrentLocale(): string {
  return currentLocale
}
