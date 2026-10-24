import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AudioLines, ArrowLeft, FileText, LoaderCircle, Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff, Volume2 } from 'lucide-react'
import { Room, RoomEvent, Track, type LocalTrack, type RemoteParticipant, type RemoteTrack } from 'livekit-client'
import { Button } from '../components/ui/button'
import { initials } from '../lib/format'
import { ApiError } from '../lib/api'
import { useAuth } from '../hooks/auth-context'
import { useOpenAppointmentSession } from '../services/conversations'

type JoinDetails = {
  livekitUrl: string
  token: string
  callType: 'Audio call' | 'Video call'
  otherParticipantName: string
}

function VideoTrack({ track, muted = false, label }: { track?: LocalTrack | RemoteTrack; muted?: boolean; label: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const element = videoRef.current
    if (!track || track.kind !== Track.Kind.Video || !element) return
    track.attach(element)
    return () => { track.detach(element) }
  }, [track])

  if (!track || track.kind !== Track.Kind.Video) return null
  return <video ref={videoRef} autoPlay playsInline muted={muted} aria-label={`${label} camera`} className="h-full w-full object-cover" />
}

function RemoteAudio({ track }: { track?: RemoteTrack }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    const element = audioRef.current
    if (!track || track.kind !== Track.Kind.Audio || !element) return
    track.attach(element)
    return () => { track.detach(element) }
  }, [track])
  return <audio ref={audioRef} autoPlay className="hidden" />
}

function participantCamera(participant: RemoteParticipant | Room['localParticipant']) {
  return participant.getTrackPublication(Track.Source.Camera)?.track as LocalTrack | RemoteTrack | undefined
}

function participantScreen(participant: RemoteParticipant | Room['localParticipant']) {
  return participant.getTrackPublication(Track.Source.ScreenShare)?.track as LocalTrack | RemoteTrack | undefined
}

function readCallNotes(key: string) {
  try {
    return sessionStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function writeCallNotes(key: string, notes: string) {
  try {
    if (notes) sessionStorage.setItem(key, notes)
    else sessionStorage.removeItem(key)
  } catch {
    // Notes remain available for the current call even when browser storage is disabled.
  }
}

export default function CallRoom() {
  const { appointmentId = '' } = useParams<{ appointmentId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const session = useOpenAppointmentSession()
  const [details, setDetails] = useState<JoinDetails | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState('')
  const [mediaError, setMediaError] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [connected, setConnected] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)
  const [screenShareOn, setScreenShareOn] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [callNotes, setCallNotes] = useState('')
  const [playbackBlocked, setPlaybackBlocked] = useState(false)
  const [participantRevision, setParticipantRevision] = useState(0)
  const base = user?.role === 'PROFESSIONAL' ? '/professional' : '/app'
  const notesStorageKey = `nsangiza-call-notes:${user?.id ?? 'guest'}:${appointmentId}`
  const refreshParticipants = useCallback(() => setParticipantRevision((revision) => revision + 1), [])

  useEffect(() => {
    setCallNotes(readCallNotes(notesStorageKey))
  }, [notesStorageKey])

  useEffect(() => {
    writeCallNotes(notesStorageKey, callNotes)
  }, [callNotes, notesStorageKey])

  useEffect(() => {
    let active = true
    session.mutateAsync(appointmentId).then((result) => {
      if (!active) return
      const data = result.data
      if (!data.livekitUrl || !data.token || !data.callType) {
        setError('LiveKit is not configured for calls yet. Add the LiveKit URL, API key, and API secret to the server environment.')
      } else {
        setDetails({
          livekitUrl: data.livekitUrl,
          token: data.token,
          callType: data.callType as JoinDetails['callType'],
          otherParticipantName: data.otherParticipantName ?? 'Your appointment partner',
        })
      }
      setLoading(false)
    }).catch((err: unknown) => {
      if (active) {
        setError(err instanceof ApiError ? err.message : 'Could not open this call.')
        setLoading(false)
      }
    })
    return () => { active = false }
    // The appointment ID identifies this call; don't request a fresh token on mutation state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId])

  useEffect(() => () => { void room?.disconnect() }, [room])

  async function joinCall() {
    if (!details || joining || room) return
    setJoining(true)
    setMediaError('')
    const nextRoom = new Room({ adaptiveStream: true, dynacast: true })
    nextRoom
      .on(RoomEvent.TrackSubscribed, refreshParticipants)
      .on(RoomEvent.TrackUnsubscribed, refreshParticipants)
      .on(RoomEvent.LocalTrackPublished, refreshParticipants)
      .on(RoomEvent.LocalTrackUnpublished, (publication) => {
        if (publication.source === Track.Source.ScreenShare) setScreenShareOn(false)
        refreshParticipants()
      })
      .on(RoomEvent.ParticipantConnected, refreshParticipants)
      .on(RoomEvent.ParticipantDisconnected, refreshParticipants)
      .on(RoomEvent.AudioPlaybackStatusChanged, () => setPlaybackBlocked(!nextRoom.canPlaybackAudio))
      .on(RoomEvent.MediaDevicesError, (deviceError) => setMediaError(deviceError.message || 'Check your microphone and camera permissions.'))
      .on(RoomEvent.Disconnected, () => setConnected(false))

    try {
      await nextRoom.connect(details.livekitUrl, details.token)
      setRoom(nextRoom)
      setConnected(true)
      refreshParticipants()
      try {
        if (details.callType === 'Audio call') {
          await nextRoom.localParticipant.setMicrophoneEnabled(true)
          setMicOn(true)
          setCameraOn(false)
        } else {
          await nextRoom.localParticipant.enableCameraAndMicrophone()
          setMicOn(true)
          setCameraOn(true)
        }
      } catch {
        setMediaError('Allow microphone and camera access in your browser to share audio and video. You can also join with your camera or microphone off.')
        setMicOn(false)
        setCameraOn(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to the call. Check your network and try again.')
      await nextRoom.disconnect()
    } finally {
      setJoining(false)
    }
  }

  async function toggleMic() {
    if (!room) return
    try {
      await room.localParticipant.setMicrophoneEnabled(!micOn)
      setMicOn(!micOn)
      setMediaError('')
    } catch {
      setMediaError('Allow microphone access in your browser to turn on your microphone.')
    }
  }

  async function toggleCamera() {
    if (!room || details?.callType === 'Audio call') return
    try {
      await room.localParticipant.setCameraEnabled(!cameraOn)
      setCameraOn(!cameraOn)
      setMediaError('')
      refreshParticipants()
    } catch {
      setMediaError('Allow camera access in your browser to turn on your camera.')
    }
  }

  async function toggleScreenShare() {
    if (!room || details?.callType !== 'Video call') return
    try {
      const publication = await room.localParticipant.setScreenShareEnabled(!screenShareOn)
      setScreenShareOn(Boolean(publication))
      setMediaError('')
      refreshParticipants()
    } catch {
      setMediaError('Screen sharing was cancelled or is not available in this browser.')
    }
  }

  async function leaveCall() {
    await room?.disconnect()
    navigate(`${base}/appointments`)
  }

  const remoteParticipants = room ? [...room.remoteParticipants.values()] : []
  // Re-render video tiles when LiveKit publishes or removes a track.
  void participantRevision

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" className="shrink-0 text-white hover:bg-white/10 hover:text-white" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Back</span>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold sm:text-base">{details?.callType === 'Audio call' ? 'Audio call' : 'Video call'}</h1>
            <p className="truncate text-xs text-slate-400">With {details?.otherParticipantName ?? 'your appointment partner'}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 text-xs text-slate-300" role="status">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          {connected ? 'Connected' : loading ? 'Checking appointment…' : joining ? 'Joining…' : 'Ready to join'}
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-3 sm:p-6">
        {error ? (
          <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center sm:p-8">
            <p className="font-semibold">Call unavailable</p>
            <p className="mt-2 break-words text-sm text-slate-300">{error}</p>
            <Button className="mt-5" onClick={() => navigate(`${base}/appointments`)}>Back to appointments</Button>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-3 text-sm text-slate-300"><LoaderCircle className="h-5 w-5 animate-spin" />Checking your appointment…</div>
        ) : !connected ? (
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl sm:p-10">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-hub-primary/20 text-hub-primary"><Video className="h-7 w-7" /></span>
            <h2 className="mt-5 text-xl font-semibold">Your call is ready</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Join the private appointment call with {details?.otherParticipantName}. Your browser will ask before using your microphone{details?.callType === 'Video call' ? ' and camera' : ''}.</p>
            {mediaError && <p role="alert" className="mt-3 text-sm text-amber-300">{mediaError}</p>}
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Button onClick={() => void joinCall()} disabled={joining}>{joining ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}{joining ? 'Joining…' : 'Join call'}</Button>
              <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10" onClick={() => navigate(`${base}/appointments`)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 w-full max-w-7xl flex-1 flex-col">
            {mediaError && <p role="alert" className="mb-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-200">{mediaError}</p>}
            {playbackBlocked && <Button variant="outline" className="mb-3 self-center border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => { void room?.startAudio(); setPlaybackBlocked(false) }}><Volume2 className="h-4 w-4" />Enable call audio</Button>}
            <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid content-center gap-3 sm:gap-4 md:grid-cols-2">
              {room && participantScreen(room.localParticipant) && (
                <section className="relative aspect-video overflow-hidden rounded-2xl border border-hub-primary/60 bg-slate-900 md:col-span-2">
                  <VideoTrack track={participantScreen(room.localParticipant) as LocalTrack} muted label="Your shared screen" />
                  <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1 text-sm">Your screen</span>
                </section>
              )}
              <section className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
                <VideoTrack track={cameraOn && room ? participantCamera(room.localParticipant) as LocalTrack | undefined : undefined} muted label="You" />
                {!cameraOn && <div className="absolute inset-0 grid place-items-center"><span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold">{initials(user?.displayName)}</span></div>}
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1 text-sm">You {!micOn && '· muted'}</span>
              </section>
              {remoteParticipants.length === 0 ? (
                <section className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900 px-4 text-center">
                  <div><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold">{initials(details?.otherParticipantName)}</span><p className="mt-4 text-sm text-slate-300">Waiting for {details?.otherParticipantName} to join…</p></div>
                </section>
              ) : remoteParticipants.map((participant) => {
                const camera = participantCamera(participant) as RemoteTrack | undefined
                const sharedScreen = participantScreen(participant) as RemoteTrack | undefined
                const audio = participant.getTrackPublication(Track.Source.Microphone)?.track as RemoteTrack | undefined
                return (
                  <section key={participant.identity} className={`relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-slate-900 ${sharedScreen ? 'md:col-span-2' : ''}`}>
                    {sharedScreen && <VideoTrack track={sharedScreen} label={`${participant.name || details?.otherParticipantName || 'Participant'} shared screen`} />}
                    {!sharedScreen && <VideoTrack track={camera} label={participant.name || details?.otherParticipantName || 'Participant'} />}
                    <RemoteAudio track={audio} />
                    {!camera && !sharedScreen && <div className="absolute inset-0 grid place-items-center"><span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold">{initials(participant.name || details?.otherParticipantName)}</span></div>}
                    <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1 text-sm">{sharedScreen ? `${participant.name || details?.otherParticipantName} · shared screen` : participant.name || details?.otherParticipantName}</span>
                  </section>
                )
              })}
            </div>
            {notesOpen && (
              <aside className="flex min-h-48 flex-col rounded-2xl border border-white/10 bg-white/5 p-4 lg:min-h-0">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="call-notes" className="text-sm font-semibold">Private notes</label>
                  <button type="button" onClick={() => setCallNotes('')} disabled={!callNotes} className="text-xs text-slate-400 hover:text-white disabled:opacity-40">Clear</button>
                </div>
                <p className="mt-1 text-xs text-slate-400">Saved in this browser tab only. Notes are not sent to the other participant.</p>
                <textarea id="call-notes" value={callNotes} onChange={(event) => setCallNotes(event.target.value)} placeholder="Write a note…" className="mt-3 min-h-32 flex-1 resize-y rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-hub-primary" />
              </aside>
            )}
            </div>
            <div className="flex justify-center gap-3 py-5 sm:gap-4">
              <Button size="icon" variant={micOn ? 'secondary' : 'danger'} onClick={() => void toggleMic()} aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}>
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              {details?.callType === 'Video call' && (
                <Button size="icon" variant={cameraOn ? 'secondary' : 'danger'} onClick={() => void toggleCamera()} aria-label={cameraOn ? 'Turn camera off' : 'Turn camera on'}>
                  {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              )}
              {details?.callType === 'Video call' && (
                <Button size="icon" variant={screenShareOn ? 'secondary' : 'outline'} className={!screenShareOn ? 'border-white/20 bg-transparent text-white hover:bg-white/10' : undefined} onClick={() => void toggleScreenShare()} aria-label={screenShareOn ? 'Stop sharing screen' : 'Share screen'}>
                  <MonitorUp className="h-5 w-5" />
                </Button>
              )}
              <Button size="icon" variant={notesOpen ? 'secondary' : 'outline'} className={!notesOpen ? 'border-white/20 bg-transparent text-white hover:bg-white/10' : undefined} onClick={() => setNotesOpen((open) => !open)} aria-label={notesOpen ? 'Close private notes' : 'Open private notes'}>
                <FileText className="h-5 w-5" />
              </Button>
              {details?.callType === 'Audio call' && <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-300" aria-label="Audio call"><AudioLines className="h-5 w-5" /></span>}
              <Button size="icon" variant="danger" onClick={() => void leaveCall()} aria-label="Leave call"><PhoneOff className="h-5 w-5" /></Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
