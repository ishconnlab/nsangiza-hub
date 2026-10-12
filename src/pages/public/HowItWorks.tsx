import { Link } from 'react-router-dom'
import { BookOpen, CalendarClock, ClipboardList, HandHeart, MessagesSquare, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { SafetyNotice } from '../../components/SafetyNotice'

const SECTIONS = [
  {
    icon: ClipboardList,
    title: '1. A short, private check-in',
    body: 'When you create an account you answer a few gentle questions about how you have been feeling. This only shapes your recommendations — it is never shared without your consent.',
  },
  {
    icon: UserRoundCheck,
    title: '2. Get matched with the right support',
    body: 'We match you with verified professionals who specialise in your area, speak your language and are available near you — through secure chat, audio or video.',
  },
  {
    icon: CalendarClock,
    title: '3. Book in your own time',
    body: 'Choose a day and a time that work for you. Sessions are 30–60 minutes, and you always know the price before you book.',
  },
  {
    icon: MessagesSquare,
    title: '4. Talk in privacy',
    body: 'Sessions happen inside Nsangiza Hub — encrypted, confidential, and designed to feel safe. You can also message your professional between sessions.',
  },
  {
    icon: HandHeart,
    title: '5. Continued support',
    body: 'After sessions, your professional can set gentle follow-ups, and you keep access to community, resources and self check-ins.',
  },
  {
    icon: BookOpen,
    title: '6. Learn at your pace',
    body: 'Read practical, Rwanda-relevant resources on stress, sleep, relationships and wellbeing — in Kinyarwanda, English and French.',
  },
]

export default function HowItWorks() {
  return (
    <div className="container-hub py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-hub-primary">How it works</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-hub-text sm:text-4xl">
          Support that respects your pace
        </h1>
        <p className="mt-3 text-hub-muted">
          Six simple steps between feeling heavy and feeling supported.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-hub-primary-light">
              <s.icon className="h-5 w-5 text-hub-primary" />
            </span>
            <h2 className="mt-4 font-semibold text-hub-text">{s.title}</h2>
            <p className="mt-2 text-sm text-hub-muted">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold text-hub-text">
            <ShieldCheck className="h-5 w-5 text-hub-primary" />
            Your safety is the design
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-hub-muted">
            <li>Every professional is identity-checked and verified before joining.</li>
            <li>All conversations are private and never sold or shared.</li>
            <li>Community spaces are moderated, and reports are reviewed by humans.</li>
            <li>Safeguarding concerns are reviewed with care, never punitively.</li>
          </ul>
          <Link to="/safety" className="mt-4 inline-block text-sm font-medium text-hub-primary hover:underline">
            Read our community safety guide →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-hub-text">Prices that stay transparent</h2>
          <p className="mt-2 text-sm text-hub-muted">
            Professionals set their own session price in Rwandan Francs, and you always see it before booking.
            Affordable options and free resources are always available — nobody is turned away in a moment of need.
          </p>
          <div className="mt-4"><SafetyNotice compact /></div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link to="/register">
          <Button size="lg">Start your journey today</Button>
        </Link>
      </div>
    </div>
  )
}