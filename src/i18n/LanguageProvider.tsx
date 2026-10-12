import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dictionaries, englishDictionary, LANGUAGES, type Lang, type TranslationKey } from './translations'
import { setCurrentLocale } from './locale'

const STORAGE_KEY = 'nsangiza_lang'
const SUPPORTED = LANGUAGES.map((l) => l.code)

type TranslateParams = Record<string, string | number>

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey, params?: TranslateParams) => string
  /** dynamic lookup for runtime keys (e.g. API statuses); falls back to the key itself */
  tl: (key: string, params?: TranslateParams) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null
  if (stored && SUPPORTED.includes(stored)) return stored
  const browser = window.navigator.language?.slice(0, 2).toLowerCase() as Lang | undefined
  if (browser && SUPPORTED.includes(browser)) return browser
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    setCurrentLocale(lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage failures (private mode)
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) => {
      const template = dictionaries[lang][key] ?? englishDictionary[key] ?? key
      if (!params) return template
      return template.replace(/\{(\w+)\}/g, (match, token: string) =>
        params[token] !== undefined ? String(params[token]) : match,
      )
    },
    [lang],
  )

  const tl = useCallback(
    (key: string, params?: TranslateParams) => {
      const template = dictionaries[lang][key as TranslationKey] ?? englishDictionary[key as TranslationKey] ?? key
      if (!params) return template
      return template.replace(/\{(\w+)\}/g, (match, token: string) =>
        params[token] !== undefined ? String(params[token]) : match,
      )
    },
    [lang],
  )

  const value = useMemo<LanguageContextValue>(() => ({ lang, setLang, t, tl }), [lang, setLang, t, tl])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider')
  return ctx
}
