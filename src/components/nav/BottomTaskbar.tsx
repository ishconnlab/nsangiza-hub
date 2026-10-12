import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import { barNav, sheetNav } from './navConfig'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { MoreSheetList } from './MoreSheetList'
import { useI18n } from '../../i18n/LanguageProvider'

export function BottomTaskbar({ role }: { role?: string | null }) {
  const { t } = useI18n()
  const items = barNav(role)
  const secondary = sheetNav(role)
  const { pathname } = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)

  const moreActive = secondary.some((i) => pathname === i.to || pathname.startsWith(i.to + '/'))
  const columns = items.length + 1

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      >
        <div
          className="mx-3 mb-[max(env(safe-area-inset-bottom),0.75rem)] grid overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-[0_8px_32px_rgba(23,33,27,0.14)] backdrop-blur-xl"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-[52px] flex-col items-center justify-center gap-1 px-1 pb-1.5 pt-2 text-[10px] font-semibold transition-colors active:scale-95',
                  isActive ? 'text-hub-primary' : 'text-hub-muted',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-2 top-0.5 h-8 rounded-full bg-hub-primary-light transition-all duration-300 ease-out',
                      isActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
                    )}
                  />
                  <item.icon
                    key={isActive ? 'on' : 'off'}
                    className={cn('relative h-5 w-5', isActive && 'anim-pop')}
                  />
                  <span className="relative leading-none">{t(item.shortKey ?? item.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className={cn(
              'relative flex min-h-[52px] flex-col items-center justify-center gap-1 px-1 pb-1.5 pt-2 text-[10px] font-semibold transition-colors active:scale-95',
              moreActive ? 'text-hub-primary' : 'text-hub-muted',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-x-2 top-0.5 h-8 rounded-full bg-hub-primary-light transition-all duration-300 ease-out',
                moreActive ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
              )}
            />
            <MoreHorizontal className={cn('relative h-5 w-5', moreActive && 'anim-pop')} />
            <span className="relative leading-none">{t('common.more')}</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('common.more')}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            <MoreSheetList items={secondary} onNavigate={() => setMoreOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
