import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Check, CheckCheck, Lock, Search, Send, ShieldAlert } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { formatRelative, formatTime, initials } from '../../lib/format'
import { providerPhoto } from '../../lib/images'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/auth-context'
import { useConversation, useConversations, useMarkConversationRead, useReportConversation, useSendMessage } from '../../services/conversations'
import type { Message } from '../../types'

const REPORT_REASONS = [
  'Disrespectful or unprofessional behaviour',
  'Inappropriate messages',
  'Feeling unsafe',
  'Suspected fraud',
  'Other',
]

function dayLabel(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (same(date, today)) return 'Today'
  if (same(date, yesterday)) return 'Yesterday'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export default function Messages() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const conversations = useConversations()
  const thread = useConversation(conversationId ?? '')
  const sendMutation = useSendMessage()
  const markRead = useMarkConversationRead()
  const reportMutation = useReportConversation()

  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [query, setQuery] = useState('')
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0])
  const [reportOpen, setReportOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const base = user?.role === 'PROFESSIONAL' ? '/professional' : '/app'
  const summaries = conversations.data?.data.conversations ?? []
  const active = summaries.find((c) => c.id === conversationId)
  const messages = thread.data?.data.messages ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return summaries
    return summaries.filter(
      (c) => c.participantName.toLowerCase().includes(q) || (c.lastMessagePreview ?? '').toLowerCase().includes(q),
    )
  }, [summaries, query])

  useEffect(() => {
    if (conversationId) void markRead.mutateAsync(conversationId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, conversationId])

  async function send() {
    if (!conversationId || !draft.trim()) return
    setSending(true)
    try {
      await sendMutation.mutateAsync({ conversationId, body: draft.trim() })
      setDraft('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send your message.')
    } finally {
      setSending(false)
    }
  }

  async function report() {
    if (!conversationId) return
    try {
      await reportMutation.mutateAsync({ id: conversationId, reason: reportReason })
      setReportOpen(false)
      toast.success('Reported. A human reviewer will look into it.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not report.')
    }
  }

  return (
    <div>
      <PageHeader title="Messages" description="Private, secure conversations with your support professional." />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className={cn('lg:col-span-1', conversationId && 'hidden lg:block')}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            <div className="border-b border-slate-100 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" placeholder="Search conversations" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>

            {conversations.isLoading ? (
              <Loading label="Loading conversations…" />
            ) : summaries.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No conversations yet"
                  description="Start a conversation directly from any professional's profile."
                  action={<Link to="/professionals"><Button size="sm" variant="outline">Find support</Button></Link>}
                />
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-hub-muted">No conversations match “{query}”.</p>
            ) : (
              <ul className="max-h-[60vh] overflow-y-auto">
                {filtered.map((c) => {
                  const isActive = c.id === conversationId
                  return (
                    <li key={c.id}>
                      <Link
                        to={`${base}/messages/${c.id}`}
                        className={cn(
                          'flex items-center gap-3 border-b border-slate-100 px-3 py-3 transition-colors last:border-0',
                          isActive ? 'bg-hub-primary-light/70' : 'hover:bg-slate-50',
                        )}
                      >
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarImage src={providerPhoto(c.id)} alt="" />
                          <AvatarFallback>{initials(c.participantName)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn('truncate text-sm', c.unreadCount > 0 ? 'font-semibold text-hub-text' : 'font-medium text-hub-text')}>
                              {c.participantName}
                            </p>
                            <span className="shrink-0 text-[11px] text-slate-400">{c.lastMessageAt ? formatRelative(c.lastMessageAt) : ''}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn('truncate text-xs', c.unreadCount > 0 ? 'text-hub-text' : 'text-hub-muted')}>
                              {c.lastMessagePreview || 'Support conversation'}
                            </p>
                            {c.unreadCount > 0 && (
                              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-hub-primary px-1.5 text-[10px] font-bold text-white">
                                {c.unreadCount > 9 ? '9+' : c.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div className={cn('lg:col-span-2', !conversationId && 'hidden lg:block')}>
          {!conversationId ? (
            <div className="grid h-full min-h-[50vh] place-items-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
              <div>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-hub-primary-light text-hub-primary">
                  <Lock className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-semibold text-hub-text">Your private conversations</h2>
                <p className="mt-1 text-sm text-hub-muted">Select a conversation to read and reply. Everything stays between you and your professional.</p>
              </div>
            </div>
          ) : thread.isLoading ? (
            <Loading label="Loading conversation…" />
          ) : (
            <div className="flex h-[70vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 shrink-0 rounded-full p-0 lg:hidden"
                    aria-label="Back to conversations"
                    onClick={() => navigate(`${base}/messages`)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={providerPhoto(conversationId ?? 'conversation')} alt="" />
                    <AvatarFallback>{initials(active?.participantName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-hub-text">{active?.participantName ?? 'Conversation'}</p>
                    <p className="flex items-center gap-1 text-xs text-hub-muted">
                      <Lock className="h-3 w-3" /> End-to-end private
                    </p>
                  </div>
                </div>
                <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="inline-flex shrink-0 items-center gap-1 text-hub-muted">
                      <ShieldAlert className="h-4 w-4" /> Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Report this conversation</DialogTitle>
                      <DialogDescription>
                        A human reviewer will look into it carefully. This is private and never shared with the other person.
                      </DialogDescription>
                    </DialogHeader>
                    <div>
                      <select
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                      >
                        {REPORT_REASONS.map((r) => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setReportOpen(false)}>Keep conversation</Button>
                      <Button variant="ghost" className="text-hub-danger" disabled={reportMutation.isPending} onClick={() => void report()}>
                        {reportMutation.isPending ? 'Submitting…' : 'Submit report'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto bg-slate-50/40 px-4 py-4">
                {messages.length === 0 && (
                  <p className="py-10 text-center text-sm text-hub-muted">Say hello to start the conversation. Your messages are private.</p>
                )}
                {messages.map((m: Message, i) => {
                  const fromMe = String(m.sender) === user?.id
                  const prev = messages[i - 1]
                  const showDay = !prev || !isDaySame(prev.createdAt, m.createdAt)
                  const grouped = prev && !showDay && String(prev.sender) === String(m.sender)
                  return (
                    <div key={m._id}>
                      {showDay && (
                        <div className="my-3 flex items-center justify-center">
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-400 shadow-sm">
                            {dayLabel(m.createdAt)}
                          </span>
                        </div>
                      )}
                      <div className={cn('flex', fromMe ? 'justify-end' : 'justify-start', grouped ? 'mt-0.5' : 'mt-2')}>
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                            fromMe ? 'rounded-br-md bg-hub-primary text-white' : 'rounded-bl-md bg-white text-hub-text',
                          )}
                        >
                          <p className="whitespace-pre-line break-words">{m.body}</p>
                          <p className={cn('mt-1 flex items-center justify-end gap-1 text-[10px]', fromMe ? 'text-white/70' : 'text-slate-400')}>
                            {m.createdAt ? formatTime(m.createdAt) : ''}
                            {fromMe && (m.status === 'read' ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-slate-100 bg-white p-3">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        void send()
                      }
                    }}
                    placeholder="Write a private message… (Enter to send, Shift+Enter for a new line)"
                    className="min-h-[44px] max-h-32"
                  />
                  <Button onClick={send} disabled={sending || !draft.trim()} className="h-11 w-11 shrink-0 rounded-xl p-0" aria-label="Send message">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function isDaySame(a?: string, b?: string): boolean {
  if (!a || !b) return false
  return new Date(a).toDateString() === new Date(b).toDateString()
}
