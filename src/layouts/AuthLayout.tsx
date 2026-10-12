import { Suspense } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, HeartHandshake, ShieldCheck, Smile } from 'lucide-react'
import Brand from '../components/Brand'
import { SupportIllustration } from '../components/illustrations/SupportIllustration'
import { Loading } from '../components/PageHeader'
import { COVERS } from '../lib/images'

const MESSAGE = 'A little support can make a difference.'

const TRUST = [
  { icon: ShieldCheck, label: 'Private and confidential by design' },
  { icon: HeartHandshake, label: 'Verified counsellors and psychologists' },
  { icon: Smile, label: 'Kinyarwanda, English and French' },
]

function MobilePitch() {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl bg-hub-primary px-4 py-3 text-white lg:hidden">
      <p className="text-sm font-semibold">{MESSAGE}</p>
      <p className="mt-0.5 text-xs text-white/75">Safe, confidential support in your language.</p>
    </div>
  )
}

function PitchPanel() {
  const reduce = useReducedMotion()

  return (
    <aside className="relative hidden overflow-hidden bg-hub-primary lg:block">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img src={COVERS.forest} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-hub-primary/95 via-hub-primary/90 to-hub-primary-dark/95" />
        <motion.div
          className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-hub-accent/25 blur-3xl"
          animate={reduce ? undefined : { x: [0, 26, 0], y: [0, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/90">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
            <HeartHandshake className="h-4 w-4" />
          </span>
          Nsangiza Hub
        </div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 18 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        >
          <SupportIllustration className="mb-2 w-full max-w-sm" />
          <Smile className="h-8 w-8 text-hub-accent" />
          <p className="mt-3 text-3xl font-extrabold leading-snug tracking-tight text-white xl:text-4xl">{MESSAGE}</p>
          <p className="mt-4 max-w-sm text-white/80">
            Book a conversation, keep track of how you are doing, and find someone who understands — whenever you are
            ready.
          </p>

          <ul className="mt-8 space-y-3">
            {TRUST.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/12">
                  <item.icon className="h-4 w-4 text-hub-accent" />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="text-xs text-white/60">© {new Date().getFullYear()} Nsangiza Hub</p>
      </div>
    </aside>
  )
}

export default function AuthLayout() {
  const reduce = useReducedMotion()

  return (
    <div className="grid min-h-screen grid-cols-1 bg-hub-background lg:grid-cols-2">
      <div className="flex min-h-screen flex-col">
        <div className="px-4 pt-5 sm:px-6">
          <Link
            to="/"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-hub-muted transition-colors hover:bg-white hover:text-hub-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-6 sm:px-6">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            <div className="mb-6">
              <Brand to="/" />
            </div>
            <MobilePitch />
            <Suspense fallback={<Loading label="Loading…" />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </div>
      </div>

      <PitchPanel />
    </div>
  )
}
