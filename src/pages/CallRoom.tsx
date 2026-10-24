import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, LoaderCircle, Video } from 'lucide-react'
import { Button } from '../components/ui/button'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../hooks/auth-context'
import { ApiError } from '../lib/api'
import { useOpenAppointmentSession } from '../services/conversations'

export default function CallRoom() {
  const { appointmentId = '' } = useParams<{ appointmentId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const session = useOpenAppointmentSession()
  const [roomName, setRoomName] = useState('')
  const [callType, setCallType] = useState('Video call')
  const [error, setError] = useState('')
  const base = user?.role === 'PROFESSIONAL' ? '/professional' : '/app'

  useEffect(() => {
    let mounted = true
    session.mutateAsync(appointmentId).then((result) => {
      if (mounted && result.data.roomName) {
        setRoomName(result.data.roomName)
        setCallType(result.data.callType ?? 'Video call')
      }
      else if (mounted) setError('This appointment does not include an audio or video call.')
    }).catch((err: unknown) => {
      if (mounted) setError(err instanceof ApiError ? err.message : 'Could not join this call.')
    })
    return () => { mounted = false }
    // The appointment ID identifies this one call; avoid reopening on mutation state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId])

  const roomUrl = roomName
    ? `https://meet.jit.si/${encodeURIComponent(roomName)}#config.prejoinPageEnabled=false&config.startWithVideoMuted=${callType === 'Audio call'}&userInfo.displayName=${encodeURIComponent(user?.displayName ?? 'Guest')}`
    : ''

  return (
    <div className="space-y-4">
      <PageHeader
        title="Private call"
        description={`${callType === 'Audio call' ? 'Audio' : 'Video'} call with your confirmed appointment partner.`}
        actions={<Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>}
      />
      {error ? (
        <div className="grid min-h-[45vh] place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div><p className="font-semibold text-hub-text">Call unavailable</p><p className="mt-2 text-sm text-hub-muted">{error}</p><Button className="mt-4" onClick={() => navigate(`${base}/appointments`)}>Back to appointments</Button></div>
        </div>
      ) : roomUrl ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-soft">
          <iframe title={`${callType} room`} src={roomUrl} allow="camera; microphone; fullscreen; display-capture; autoplay" className="h-[calc(100dvh-11rem)] min-h-[26rem] w-full border-0" />
          <div className="flex items-center justify-between gap-3 bg-white px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-hub-muted"><Video className="h-4 w-4 text-hub-primary" />Your appointment call</p>
            <a href={roomUrl} target="_blank" rel="noreferrer"><Button variant="outline" size="sm"><ExternalLink className="mr-2 h-4 w-4" />Open call in new tab</Button></a>
          </div>
        </div>
      ) : (
        <div className="grid min-h-[45vh] place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-hub-primary" /><p className="mt-3 text-sm text-hub-muted">Connecting to your private call…</p></div>
        </div>
      )}
    </div>
  )
}
