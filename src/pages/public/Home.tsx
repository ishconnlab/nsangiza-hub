import { Link } from 'react-router-dom'
import { Lock, MessageCircle, Quote, ShieldCheck, Smile, Sparkles, Star, Users } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Card, CardContent } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { SafetyNotice } from '../../components/SafetyNotice'
import { ProviderCard } from '../../components/ProviderCard'
import { ResourceCard } from '../../components/ResourceCard'
import { initials } from '../../lib/format'
import { useI18n } from '../../i18n/LanguageProvider'
import type { TranslationKey } from '../../i18n/translations'
import { useFeaturedResources } from '../../services/resources'
import { useProfessionals } from '../../services/professionals'

const TRUST: { icon: typeof ShieldCheck; title: TranslationKey; body: TranslationKey }[] = [
  { icon: ShieldCheck, title: 'home.trust.pro.t', body: 'home.trust.pro.d' },
  { icon: Lock, title: 'home.trust.private.t', body: 'home.trust.private.d' },
  { icon: Users, title: 'home.trust.lang.t', body: 'home.trust.lang.d' },
  { icon: Sparkles, title: 'home.trust.mode.t', body: 'home.trust.mode.d' },
]

const STEPS: { icon: typeof ShieldCheck; title: TranslationKey; body: TranslationKey }[] = [
  { icon: Smile, title: 'home.step1.t', body: 'home.step1.d' },
  { icon: Users, title: 'home.step2.t', body: 'home.step2.d' },
  { icon: MessageCircle, title: 'home.step3.t', body: 'home.step3.d' },
  { icon: Sparkles, title: 'home.step4.t', body: 'home.step4.d' },
]

const SESSION_FEATURES: TranslationKey[] = [
  'home.sessions.f1',
  'home.sessions.f2',
  'home.sessions.f3',
  'home.sessions.f4',
]

const SESSION_TOPICS: TranslationKey[] = [
  'home.sessions.topic1',
  'home.sessions.topic2',
  'home.sessions.topic3',
  'home.sessions.topic4',
]

const CHECKIN_POINTS: TranslationKey[] = ['home.checkin.p1', 'home.checkin.p2', 'home.checkin.p3']

const MOODS: { label: TranslationKey; height: string }[] = [
  { label: 'home.checkin.m1', height: 'h-6' },
  { label: 'home.checkin.m2', height: 'h-9' },
  { label: 'home.checkin.m3', height: 'h-12' },
  { label: 'home.checkin.m4', height: 'h-16' },
  { label: 'home.checkin.m5', height: 'h-20' },
]

const COMMUNITY_POINTS: TranslationKey[] = [
  'home.community.p1',
  'home.community.p2',
  'home.community.p3',
]

const COMMUNITY_GROUPS: { name: TranslationKey; body: TranslationKey }[] = [
  { name: 'home.community.g1.t', body: 'home.community.g1.d' },
  { name: 'home.community.g2.t', body: 'home.community.g2.d' },
  { name: 'home.community.g3.t', body: 'home.community.g3.d' },
]

const FAQS: { q: TranslationKey; a: TranslationKey }[] = [
  { q: 'home.faq.q1', a: 'home.faq.a1' },
  { q: 'home.faq.q2', a: 'home.faq.a2' },
  { q: 'home.faq.q3', a: 'home.faq.a3' },
  { q: 'home.faq.q4', a: 'home.faq.a4' },
  { q: 'home.faq.q5', a: 'home.faq.a5' },
]

const HERO_FACTS: { term: TranslationKey; desc: TranslationKey }[] = [
  { term: 'home.fact.confidential.t', desc: 'home.fact.confidential.d' },
  { term: 'home.fact.verified.t', desc: 'home.fact.verified.d' },
  { term: 'home.fact.human.t', desc: 'home.fact.human.d' },
]

export default function Home() {
  const { t } = useI18n()
  const { data: featured, isLoading: loadingFeatured } = useFeaturedResources()
  const { data: providers, isLoading: loadingProviders } = useProfessionals({ pageSize: 3 })

  return (
    <div className="overflow-x-clip">
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-hub-primary-light/70 via-hub-background to-hub-background">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-hub-secondary/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-hub-accent/70 blur-3xl" />
        <div className="container-hub relative py-14 sm:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-2xl">
              <Badge variant="default" className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t('home.badge')}
              </Badge>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-hub-text sm:text-5xl lg:text-6xl">
                {t('home.title.before')}
                <span className="text-hub-primary"> {t('home.title.accent')}</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-hub-muted">{t('home.subtitle')}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/professionals">
                  <Button size="lg" className="inline-flex items-center gap-2">
                    {t('home.cta.find')}
                    <span aria-hidden>→</span>
                  </Button>
                </Link>
                <Link to="/resources">
                  <Button size="lg" variant="outline">
                    {t('home.cta.resources')}
                  </Button>
                </Link>
              </div>
              <dl className="mt-9 grid max-w-lg grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
                {HERO_FACTS.map(({ term, desc }) => (
                  <div key={term}>
                    <dt className="text-sm font-semibold text-hub-text">{t(term)}</dt>
                    <dd className="text-xs text-hub-muted">{t(desc)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="mx-auto w-full max-w-md">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-hub-text">{t('home.card.title')}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-hub-primary-light px-2.5 py-1 text-[11px] font-semibold text-hub-primary">
                      <Lock className="h-3 w-3" /> {t('home.card.lock')}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start gap-3 rounded-2xl bg-hub-primary-light/70 px-4 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-hub-primary">
                        <Smile className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-hub-text">{t('home.card.checkin')}</p>
                        <p className="text-xs text-hub-muted">{t('home.card.checkinDesc')}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-hub-text">
                        <MessageCircle className="h-4 w-4 text-hub-primary" />
                        {t('home.card.talk')}
                      </div>
                      <p className="mt-1 text-xs text-hub-muted">{t('home.card.talkDesc')}</p>
                    </div>
                    <div className="rounded-xl border border-hub-primary/15 bg-hub-primary-light/50 px-4 py-3 text-xs font-medium text-hub-primary">
                      <Star className="mr-1.5 inline h-3.5 w-3.5 fill-hub-primary text-hub-primary" />
                      {t('home.card.verified')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-hub py-12" aria-label="Why people trust Nsangiza Hub">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hub-primary-light">
                <item.icon className="h-5 w-5 text-hub-primary" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-hub-text">{t(item.title)}</h2>
              <p className="mt-1 text-sm text-hub-muted">{t(item.body)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-hub py-12" aria-labelledby="how-it-works-heading">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-hub-primary">{t('home.how.eyebrow')}</p>
          <h2 id="how-it-works-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-hub-text sm:text-4xl">
            {t('home.how.title')}
          </h2>
          <p className="mt-3 text-hub-muted">{t('home.how.intro')}</p>
        </div>
        <ol className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hub-primary-light">
                  <step.icon className="h-5 w-5 text-hub-primary" />
                </span>
                <span aria-hidden className="text-3xl font-black text-slate-100">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-hub-text">{t(step.title)}</h3>
              <p className="mt-1.5 text-sm text-hub-muted">{t(step.body)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-hub py-8" aria-labelledby="professionals-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="professionals-heading" className="text-2xl font-bold text-hub-text">
              {t('home.pros.title')}
            </h2>
            <p className="mt-1 text-sm text-hub-muted">{t('home.pros.subtitle')}</p>
          </div>
          <Link to="/professionals" className="text-sm font-medium text-hub-primary hover:underline">
            {t('home.pros.seeAll')} →
          </Link>
        </div>
        {loadingProviders ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(providers?.data ?? []).map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </section>

      <section className="container-hub py-12" aria-labelledby="sessions-heading">
        <div className="grid items-center gap-10 rounded-3xl bg-hub-primary px-6 py-10 text-white sm:px-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">{t('home.sessions.eyebrow')}</p>
            <h2 id="sessions-heading" className="mt-2 text-3xl font-extrabold tracking-tight">
              {t('home.sessions.title')}
            </h2>
            <p className="mt-3 text-white/85">{t('home.sessions.intro')}</p>
            <ul className="mt-6 space-y-3">
              {SESSION_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-white/90">
                  <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-hub-accent" />
                  {t(item)}
                </li>
              ))}
            </ul>
            <Link to="/how-it-works" className="mt-7 inline-flex">
              <Button size="lg" className="bg-white text-hub-primary hover:bg-hub-accent">
                {t('home.sessions.cta')}
              </Button>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SESSION_TOPICS.map((topic) => (
              <div key={topic} className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium">
                <Star className="mr-2 inline h-4 w-4 text-hub-accent" />
                {t(topic)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-hub py-12" aria-labelledby="checkin-heading">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-hub-primary">{t('home.checkin.eyebrow')}</p>
            <h2 id="checkin-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-hub-text sm:text-4xl">
              {t('home.checkin.title')}
            </h2>
            <p className="mt-3 text-hub-muted">{t('home.checkin.intro')}</p>
            <ul className="mt-6 space-y-3">
              {CHECKIN_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-hub-text">
                  <Smile className="mt-0.5 h-4 w-4 shrink-0 text-hub-primary" />
                  {t(item)}
                </li>
              ))}
            </ul>
            <Link to="/register" className="mt-7 inline-flex">
              <Button size="lg" variant="outline">
                {t('home.checkin.cta')}
              </Button>
            </Link>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-hub-text">{t('home.checkin.mood')}</p>
              <Badge variant="secondary">{t('home.checkin.private')}</Badge>
            </div>
            <div className="mt-5 flex items-end justify-between gap-2">
              {MOODS.map((mood) => (
                <div key={mood.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className={`w-full rounded-t-lg bg-hub-primary/15 ${mood.height}`} />
                  <span className="text-[10px] font-medium text-hub-muted">{t(mood.label)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-hub-primary-light px-4 py-3 text-sm text-hub-text">
              {t('home.checkin.note')}
            </div>
          </div>
        </div>
      </section>

      <section className="container-hub py-12" aria-labelledby="community-heading">
        <div className="grid items-center gap-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-hub-primary">{t('home.community.eyebrow')}</p>
            <h2 id="community-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-hub-text sm:text-4xl">
              {t('home.community.title')}
            </h2>
            <p className="mt-3 text-hub-muted">{t('home.community.intro')}</p>
            <ul className="mt-6 space-y-3">
              {COMMUNITY_POINTS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-hub-text">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-hub-primary" />
                  {t(item)}
                </li>
              ))}
            </ul>
            <Link to="/safety" className="mt-7 inline-flex">
              <Button size="lg" variant="outline">
                {t('home.community.cta')}
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {COMMUNITY_GROUPS.map((group) => (
              <div key={group.name} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-hub-text">{t(group.name)}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-hub-primary-light px-2.5 py-1 text-[11px] font-semibold text-hub-primary">
                    <Users className="h-3 w-3" /> {t('home.community.moderated')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-hub-muted">{t(group.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-hub py-8" aria-labelledby="resources-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="resources-heading" className="text-2xl font-bold text-hub-text">
              {t('home.resources.title')}
            </h2>
            <p className="mt-1 text-sm text-hub-muted">{t('home.resources.subtitle')}</p>
          </div>
          <Link to="/resources" className="text-sm font-medium text-hub-primary hover:underline">
            {t('home.resources.seeAll')} →
          </Link>
        </div>
        {loadingFeatured ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(featured?.data.resources ?? []).map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </section>

      <section className="container-hub py-12" aria-labelledby="safety-heading">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-hub-info/20">
            <CardContent className="p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-hub-info/10">
                <ShieldCheck className="h-5 w-5 text-hub-info" />
              </span>
              <h2 id="safety-heading" className="mt-4 text-xl font-bold text-hub-text">
                {t('home.safety.title')}
              </h2>
              <p className="mt-2 text-sm text-hub-muted">{t('home.safety.body')}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/help/emergency">
                  <Button size="lg" variant="outline">
                    {t('home.safety.emergency')}
                  </Button>
                </Link>
                <Link to="/safety">
                  <Button size="lg" variant="ghost">
                    {t('home.safety.safeguarding')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          <SafetyNotice />
        </div>
      </section>

      <section className="container-hub py-12" aria-labelledby="faq-heading">
        <div className="max-w-2xl">
          <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight text-hub-text sm:text-4xl">
            {t('home.faq.title')}
          </h2>
        </div>
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {FAQS.map((item) => (
            <details key={item.q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-hub-text [&::-webkit-details-marker]:hidden">
                {t(item.q)}
                <span aria-hidden className="text-xl text-hub-primary transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-hub-muted">{t(item.a)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="container-hub py-12" aria-labelledby="founder-heading">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative flex items-center justify-center bg-hub-primary p-10">
              <span
                aria-hidden
                className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]"
              />
              <Avatar className="relative h-36 w-36 border-4 border-white/25 shadow-xl sm:h-44 sm:w-44">
                <AvatarImage src="/images/yabesi.png" alt={t('home.founder.name')} />
                <AvatarFallback className="bg-white/15 text-4xl font-bold text-white">
                  {initials(t('home.founder.name'))}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="relative p-8 sm:p-10 lg:p-12">
              <Quote className="h-8 w-8 text-hub-primary/25" aria-hidden />
              <h2 id="founder-heading" className="mt-3 text-xs font-semibold uppercase tracking-wide text-hub-primary">
                {t('home.founder.eyebrow')}
              </h2>
              <blockquote className="mt-4 text-lg leading-relaxed text-hub-text sm:text-xl">
                {t('home.founder.quote')}
              </blockquote>
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="font-semibold text-hub-text">{t('home.founder.name')}</p>
                <p className="text-sm text-hub-muted">{t('home.founder.title')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-hub pb-16">
        <div className="overflow-hidden rounded-3xl bg-hub-primary px-6 py-12 text-center text-white sm:px-10">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('home.cta.title')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{t('home.cta.body')}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="bg-white text-hub-primary hover:bg-hub-accent">
                {t('home.cta.create')}
              </Button>
            </Link>
            <Link to="/professionals">
              <Button size="lg" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                {t('home.cta.browse')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
