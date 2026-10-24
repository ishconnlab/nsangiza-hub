import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { BadgeCheck, CalendarDays, Clock3, Languages, MapPin, MessageCircle, Star } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Loading, EmptyState } from '../../components/PageHeader'
import { coverPhoto, providerPhoto } from '../../lib/images'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { SafetyNotice } from '../../components/SafetyNotice'
import { formatDate, formatPrice, initials } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useAuth } from '../../hooks/auth-context'
import { dashboardPathFor } from '../../router/guards'
import { useStartConversation } from '../../services/conversations'
import { useCreateAppointment } from '../../services/appointments'
import { useProfessionalDetail } from '../../services/professionals'

const SESSION_DURATION_MIN = 45
const MIN_BOOKING_NOTICE_MS = 5 * 60_000
const RWANDA_TIME_ZONE = 'Africa/Kigali'

function rwandaDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: RWANDA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function rwandaDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+02:00`)
}

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { data, isLoading, isError } = useProfessionalDetail(id ?? '')
  const createMutation = useCreateAppointment()
  const startConversation = useStartConversation()

  const [bookingOpen, setBookingOpen] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [type, setType] = useState<'Secure chat' | 'Audio call' | 'Video call'>('Video call')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const professional = data?.data.professional
  const availableDays = (professional?.availability ?? []).filter((a) => a.enabled)

  const selectedDayName = date
    ? new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: RWANDA_TIME_ZONE }).format(rwandaDateTime(date, '12:00'))
    : ''
  const daySlots = availableDays.filter((a) => a.day === selectedDayName)
  const timeOptions: string[] = []
  for (const slot of daySlots) {
    const [sh, sm] = slot.start.split(':').map(Number)
    const [eh, em] = slot.end.split(':').map(Number)
    for (let m = sh * 60 + sm; m + SESSION_DURATION_MIN <= eh * 60 + em; m += 30) {
      const option = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
      if (date === rwandaDateKey() && rwandaDateTime(date, option).getTime() < Date.now() + MIN_BOOKING_NOTICE_MS) continue
      timeOptions.push(option)
    }
  }
  const manualTimeAllowed = availableDays.length === 0
  const finalTime = timeOptions.length > 0 ? (timeOptions.includes(time) ? time : timeOptions[0]) : manualTimeAllowed ? time : ''

  function requireAuth() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/professionals/${id}` } })
      return false
    }
    return true
  }

  function openBooking() {
    if (requireAuth()) setBookingOpen(true)
  }

  async function startChat() {
    if (!requireAuth() || !professional) return
    try {
      const res = await startConversation.mutateAsync(professional.id)
      toast.success('Conversation ready.')
      navigate(`/app/messages/${res.data.conversation.id}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not start a conversation.')
    }
  }

  async function book() {
    if (!professional || !date || !finalTime) {
      toast.error('Please choose a date and time.')
      return
    }
    const appointmentDate = rwandaDateTime(date, finalTime)
    if (Number.isNaN(appointmentDate.getTime()) || appointmentDate.getTime() < Date.now() + MIN_BOOKING_NOTICE_MS) {
      toast.error('Choose a time at least five minutes from now.')
      return
    }
    setSubmitting(true)
    try {
      await createMutation.mutateAsync({
        professionalId: professional.id,
        date: appointmentDate.toISOString(),
        durationMin: SESSION_DURATION_MIN,
        type,
        notes,
      })
      toast.success('Appointment requested.')
      setBookingOpen(false)
      navigate(user?.role === 'USER' ? '/app/appointments' : dashboardPathFor(user?.role))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Booking failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) return <div className="container-hub py-16"><Loading label="Loading professional…" /></div>
  if (isError || !professional) {
    return (
      <div className="container-hub py-16">
        <EmptyState title="Professional not found" action={<Link to="/professionals"><Button variant="outline">Browse professionals</Button></Link>} />
      </div>
    )
  }


  return (
    <div className="container-hub py-10">
      <p className="mb-4 text-sm text-hub-muted">
        <Link to="/professionals" className="hover:text-hub-primary">Find support</Link> → {professional.name}
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="relative h-32 w-full bg-slate-100">
              <img src={coverPhoto(professional.id)} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>
            <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <Avatar className="-mt-14 h-20 w-20 ring-4 ring-white">
                  <AvatarImage src={providerPhoto(professional.id)} alt="" />
                  <AvatarFallback className="text-xl">{initials(professional.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 pt-1">
                  <h1 className="break-words text-xl font-bold leading-tight text-hub-text sm:text-2xl">{professional.name}</h1>
                  <p className="break-words text-sm font-medium text-hub-primary">{professional.providerType}</p>
                  {professional.verification.status === 'Approved' && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-hub-success">
                      <BadgeCheck className="h-4 w-4" />
                      Identity verified
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs font-semibold sm:text-sm">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                {professional.rating.toFixed(1)}
                <span className="font-normal text-hub-muted">({professional.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {professional.specializations.map((s) => <Badge key={s}>{s}</Badge>)}
            </div>

            {professional.about && <p className="mt-5 whitespace-pre-line text-hub-muted">{professional.about}</p>}

            {professional.experience && (
              <div className="mt-5">
                <h2 className="font-semibold text-hub-text">Experience</h2>
                <p className="mt-1 text-sm text-hub-muted">{professional.experience}</p>
                {professional.experienceYears !== undefined && <p className="mt-1 text-xs text-slate-400">{professional.experienceYears}+ years experience</p>}
              </div>
            )}

            {professional.qualifications.length > 0 && (
              <div className="mt-5">
                <h2 className="font-semibold text-hub-text">Qualifications</h2>
                <ul className="mt-2 space-y-2">
                  {professional.qualifications.map((q, i) => (
                    <li key={i} className="rounded-xl border border-slate-100 px-3 py-2 text-sm">
                      <span className="font-medium text-hub-text">{q.title}</span>
                      <span className="text-hub-muted"> — {q.institution}{q.year ? ` (${q.year})` : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {professional.sessionTypes.length > 0 && (
              <div className="mt-5">
                <h2 className="font-semibold text-hub-text">Session types</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {professional.sessionTypes.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </div>
            )}

            {professional.reviews && professional.reviews.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-hub-text">Recent reviews</h2>
                <div className="mt-3 space-y-3">
                  {professional.reviews.slice(0, 3).map((r, i) => (
                    <div key={i} className="rounded-xl border border-slate-100 p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-hub-text">{r.author}</span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-semibold">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{r.rating}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                      </div>
                      <p className="mt-1.5 text-sm text-hub-muted">{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-semibold text-hub-text">Book a session</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-hub-text">
              <CalendarDays className="h-4 w-4 text-hub-primary" />
              {formatPrice(professional.pricePerSession)}{' '}
              <span className="font-normal text-hub-muted">/ 45 min</span>
            </p>
            <div className="mt-3 space-y-2 text-sm text-hub-muted">
              <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-hub-primary" />{professional.city ?? 'Rwanda'}</p>
              <p className="flex items-center gap-1.5"><Languages className="h-4 w-4 text-hub-primary" />{professional.languages.join(', ')}</p>
              {professional.availabilityLabel && <p className="flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-hub-primary" />{professional.availabilityLabel}</p>}
            </div>
            <div className="mt-4 space-y-2">
              <Button className="w-full" onClick={openBooking}>
                <CalendarDays className="h-4 w-4" />
                Book a session
              </Button>
              <Button variant="secondary" className="w-full" onClick={startChat}>
                <MessageCircle className="h-4 w-4" />
                Message first
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Sessions are private and confidential. Cancel or reschedule anytime before the session.
            </p>
          </div>

          {availableDays.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <h2 className="text-sm font-semibold text-hub-text">Weekly availability</h2>
              <ul className="mt-2 space-y-1.5 text-sm text-hub-muted">
                {availableDays.map((slot) => (
                  <li key={slot.day} className="flex justify-between">
                    <span>{slot.day}</span>
                    <span>{slot.start}–{slot.end}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <SafetyNotice compact />
        </div>
      </div>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book with {professional.name}</DialogTitle>
            <DialogDescription>
              Choose a time that suits you. The professional will confirm your appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="book-date">Date</Label>
                <Input id="book-date" type="date" min={rwandaDateKey()} value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="book-time">Time</Label>
                {availableDays.length > 0 ? (
                  <Select value={finalTime} onValueChange={setTime}>
                    <SelectTrigger id="book-time" aria-label="Session time" disabled={timeOptions.length === 0}>
                      <SelectValue placeholder={timeOptions.length === 0 ? 'No available times' : 'Choose a time'} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="book-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                )}
                {availableDays.length > 0 && daySlots.length === 0 && selectedDayName ? (
                  <p className="text-xs text-hub-muted">No listed hours on {selectedDayName} — pick another day.</p>
                ) : null}
                {availableDays.length > 0 && daySlots.length > 0 && timeOptions.length === 0 ? (
                  <p className="text-xs text-hub-muted">
                    {date === rwandaDateKey() ? 'No remaining times today.' : 'No times fit the professional’s hours on this date.'} Choose another day.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Session type</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Video call">Video call</SelectItem>
                  <SelectItem value="Audio call">Audio call</SelectItem>
                  <SelectItem value="Secure chat">Secure chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="book-notes">Anything your professional should know (optional)</Label>
              <Input id="book-notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Optional — e.g. what you'd like to talk about" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>Cancel</Button>
            <Button onClick={book} disabled={submitting}>{submitting ? 'Requesting…' : 'Request appointment'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
