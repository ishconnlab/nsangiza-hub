import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Check, CheckCheck, FileText, Image as ImageIcon, Lock, Mic, Paperclip, Phone, Search, Send, ShieldAlert, Smile, Square, Video, X } from 'lucide-react'
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
import { get } from '../../lib/api'
import { useConversation, useConversations, useMarkConversationRead, useReportConversation, useSendMessage } from '../../services/conversations'
import type { Message } from '../../types'

const REPORT_REASONS = [
  'Disrespectful or unprofessional behaviour',
  'Inappropriate messages',
  'Feeling unsafe',
  'Suspected fraud',
  'Other',
]
const CHAT_EMOJIS = ['\u{1F60A}', '\u2764\uFE0F', '\u{1F64F}', '\u{1F44D}', '\u{1F602}', '\u{1F979}', '\u2728', '\u{1F917}']
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
const ALLOWED_FILES: Record<string, string> = {
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'image/webp': 'image/webp',
  'application/pdf': 'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword': 'application/msword',
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read this file.'))
    reader.onerror = () => reject(new Error('Could not read this file.'))
    reader.readAsDataURL(file)
  })
}

function MessageAttachment({ message, conversationId }: { message: Message; conversationId: string }) {
  const [dataUrl, setDataUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const attachment = message.attachment
  if (!attachment) return null

  async function loadAttachment() {
    if (dataUrl || loading) return
    setLoading(true)
    try {
      const result = await get<{ attachment: { dataUrl: string } }>(`/conversations/${conversationId}/messages/${message._id}/attachment`)
      setDataUrl(result.data.attachment.dataUrl)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not load this attachment.')
    } finally {
      setLoading(false)
    }
  }

  if (message.kind === 'audio') {
    return dataUrl ? <audio controls preload="none" src={dataUrl} className="mt-1 h-10 max-w-full" /> : (
      <Button type="button" size="sm" variant="secondary" className="mt-1" onClick={() => void loadAttachment()} disabled={loading}>
        <Mic className="h-4 w-4" />{loading ? 'Loading voice message…' : 'Play voice message'}
      </Button>
    )
  }
  if (attachment.mimeType.startsWith('image/')) {
    return dataUrl ? (
      <a href={dataUrl} download={attachment.name} className="mt-1 block">
        <img src={dataUrl} alt={attachment.name} loading="lazy" className="max-h-64 max-w-full rounded-xl object-contain" />
      </a>
    ) : (
      <Button type="button" size="sm" variant="secondary" className="mt-1" onClick={() => void loadAttachment()} disabled={loading}>
        <ImageIcon className="h-4 w-4" />{loading ? 'Loading image…' : 'View image'}
      </Button>
    )
  }
  return dataUrl ? (
    <a href={dataUrl} download={attachment.name} className="mt-1 flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 underline underline-offset-2">
      <FileText className="h-4 w-4 shrink-0" /><span className="break-all">{attachment.name}</span>
    </a>
  ) : (
    <Button type="button" size="sm" variant="secondary" className="mt-1 max-w-full" onClick={() => void loadAttachment()} disabled={loading}>
      <FileText className="h-4 w-4 shrink-0" /><span className="truncate">{loading ? 'Loading document…' : `Download ${attachment.name}`}</span>
    </Button>
  )
}

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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mountedRef = useRef(true)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [recording, setRecording] = useState(false)

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
    if (conversationId) markRead.mutate(conversationId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, conversationId])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

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

  async function sendFile(file: File, kind: 'audio' | 'attachment') {
    if (!conversationId) return
    if (file.size === 0 || file.size > MAX_ATTACHMENT_BYTES) {
      toast.error('Files must be between 1 byte and 5 MB.')
      return
    }
    const extension = file.name.toLowerCase().split('.').pop()
    const extensionMime: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', pdf: 'application/pdf',
      doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }
    const mimeType = ALLOWED_FILES[file.type] ?? extensionMime[extension ?? ''] ?? (kind === 'audio' && ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg'].includes(file.type) ? file.type : '')
    if (!mimeType) {
      toast.error('Use a PNG, JPG, WebP, PDF, Word, or voice recording file.')
      return
    }
    setSending(true)
    try {
      const dataUrl = await readFile(file)
      await sendMutation.mutateAsync({
        conversationId,
        kind,
        attachment: { name: file.name, mimeType, dataUrl, size: file.size },
      })
      toast.success(kind === 'audio' ? 'Voice message sent.' : 'Attachment sent.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send this file.')
    } finally {
      setSending(false)
    }
  }

  async function toggleRecording() {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
      return
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      toast.error('Voice recording is not supported by this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      const supportedMime = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(stream, supportedMime ? { mimeType: supportedMime } : undefined)
      const chunks: Blob[] = []
      let totalBytes = 0
      let tooLarge = false
      recorder.ondataavailable = (event) => {
        if (!event.data.size) return
        totalBytes += event.data.size
        if (totalBytes > MAX_ATTACHMENT_BYTES) {
          tooLarge = true
          recorder.stop()
          return
        }
        chunks.push(event.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        if (streamRef.current === stream) streamRef.current = null
        if (recorderRef.current === recorder) recorderRef.current = null
        if (!mountedRef.current) return
        setRecording(false)
        if (tooLarge) {
          toast.error('Voice messages must be 5 MB or smaller. Please record a shorter message.')
          return
        }
        const mimeType = (recorder.mimeType || 'audio/webm').split(';')[0]
        const extension = mimeType === 'audio/ogg' ? 'ogg' : mimeType === 'audio/mp4' ? 'm4a' : mimeType === 'audio/mpeg' ? 'mp3' : 'webm'
        const file = new File([new Blob(chunks, { type: mimeType })], `voice-message.${extension}`, { type: mimeType })
        await sendFile(file, 'audio')
      }
      recorder.start(1000)
      recorderRef.current = recorder
      setRecording(true)
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      toast.error('Allow microphone access to record a voice message.')
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
                      <Lock className="h-3 w-3" /> Private one-to-one conversation
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {thread.data?.data.conversation.callAppointmentId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="inline-flex items-center gap-1"
                      onClick={() => navigate(`${base}/call/${thread.data!.data.conversation.callAppointmentId}`)}
                      aria-label={`Start ${thread.data.data.conversation.callType === 'Audio call' ? 'audio' : 'video'} call`}
                    >
                      {thread.data.data.conversation.callType === 'Audio call' ? <Phone className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                      <span className="hidden sm:inline">Call</span>
                    </Button>
                  )}
                  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="inline-flex items-center gap-1 text-hub-muted">
                        <ShieldAlert className="h-4 w-4" /><span className="hidden sm:inline">Report</span>
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
                          {m.body ? <p className="whitespace-pre-line break-words">{m.body}</p> : null}
                          <MessageAttachment message={m} conversationId={conversationId ?? ''} />
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
                {recording && <p role="status" className="mb-2 text-xs font-medium text-hub-danger">Recording voice message · tap stop to send · 5 MB limit</p>}
                {emojiOpen && (
                  <div className="mb-2 flex flex-wrap gap-1 rounded-xl bg-slate-50 p-2" aria-label="Choose an emoji">
                    {CHAT_EMOJIS.map((emoji) => <button key={emoji} type="button" className="rounded-lg p-2 text-xl hover:bg-white" onClick={() => setDraft((current) => `${current}${emoji}`)} aria-label={`Insert ${emoji}`}>{emoji}</button>)}
                    <button type="button" className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white" onClick={() => setEmojiOpen(false)} aria-label="Close emoji picker"><X className="h-4 w-4" /></button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void sendFile(file, 'attachment')
                    event.currentTarget.value = ''
                  }}
                />
                <div className="flex items-end gap-2">
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button type="button" size="sm" variant="ghost" className="h-10 w-10 p-0" onClick={() => setEmojiOpen((value) => !value)} disabled={sending} aria-label="Add emoji"><Smile className="h-5 w-5" /></Button>
                    <Button type="button" size="sm" variant="ghost" className="h-10 w-10 p-0" onClick={() => fileInputRef.current?.click()} disabled={sending || recording} aria-label="Attach image or document"><Paperclip className="h-5 w-5" /></Button>
                    <Button type="button" size="sm" variant={recording ? 'danger' : 'ghost'} className="h-10 w-10 p-0" onClick={() => void toggleRecording()} disabled={sending} aria-label={recording ? 'Stop and send voice message' : 'Record voice message'}>
                      {recording ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
                    </Button>
                  </div>
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
                  <Button onClick={() => void send()} disabled={sending || !draft.trim()} className="h-11 w-11 shrink-0 rounded-xl p-0" aria-label="Send message">
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
