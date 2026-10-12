import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookHeart,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  HeartHandshake,
  Languages,
  MapPin,
  MessageSquareText,
  NotebookPen,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import {
  cities,
  consultationSchedule,
  dashboardMessages,
  providers,
  resources,
  supportCategories,
  wellbeingMetrics,
  type Provider,
  type SupportCategory,
} from './lib/mock-data'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
})

const supportSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  concern: z.string().min(3, 'Tell us a bit more about what you are navigating.'),
  city: z.string().min(1, 'Select your city.'),
  preferredFormat: z.enum(['Video call', 'Phone support', 'Chat', 'In-person']),
  urgency: z.enum(['Low', 'Moderate', 'High']),
  consent: z.boolean().refine((value) => value, 'Please confirm that you understand this is not an emergency service.'),
})

type SupportFormValues = z.infer<typeof supportSchema>

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Support hub', path: '/support' },
  { name: 'Providers', path: '/providers' },
  { name: 'Resources', path: '/resources' },
  { name: 'Dashboard', path: '/dashboard' },
]

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function AppShell() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-hub-background text-hub-text">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-hub-primary text-lg font-bold text-white shadow-soft">N</div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-primary">Nsangiza Hub</div>
              <div className="text-xs text-slate-500">Your Safe Space to Talk</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-hub-primary' : 'text-slate-600 hover:text-hub-primary'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Log in
            </Button>
            <Link to="/support">
              <Button size="sm">Start support</Button>
            </Link>
          </div>
        </div>

        {!isHome && (
          <div className="border-t border-slate-100 bg-hub-primary-light/60">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 text-sm text-slate-700 sm:px-6 lg:px-8">
              <ShieldCheck className="h-4 w-4 text-hub-primary" />
              Privacy-aware support pathways • Responsible care • Human review where needed
            </div>
          </div>
        )}
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/providers/:id" element={<ProviderDetailPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hub-primary text-sm font-bold text-white">N</div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-primary">Nsangiza Hub</div>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Your safe space to talk, connect with trusted support and access wellbeing resources in Rwanda.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Explore</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link to="/support" className="hover:text-hub-primary">Support hub</Link></li>
              <li><Link to="/providers" className="hover:text-hub-primary">Professional support</Link></li>
              <li><Link to="/resources" className="hover:text-hub-primary">Wellbeing resources</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Safety</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link to="/safety" className="hover:text-hub-primary">Safeguarding guidance</Link></li>
              <li>Confidential contact</li>
              <li>Human review pathways</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Languages</h3>
            <div className="flex flex-wrap gap-2 text-sm text-slate-700">
              {['Kinyarwanda', 'English', 'French'].map((language) => (
                <span key={language} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                  {language}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-hub-primary-light/80 to-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hub-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-hub-primary">
              <ShieldCheck className="h-4 w-4" />
              Rwanda-focused, privacy-aware support
            </span>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Your safe space to talk, reflect, and feel supported.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Nsangiza Hub connects you to professional support, trusted wellbeing resources, and follow-up care that respects your pace and privacy.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/support">
                <Button size="lg">Find support</Button>
              </Link>
              <Link to="/providers">
                <Button variant="secondary" size="lg">View providers</Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-hub-success" /> Verified support pathways</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-hub-success" /> Human-centred care</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}>
            <Card className="overflow-hidden border-none shadow-soft">
              <div className="bg-hub-primary px-6 py-5 text-white">
                <p className="text-sm uppercase tracking-[0.18em] text-hub-accent">Care match</p>
                <h2 className="mt-2 text-2xl font-semibold">Start with support that fits your needs</h2>
              </div>
              <CardContent className="space-y-5 p-6">
                <div className="rounded-2xl bg-hub-primary-light p-4">
                  <p className="text-sm text-slate-600">What you might be navigating</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {supportCategories.slice(0, 4).map((category) => (
                      <span key={category} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: 'Support options', value: '4' },
                    { label: 'Cities', value: '9' },
                    { label: 'Response time', value: '24h' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="text-xl font-semibold text-hub-primary">{stat.value}</div>
                      <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                  <div>
                    <div className="text-sm text-slate-500">Current care path</div>
                    <div className="mt-1 text-base font-semibold text-slate-900">Professional consultation</div>
                  </div>
                  <Link to="/support">
                    <Button variant="secondary" size="sm">
                      Continue <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-primary">What people can access</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900">Support designed around everyday wellbeing</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: HeartHandshake,
              title: 'Professional care matching',
              description: 'Connect with verified support providers and culturally relevant care pathways.',
            },
            {
              icon: BookHeart,
              title: 'Trusted wellbeing resources',
              description: 'Access self-guided tools, practical advice and follow-up care documents.',
            },
            {
              icon: ShieldCheck,
              title: 'Secure and respectful support',
              description: 'Use private communication and clear boundaries that protect your care journey.',
            },
          ].map(({ icon: Icon, title, description }, index) => (
            <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Card className="h-full border-slate-200 bg-white p-1">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hub-primary-light text-hub-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm leading-7 text-slate-600">{description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-accent">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold">A clear path from stress to support</h2>
            </div>
            <Link to="/support">
              <Button variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
                Begin your support journey <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Share what you are navigating',
                text: 'Let us understand your support needs, preferred communication style and local context.',
              },
              {
                step: '02',
                title: 'Match with support',
                text: 'Explore appropriate professionals, community support or wellbeing resources.',
              },
              {
                step: '03',
                title: 'Receive follow-up care',
                text: 'Book a consultation, receive a safe plan and continue with check-ins if helpful.',
              },
            ].map((item) => (
              <div key={item.step} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-semibold text-hub-accent">{item.step}</div>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-primary">Example providers</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Support people who understand your context</h2>
          </div>
          <Link to="/providers" className="hidden text-sm font-medium text-hub-primary sm:inline-flex">
            View all providers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-4">
          {providers.slice(0, 4).map((provider) => (
            <ProviderCard key={provider.id} provider={provider} compact />
          ))}
        </div>
      </section>

      <section className="bg-hub-primary-light/80 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-primary">Wellbeing resources</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Helpful tools for daily wellbeing</h2>
            </div>
            <Link to="/resources" className="hidden text-sm font-medium text-hub-primary sm:inline-flex">
              Explore resources <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {resources.map((resource) => (
              <Link key={resource.id} to={`/resources/${resource.id}`} className="group block h-full">
                <Card className="h-full border-slate-200 transition-transform group-hover:-translate-y-1">
                  <CardHeader>
                    <div className="mb-4 inline-flex w-fit rounded-full bg-hub-primary-light px-2.5 py-1 text-xs font-medium text-hub-primary">
                      {resource.tag}
                    </div>
                    <CardTitle className="line-clamp-2 text-xl">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{resource.summary}</p>
                    <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                      <span>{resource.duration}</span>
                      <span>{resource.level}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function SupportPage() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      preferredFormat: 'Video call',
      urgency: 'Moderate',
      city: 'Kigali',
      consent: false,
    },
  })

  const onSubmit = (values: SupportFormValues) => {
    setSubmitted(true)
    console.info('Support request submission', values)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-primary">Support hub</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Tell us a little about what you need</h1>
        <p className="mt-4 text-lg text-slate-600">
          This intake is designed to help match you with the right support pathway, without using diagnosis-based language or making medical claims.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Care pathway overview</CardTitle>
            <CardDescription>What you can expect after submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              'A care coordinator reviews your request for the right type of support.',
              'You may be matched with a professional consultation or wellbeing resource.',
              'If there are immediate safety concerns, the platform guides you to urgent assistance and human support.',
            ].map((point, index) => (
              <div key={point} className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-hub-primary-light text-sm font-semibold text-hub-primary">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-slate-600">{point}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
              <div className="flex items-center gap-2 font-medium"><CircleAlert className="h-4 w-4" /> Safety note</div>
              <p className="mt-2">This is not an emergency service. If you are in immediate danger or need urgent care, contact emergency services or a trusted person right away.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Support request</CardTitle>
            <CardDescription>We will use this information to suggest suitable options.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-2xl border border-hub-primary/20 bg-hub-primary-light p-5">
                <div className="flex items-center gap-2 text-hub-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Your request has been prepared</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  A support match is ready to review. Your responses suggest that speaking with a qualified professional may be helpful, and a next step can be arranged based on your preferences.
                </p>
                <Link to="/providers" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-hub-primary">
                  Explore available providers <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Name
                    <input
                      {...register('name')}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-hub-primary focus:bg-white"
                      placeholder="Your name"
                    />
                    {errors.name && <span className="text-xs text-hub-danger">{errors.name.message}</span>}
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    City
                    <select {...register('city')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-hub-primary focus:bg-white">
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.city && <span className="text-xs text-hub-danger">{errors.city.message}</span>}
                  </label>
                </div>

                <label className="block space-y-2 text-sm font-medium text-slate-700">
                  What support do you feel would help most?
                  <textarea
                    {...register('concern')}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-hub-primary focus:bg-white"
                    placeholder="I am feeling overwhelmed by work pressure and sleep is being affected."
                  />
                  {errors.concern && <span className="text-xs text-hub-danger">{errors.concern.message}</span>}
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Preferred format
                    <select {...register('preferredFormat')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-hub-primary focus:bg-white">
                      {(['Video call', 'Phone support', 'Chat', 'In-person'] as const).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    Urgency
                    <select {...register('urgency')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-hub-primary focus:bg-white">
                      {(['Low', 'Moderate', 'High'] as const).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <input type="checkbox" {...register('consent')} className="mt-1 h-4 w-4 rounded border-slate-300 text-hub-primary focus:ring-hub-primary" />
                  <span>
                    I understand this is not an emergency service and that the platform will guide me toward appropriate professional support or urgent human assistance if needed.
                  </span>
                </label>
                {errors.consent && <span className="block text-xs text-hub-danger">{errors.consent.message}</span>}

                <Button type="submit" className="w-full">Continue to support options</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProvidersPage() {
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory | 'All'>('All')
  const [selectedCity, setSelectedCity] = useState<string>('All cities')

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const categoryMatch = selectedCategory === 'All' || provider.focus.includes(selectedCategory)
      const cityMatch = selectedCity === 'All cities' || provider.city === selectedCity
      return categoryMatch && cityMatch
    })
  }, [selectedCategory, selectedCity])

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-primary">Professional support</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Choose a support pathway</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          <Search className="h-4 w-4" />
          <span>Support match by city and concern</span>
        </div>
      </div>

      <div className="mb-8 space-y-5 rounded-3xl border border-slate-200 bg-white p-5">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Filter by need</p>
          <div className="flex flex-wrap gap-2">
            {(['All', ...supportCategories] as const).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  selectedCategory === category ? 'bg-hub-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Location</p>
          <div className="flex flex-wrap gap-2">
            {['All cities', ...cities].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  selectedCity === city ? 'bg-hub-primary-light text-hub-primary' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {filteredProviders.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  )
}

function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const provider = providers.find((item) => item.id === id)

  if (!provider) {
    return <Navigate to="/providers" replace />
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Link to="/providers" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-hub-primary">
        <ChevronRight className="h-4 w-4 rotate-180" />
        Back to providers
      </Link>
      <Card className="overflow-hidden border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-hub-primary-light p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-hub-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Demo profile
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900">{provider.name}</h1>
              <p className="mt-2 text-lg text-slate-600">{provider.role} • {provider.city}</p>
            </div>
            <div className="rounded-2xl bg-white p-3 text-right shadow-sm">
              <div className="flex items-center gap-1 text-hub-primary">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-semibold">{provider.rating}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{provider.reviewCount} reviews</p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-8 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">Focus areas</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {provider.focus.map((focus) => (
                  <span key={focus} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">{focus}</span>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900">Experience</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">{provider.experience}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900">Languages</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {provider.languages.map((language) => (
                  <span key={language} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
                    {language}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-700"><Clock3 className="h-4 w-4 text-hub-primary" /> {provider.availability}</div>
            <div className="flex items-center gap-2 text-slate-700"><MapPin className="h-4 w-4 text-hub-primary" /> {provider.city}</div>
            <div className="flex items-center gap-2 text-slate-700"><Languages className="h-4 w-4 text-hub-primary" /> {provider.languages.join(', ')}</div>
            <div className="rounded-2xl bg-white p-4">
              <div className="text-sm text-slate-500">Consultation</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">{provider.fee}</div>
            </div>
            <Button className="w-full">Book an intro consultation</Button>
            <Link to="/support">
              <Button variant="secondary" className="w-full">Request a matching review</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredResources = useMemo(() => {
    if (selectedCategory === 'All') return resources
    return resources.filter((resource) => resource.category === selectedCategory || resource.tag === selectedCategory)
  }, [selectedCategory])

  const categories = ['All', ...new Set(resources.map((resource) => resource.category))]

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-primary">Resources</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Wellbeing resources you can return to</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          <NotebookPen className="h-4 w-4" />
          Practical and supportive guidance
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              selectedCategory === category ? 'bg-hub-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredResources.map((resource) => (
          <Link key={resource.id} to={`/resources/${resource.id}`} className="group block h-full">
            <Card className="h-full border-slate-200 transition-transform group-hover:-translate-y-1">
              <CardHeader>
                <div className="mb-4 inline-flex w-fit rounded-full bg-hub-primary-light px-2.5 py-1 text-xs font-medium text-hub-primary">
                  {resource.tag}
                </div>
                <CardTitle>{resource.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">{resource.summary}</p>
                <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                  <span>{resource.category}</span>
                  <span>{resource.duration}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const resource = resources.find((item) => item.id === id)

  if (!resource) {
    return <Navigate to="/resources" replace />
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link to="/resources" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-hub-primary">
        <ChevronRight className="h-4 w-4 rotate-180" />
        Back to resources
      </Link>
      <Card className="overflow-hidden border-slate-200 bg-white">
        <CardHeader className="bg-hub-primary-light">
          <div className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-hub-primary">{resource.tag}</div>
          <CardTitle className="mt-3 text-3xl">{resource.title}</CardTitle>
          <CardDescription>{resource.category} • {resource.duration}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <p className="text-base leading-8 text-slate-700">
            {resource.summary}
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">A few gentle ideas</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              <li>• Pause and notice what feels most urgent right now.</li>
              <li>• Take one small step that supports calm, routine and rest.</li>
              <li>• If your stress feels high or difficult to manage alone, connect with a qualified professional for support.</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/support">
              <Button>Match with support</Button>
            </Link>
            <Link to="/providers">
              <Button variant="outline">View providers</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-hub-primary">Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Your care overview</h1>
        </div>
        <Link to="/support">
          <Button variant="secondary">Plan next step</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {wellbeingMetrics.map((metric) => (
          <Card key={metric.label} className="border-slate-200 bg-white">
            <CardContent className="p-5">
              <div className="text-3xl font-semibold text-slate-900">{metric.value}</div>
              <div className="mt-2 text-sm text-slate-600">{metric.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Upcoming care</CardTitle>
            <CardDescription>Your upcoming consultations and follow-up support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {consultationSchedule.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                    {item.date}
                  </div>
                </div>
                <span className="rounded-full bg-hub-primary-light px-2.5 py-1 text-xs font-medium text-hub-primary">{item.mode}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Recent messages</CardTitle>
            <CardDescription>Check in with your support circle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardMessages.map((message) => (
              <div key={message.sender} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-slate-900">{message.sender}</div>
                  <div className="text-xs text-slate-500">{message.time}</div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{message.preview}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SafetyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-3 text-amber-900">
          <ShieldAlert className="mt-1 h-6 w-6" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">Safety guidance</p>
            <h1 className="mt-3 text-4xl font-semibold">Immediate help if you are in danger</h1>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Get urgent support</CardTitle>
            <CardDescription>For immediate safety needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>If you are in immediate danger, feel unable to stay safe, or need urgent medical help, contact emergency services or a trusted person now.</p>
            <p>Use the platform for connected support and professional follow-up, but do not rely on it for emergency response.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle>Responsible support pathways</CardTitle>
            <CardDescription>For high-risk or complex needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>Our care pathways are built around professional review, confidentiality, and safeguarding principles.</p>
            <p>Where risk is high or needs are complex, the system directs people to human review and appropriate care referrals.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-semibold text-slate-900">How Nsangiza Hub responds</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'Human review',
              text: 'Sensitive concerns are reviewed by trained staff and redirected to appropriate support.',
            },
            {
              icon: MessageSquareText,
              title: 'Private communication',
              text: 'Sensitive information remains protected and shared only on a need-to-know basis.',
            },
            {
              icon: ShieldCheck,
              title: 'Appropriate referrals',
              text: 'Support pathways are designed around professional care, community resources and follow-up.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hub-primary-light text-hub-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProviderCard({ provider, compact = false }: { provider: Provider; compact?: boolean }) {
  return (
    <Card className="h-full border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-hub-primary-light px-2.5 py-1 text-[11px] font-medium text-hub-primary">
              {provider.status}
            </div>
            <CardTitle className="mt-3 text-xl">{provider.name}</CardTitle>
            <p className="mt-1 text-sm text-slate-600">{provider.role}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-2 text-right">
            <div className="flex items-center gap-1 text-hub-primary">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold">{provider.rating}</span>
            </div>
            <div className="text-[11px] text-slate-500">{provider.reviewCount} reviews</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-hub-primary" />
          {provider.city}
        </div>
        <div className="flex flex-wrap gap-2">
          {provider.focus.slice(0, 2).map((focus) => (
            <span key={focus} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{focus}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Languages className="h-4 w-4 text-hub-primary" />
          {provider.languages.join(', ')}
        </div>
        <div className="text-sm text-slate-600">{provider.experience}</div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Fee</div>
            <div className="mt-1 font-semibold text-slate-900">{provider.fee}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/providers/${provider.id}`}>
              <Button variant="secondary" size="sm">View profile</Button>
            </Link>
            {!compact && (
              <Button size="sm">Book</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default App
