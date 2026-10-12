import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { ExternalLink, FileText, ShieldCheck, Trash2, UploadCloud } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { PageHeader, Loading } from '../../components/PageHeader'
import { ApiError } from '../../lib/api'
import { openSecureDocument } from '../../lib/documents'
import { useDeleteProfessionalDocument, useProfessionalProfile, useSubmitProfessionalApplication, useUpdateProfessionalProfile, useUploadProfessionalDocument } from '../../services/professional'
import { CITIES, LANGUAGES, SUPPORT_CATEGORIES } from '../../lib/constants'
import type { ProfessionalDocument, SessionType } from '../../types'

const SESSION_TYPES: SessionType[] = ['Secure chat', 'Audio call', 'Video call', 'In-person']
const PROVIDER_TYPES = ['Psychologist', 'Counsellor', 'Social worker', 'Peer supporter', 'Clinical psychologist', 'Psychiatric nurse']

export default function ProProfile() {
  const { data, isLoading } = useProfessionalProfile()
  const update = useUpdateProfessionalProfile()
  const submit = useSubmitProfessionalApplication()
  const upload = useUploadProfessionalDocument()
  const remove = useDeleteProfessionalDocument()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [providerType, setProviderType] = useState('')
  const [title, setTitle] = useState('')
  const [about, setAbout] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [experienceYears, setExperienceYears] = useState('')
  const [qualifications, setQualifications] = useState<{ title: string; institution: string }[]>([{ title: '', institution: '' }])
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])
  const [pricePerSession, setPricePerSession] = useState('')
  const [documents, setDocuments] = useState<ProfessionalDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!data?.data.professional) return
    const p = data.data.professional
    setName(p.name ?? '')
    setProviderType(p.providerType ?? '')
    setTitle(p.title ?? '')
    setAbout(p.about ?? '')
    setCity(p.city ?? '')
    setLocation(p.location ?? '')
    setLanguages(p.languages ?? ['Kinyarwanda'])
    setSpecializations(p.specializations ?? [])
    setExperienceYears(p.experienceYears != null ? String(p.experienceYears) : '')
    setQualifications(p.qualifications?.length ? p.qualifications.map((q) => ({ title: q.title, institution: q.institution })) : [{ title: '', institution: '' }])
    setSessionTypes(p.sessionTypes ?? [])
    setPricePerSession(p.pricePerSession != null ? String(p.pricePerSession) : '')
    setDocuments(p.documents ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.data.professional])

  if (isLoading) return <Loading label="Loading your profile…" />

  const pro = data?.data.professional
  const verification = pro?.verification.status

  async function save() {
    setBusy(true)
    try {
      await update.mutateAsync({
        name,
        providerType,
        title,
        about,
        city,
        location,
        languages,
        specializations,
        supportAreas: specializations,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        qualifications: qualifications.filter((q) => q.title.trim()).map((q) => ({ ...q, institution: q.institution || 'Private practice' })),
        sessionTypes,
        pricePerSession: pricePerSession ? Number(pricePerSession) : undefined,
      })
      toast.success('Profile saved.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save your profile.')
    } finally {
      setBusy(false)
    }
  }

  async function submitApplication() {
    setBusy(true)
    try {
      await submit.mutateAsync()
      toast.success('Application submitted for review.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not submit.')
    } finally {
      setBusy(false)
    }
  }

  async function onFile(ev: ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0]
    ev.target.value = ''
    if (!file) return
    const okType = file.type === 'application/pdf' || /^image\/(jpeg|png|webp)$/.test(file.type)
    if (!okType) {
      toast.error('Please choose a PDF, JPG, PNG or WebP file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5 MB.')
      return
    }
    setUploading(true)
    const reader = new FileReader()
    reader.onerror = () => {
      setUploading(false)
      toast.error('Could not read that file. Try another one.')
    }
    reader.onload = async () => {
      try {
        await upload.mutateAsync({ label: file.name, fileName: file.name, dataUrl: String(reader.result) })
        toast.success('Document uploaded for review.')
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Upload failed.')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  async function removeDocument(docId: string) {
    setDeletingId(docId)
    try {
      await remove.mutateAsync(docId)
      toast.success('Document removed.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not remove the document.')
    } finally {
      setDeletingId(null)
    }
  }

  const DOC_STATUS_VARIANT: Record<ProfessionalDocument['status'], 'success' | 'warning' | 'danger'> = {
    verified: 'success',
    pending: 'warning',
    rejected: 'danger',
  }

  return (
    <div>
      <PageHeader
        title="Professional profile"
        description="Tell users who you are and how you can help. Once complete, submit for verification to be discoverable."
        actions={
          verification === 'Approved' ? (
            <Badge variant="success" className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>
          ) : verification === 'Submitted' ? (
            <Badge variant="warning">Under review</Badge>
          ) : (
            <Badge>Not verified</Badge>
          )
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
            <CardDescription>Your public name and provider type matter for matching.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pr-name">Full name</Label>
                <Input id="pr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Marie Claire Uwase" />
              </div>
              <div className="space-y-1.5">
                <Label>Provider type</Label>
                <Select value={providerType} onValueChange={setProviderType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PROVIDER_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pr-title">Title / specialty</Label>
                <Input id="pr-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Trauma-informed counsellor" />
              </div>
              <div className="space-y-1.5">
                <Label>City / district</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-loc">Practice location (for in-person sessions)</Label>
              <Input id="pr-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kacyiru, Kigali" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-about">About you</Label>
              <Textarea id="pr-about" value={about} onChange={(e) => setAbout(e.target.value)} maxLength={2000} rows={4} placeholder="How you help, your approach and what clients can expect…" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>What you offer</CardTitle>
              <CardDescription>The more specific, the better the matches.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button key={l} type="button" onClick={() => setLanguages((s) => (s.includes(l) ? s.filter((x) => x !== l) : [...s, l]))}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${languages.includes(l) ? 'bg-hub-primary text-white' : 'bg-slate-100 text-hub-muted hover:bg-slate-200'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Support areas</Label>
                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                  {SUPPORT_CATEGORIES.map((s) => (
                    <button key={s} type="button" onClick={() => setSpecializations((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${specializations.includes(s) ? 'bg-hub-primary text-white' : 'bg-slate-100 text-hub-muted hover:bg-slate-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Session types</Label>
                  <div className="flex flex-wrap gap-2">
                    {SESSION_TYPES.map((t) => (
                      <button key={t} type="button" onClick={() => setSessionTypes((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))}
                        className={`rounded-full px-3 py-1 text-xs transition-colors ${sessionTypes.includes(t) ? 'bg-hub-secondary text-white' : 'bg-slate-100 text-hub-muted hover:bg-slate-200'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pr-price">Fee per session (RWF)</Label>
                  <Input id="pr-price" type="number" min={0} value={pricePerSession} onChange={(e) => setPricePerSession(e.target.value)} placeholder="e.g. 10000" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualifications & documents</CardTitle>
              <CardDescription>Needed for verification by our safeguarding team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {qualifications.map((q, i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-2">
                  <Input value={q.title} onChange={(e) => setQualifications((s) => s.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Qualification / degree" />
                  <Input value={q.institution} onChange={(e) => setQualifications((s) => s.map((x, j) => (j === i ? { ...x, institution: e.target.value } : x)))} placeholder="Institution" />
                </div>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setQualifications((s) => [...s, { title: '', institution: '' }])}>+ Add qualification</Button>

              <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-300 px-4 py-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-hub-text"><UploadCloud className="h-4 w-4 text-hub-primary" /> Upload documents</p>
                  <p className="text-xs text-hub-muted">Upload your licence or degree certificate for verification. PDF, JPG, PNG or WebP, up to 5 MB.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading || verification === 'Approved'}>
                  {uploading ? 'Uploading…' : 'Choose file'}
                </Button>
                <input ref={fileInputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void onFile(e)} />
              </div>
              {verification === 'Approved' && documents.length === 0 ? (
                <p className="text-xs text-hub-muted">Your profile is verified, so documents are locked. Contact support if you need to update them.</p>
              ) : null}
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((d) => (
                    <div key={d._id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-hub-primary" />
                        <span className="truncate text-hub-text">{d.label}</span>
                        <Badge variant={DOC_STATUS_VARIANT[d.status]}>{d.status}</Badge>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {d.fileName ? (
                          <Button size="sm" variant="ghost" aria-label={`Open ${d.label}`} onClick={() => void openSecureDocument(d.fileName!)}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        ) : null}
                        {verification !== 'Approved' ? (
                          <Button size="sm" variant="ghost" className="text-hub-danger" aria-label={`Remove ${d.label}`} onClick={() => void removeDocument(d._id)} disabled={deletingId === d._id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <p className="text-sm text-hub-muted">
          {verification === 'Approved'
            ? 'Your profile is live and discoverable by users.'
            : verification === 'Submitted'
              ? 'Your application is being reviewed by the safeguarding team. This usually takes 2–3 working days.'
              : 'Once you are happy with your profile, submit it for review.'}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save draft'}</Button>
          {verification !== 'Approved' && verification !== 'Submitted' && (
            <Button onClick={submitApplication} disabled={busy}>Submit for verification</Button>
          )}
        </div>
      </div>
    </div>
  )
}