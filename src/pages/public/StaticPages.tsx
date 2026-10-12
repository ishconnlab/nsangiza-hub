import { type ReactNode } from 'react'
import { BadgeCheck, Mail, MessageCircleQuestion, ShieldCheck, Siren, UserRoundPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { PageHeader } from '../../components/PageHeader'
import { SafetyNotice } from '../../components/SafetyNotice'
import { useEmergencyContacts } from '../../services/emergency'

function StaticShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="container-hub py-12">
      <div className="mx-auto max-w-3xl">
        <PageHeader title={title} />
        {children}
      </div>
    </div>
  )
}

export function Safety() {
  return (
    <StaticShell title="Community safety">
      <div className="space-y-5 text-hub-muted">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold text-hub-text"><Siren className="h-5 w-5 text-hub-info" />Reaching out in a crisis</h2>
          <p className="mt-2 text-sm">
            If you or someone you know is in immediate danger, contact emergency services now — don't wait.
          </p>
          <div className="mt-3"><SafetyNotice /></div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold text-hub-text"><ShieldCheck className="h-5 w-5 text-hub-primary" />How we keep the platform safe</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
            <li>Professionals are identity-checked and verified before they can accept bookings.</li>
            <li>All messages and sessions happen inside the platform so they stay encrypted and audited.</li>
            <li>Community groups are moderated, and any report is reviewed by a human moderator.</li>
            <li>We never share your conversations, check-ins or personal data — ever.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-hub-text">Reporting a concern</h2>
          <p className="mt-2 text-sm">
            You can report a post or a conversation from within the app — it stays completely private and the
            moderator only sees what's needed to act. For anything urgent, contact our support team and our
            safeguarding reviewers will respond with care.
          </p>
        </div>
      </div>
    </StaticShell>
  )
}

export function Emergency() {
  const { data } = useEmergencyContacts()
  const contacts = data?.data

  return (
    <StaticShell title="Emergency contacts">
      <div className="space-y-5">
        <SafetyNotice />
        {contacts && (
          <div className="grid gap-4 sm:grid-cols-2">
            <a href={`tel:${contacts.primary.phone}`} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition-shadow hover:shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-wide text-hub-primary">{contacts.primary.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-hub-text group-hover:text-hub-primary">{contacts.primary.phone}</p>
              <p className="mt-1 text-xs text-hub-muted">Tap to call now</p>
            </a>
            <a href={`tel:${contacts.medical.phone}`} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition-shadow hover:shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-wide text-hub-primary">{contacts.medical.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-hub-text group-hover:text-hub-primary">{contacts.medical.phone}</p>
              <p className="mt-1 text-xs text-hub-muted">Tap to call now</p>
            </a>
          </div>
        )}
        <p className="rounded-2xl bg-amber-50 p-5 text-sm text-hub-warning">
          A family member, close friend or your local health centre can also help you get support quickly. You matter —
          please reach out.
        </p>
      </div>
    </StaticShell>
  )
}

export function Contact() {
  return (
    <StaticShell title="Contact & support">
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold text-hub-text"><MessageCircleQuestion className="h-5 w-5 text-hub-primary" />We're here to help</h2>
          <p className="mt-2 text-sm text-hub-muted">
            For help with your account, privacy, or a support concern, email our care team and a human will respond
            — usually within one working day.
          </p>
          <a href="mailto:support@nsangiza.rw" className="mt-3 inline-flex items-center gap-2 font-semibold text-hub-primary hover:underline">
            <Mail className="h-4 w-4" />
            support@nsangiza.rw
          </a>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-semibold text-hub-text">In a crisis right now?</h2>
          <p className="mt-2 text-sm text-hub-muted">
            Please don't wait for a written reply — use the emergency contacts immediately.
          </p>
          <Link to="/help/emergency" className="mt-3 inline-block"><Button variant="secondary">View emergency contacts</Button></Link>
        </div>
      </div>
    </StaticShell>
  )
}

export function Join() {
  const steps = [
    'Create a professional account and complete your profile with qualifications and experience.',
    'Upload your credentials and a valid ID — all verified in the background.',
    'Set your availability, session types and price.',
    'Get approved by our review team and start welcoming clients.',
  ]
  return (
    <StaticShell title="Offer support on Nsangiza Hub">
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold text-hub-text"><UserRoundPlus className="h-5 w-5 text-hub-primary" />Join as a professional</h2>
          <p className="mt-2 text-sm text-hub-muted">
            Counsellors, psychologists, social workers, psychosocial support providers and wellbeing coaches — if you're
            qualified and registered to practise in Rwanda, we'd love to have you.
          </p>
          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-hub-muted">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hub-primary-light font-bold text-hub-primary">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link to="/register"><Button size="lg"><UserRoundPlus className="h-4 w-4" />Create a professional account</Button></Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-hub-muted">
              <BadgeCheck className="h-4 w-4 text-hub-success" />Every professional is verified
            </span>
          </div>
        </div>
      </div>
    </StaticShell>
  )
}

export function Privacy() {
  return (
    <StaticShell title="Privacy policy">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft text-sm leading-7 text-hub-muted">
        <p className="font-semibold text-hub-text">The short, honest version</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>We store only what's needed to provide safe support: your account details, preferences, self check-ins and session history.</li>
          <li>Your conversations with professionals and community posts are private and never sold or shared.</li>
          <li>You can request a copy or deletion of your data at any time by writing to support@nsangiza.rw.</li>
          <li>We use security measures including encryption in transit and restricted access to personal information.</li>
          <li>We never publish your information or use it for advertising.</li>
        </ul>
        <p>
          The full policy mirrors these principles and adds the precise legal details. For questions, email{' '}
          <a href="mailto:support@nsangiza.rw" className="text-hub-primary underline">support@nsangiza.rw</a>.
        </p>
      </div>
    </StaticShell>
  )
}

export function Terms() {
  return (
    <StaticShell title="Terms of service">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft text-sm leading-7 text-hub-muted">
        <p className="font-semibold text-hub-text">Using Nsangiza Hub safely</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Nsangiza Hub connects you with verified professionals. It is not a replacement for emergency or in-person urgent care.</li>
          <li>Be kind. Abuse, discrimination or harassment of other users or professionals ends access.</li>
          <li>Appointments can be cancelled or rescheduled anytime before the session.</li>
          <li>Fees are set per professional, shown before booking, and never charged without your confirmation.</li>
          <li>If you're under 18, a parent or guardian should create the account with you.</li>
        </ul>
        <p>
          For anything unclear, contact <a href="mailto:support@nsangiza.rw" className="text-hub-primary underline">support@nsangiza.rw</a>.
        </p>
      </div>
    </StaticShell>
  )
}