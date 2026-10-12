import { Check, Globe } from 'lucide-react'
import { useI18n } from '../../i18n/LanguageProvider'
import { LANGUAGES } from '../../i18n/translations'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export function LanguageSwitcher({ className, block = false }: { className?: string; compact?: boolean; block?: boolean }) {
  const { lang, setLang, t } = useI18n()
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('nav.language')}
          className={
            className ??
            'focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-hub-muted transition-colors hover:bg-slate-50 hover:text-hub-primary'
          }
        >
          <Globe className="h-4 w-4 shrink-0" />
          <span className={block ? '' : 'hidden sm:inline'}>{current.native}</span>
          {!block && <span className="sm:hidden">{current.code.toUpperCase()}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        <DropdownMenuLabel>{t('nav.language')}</DropdownMenuLabel>
        {LANGUAGES.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onSelect={() => setLang(option.code)}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              {option.code === lang ? (
                <Check className="h-4 w-4 text-hub-primary" />
              ) : (
                <span className="h-4 w-4" aria-hidden />
              )}
              {option.native}
            </span>
            <span className="text-xs text-slate-400">{option.code.toUpperCase()}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
