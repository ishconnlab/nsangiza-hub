import { Suspense, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ArrowRight, Menu, MessageCircleQuestion, ShieldCheck, UserPlus } from 'lucide-react'
import Brand from '../components/Brand'
import { Loading } from '../components/PageHeader'
import { LanguageSwitcher } from '../components/nav/LanguageSwitcher'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet'
import { useAuth } from '../hooks/auth-context'
import { useI18n } from '../i18n/LanguageProvider'
import { dashboardPathFor } from '../router/guards'

const NAV_LINKS: { to: string; key: 'nav.findSupport' | 'nav.howItWorks' | 'nav.resources' | 'nav.safety' | 'nav.forProfessionals' }[] = [
  { to: '/professionals', key: 'nav.findSupport' },
  { to: '/how-it-works', key: 'nav.howItWorks' },
  { to: '/resources', key: 'nav.resources' },
  { to: '/safety', key: 'nav.safety' },
  { to: '/join', key: 'nav.forProfessionals' },
]

export default function PublicLayout() {
  const { isAuthenticated, user, onboardingComplete } = useAuth()
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const dashboardPath = user?.role === 'USER' && !onboardingComplete ? '/onboarding' : dashboardPathFor(user?.role)

  return (
    <div className="flex min-h-screen flex-col bg-hub-background">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="container-hub flex h-16 items-center justify-between gap-4">
          <Brand to="/" />
          <nav className="hidden items-center gap-6 text-sm font-medium text-hub-muted md:flex" aria-label="Main">
            {NAV_LINKS.map((item) => (
              <Link key={item.to} to={item.to} className="transition-colors hover:text-hub-primary">
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="focus-ring hidden h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-hub-muted transition-colors hover:bg-slate-50 hover:text-hub-primary md:inline-flex" />
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="hidden h-10 items-center gap-1.5 rounded-full bg-hub-primary px-4 text-sm font-medium text-white transition-colors hover:bg-hub-primary-dark sm:inline-flex"
              >
                {t('nav.dashboard')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden h-10 items-center rounded-full px-4 text-sm font-medium text-hub-primary hover:bg-hub-primary-light lg:inline-flex"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden h-10 items-center gap-1.5 rounded-full bg-hub-primary px-4 text-sm font-medium text-white transition-colors hover:bg-hub-primary-dark sm:inline-flex"
                >
                  <UserPlus className="h-4 w-4" />
                  {t('nav.getStarted')}
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full text-hub-muted transition-colors hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('nav.menu')}</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-hub-text transition-colors hover:bg-hub-primary-light/60"
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
            <div className="my-4 h-px bg-slate-200" />
            <LanguageSwitcher
              block
              className="focus-ring flex h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-hub-muted"
            />
            <div className="mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to={dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-hub-primary px-4 text-sm font-medium text-white"
                >
                  {t('nav.dashboard')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-hub-primary px-4 text-sm font-medium text-white"
                  >
                    <UserPlus className="h-4 w-4" />
                    {t('nav.getStarted')}
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-medium text-hub-primary"
                  >
                    {t('nav.login')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <Suspense fallback={<Loading label="Loading…" />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container-hub py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Brand to="/" />
              <p className="mt-3 max-w-sm text-sm text-hub-muted">{t('footer.tagline')}</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-hub-muted">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-hub-primary" />
                  {t('footer.private')}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-hub-text">{t('footer.explore')}</p>
              <ul className="mt-3 space-y-2 text-sm text-hub-muted">
                <li><Link to="/professionals" className="hover:text-hub-primary">{t('footer.findSupport')}</Link></li>
                <li><Link to="/how-it-works" className="hover:text-hub-primary">{t('footer.howItWorks')}</Link></li>
                <li><Link to="/resources" className="hover:text-hub-primary">{t('footer.wellbeing')}</Link></li>
                <li><Link to="/help/emergency" className="hover:text-hub-primary">{t('footer.emergency')}</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-hub-text">{t('footer.company')}</p>
              <ul className="mt-3 space-y-2 text-sm text-hub-muted">
                <li><Link to="/join" className="hover:text-hub-primary">{t('footer.forProfessionals')}</Link></li>
                <li><Link to="/safety" className="hover:text-hub-primary">{t('footer.safety')}</Link></li>
                <li><Link to="/privacy" className="hover:text-hub-primary">{t('footer.privacy')}</Link></li>
                <li><Link to="/terms" className="hover:text-hub-primary">{t('footer.terms')}</Link></li>
                <li>
                  <Link to="/help/contact" className="inline-flex items-center gap-1 hover:text-hub-primary">
                    <MessageCircleQuestion className="h-4 w-4" />
                    {t('footer.contact')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-100 pt-5 text-xs text-slate-400">
            © {new Date().getFullYear()} {t('footer.crisis')}
          </div>
        </div>
      </footer>
    </div>
  )
}
