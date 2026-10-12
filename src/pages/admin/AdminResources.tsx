import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FilePlus2, Search } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { EmptyState, Loading, PageHeader } from '../../components/PageHeader'
import { formatDate } from '../../lib/format'
import { ApiError } from '../../lib/api'
import { useAdminResources, useCreateResource, useDeleteResource, useUpdateResource } from '../../services/admin'
import { adminKeys } from '../../services/admin'

export default function AdminResources() {
  const queryClient = useQueryClient()
  const [q, setQ] = useState('')
  const { data, isLoading } = useAdminResources({ q: q || undefined, pageSize: 50 })
  const createMutation = useCreateResource()
  const updateMutation = useUpdateResource()
  const deleteMutation = useDeleteResource()

  const [draft, setDraft] = useState({ title: '', slug: '', summary: '', body: '', category: '', language: 'English', readingTimeMin: 5, author: '', published: false })
  const [editing, setEditing] = useState<string | false>(false)
  const [busy, setBusy] = useState(false)

  const rows = data?.data.resources ?? []

  async function save() {
    if (!draft.title.trim()) return
    setBusy(true)
    try {
      const slug = draft.slug.trim() || draft.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      if (editing) {
        await updateMutation.mutateAsync({ id: editing as string, body: { ...draft, slug } })
        toast.success('Resource updated.')
      } else {
        await createMutation.mutateAsync({ ...draft, slug })
        toast.success('Resource created.')
      }
      setDraft({ title: '', slug: '', summary: '', body: '', category: '', language: 'English', readingTimeMin: 5, author: '', published: false })
      setEditing(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save resource.')
    } finally {
      setBusy(false)
    }
  }

  async function togglePublish(r: { id: string; published?: boolean }) {
    try {
      await updateMutation.mutateAsync({ id: r.id, body: { published: !r.published } })
      await queryClient.invalidateQueries({ queryKey: adminKeys.resources })
      toast.success(r.published ? 'Unpublished.' : 'Published.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update publish state.')
    }
  }

  async function remove(id: string) {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Resource deleted.')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not delete resource.')
    }
  }

  function startEdit(r: (typeof rows)[number]) {
    setEditing(r.id)
    setDraft({ title: r.title, slug: r.slug, summary: r.summary ?? '', body: r.body ?? '', category: r.category ?? '', language: r.language ?? 'English', readingTimeMin: r.readingTimeMin ?? 5, author: r.author ?? '', published: Boolean(r.published) })
  }

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Publish and manage articles, guides and self-care tools."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center gap-1.5"><FilePlus2 className="h-4 w-4" /> New resource</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit resource' : 'New resource'}</DialogTitle>
                <DialogDescription>A reviewed, published resource appears in the public library.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rs-title">Title</Label>
                  <Input id="rs-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rs-slug">Slug</Label>
                  <Input id="rs-slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="auto-filled from title" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rs-summary">Summary</Label>
                  <Textarea id="rs-summary" value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rs-body">Body</Label>
                  <Textarea id="rs-body" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={5} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Language</Label>
                    <Select value={draft.language} onValueChange={(v) => setDraft({ ...draft, language: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{['Kinyarwanda', 'English', 'French'].map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Author</Label>
                    <Input value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Reading time (min)</Label>
                    <Input type="number" min={1} value={draft.readingTimeMin} onChange={(e) => setDraft({ ...draft, readingTimeMin: Number(e.target.value) })} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="h-4 w-4 accent-hub-primary" />
                  Publish immediately
                </label>
              </div>
              <DialogFooter>
                <DialogTrigger asChild><Button variant="outline" onClick={() => { setEditing(false) }}>Cancel</Button></DialogTrigger>
                <Button onClick={save} disabled={busy || !draft.title.trim()}>{busy ? 'Saving…' : 'Save'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resources…" className="w-64 pl-9" />
        </div>
      </div>

      {isLoading ? (
        <Loading label="Loading resources…" />
      ) : rows.length === 0 ? (
        <EmptyState title="No resources yet" />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-hub-text">{r.title}</p>
                    {r.published ? <Badge variant="success">Published</Badge> : <Badge>Draft</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-hub-muted">/{r.slug} · {r.language ?? 'English'} · {r.readingTimeMin ?? 5} min · {r.createdAt ? formatDate(r.createdAt) : ''}</p>
                  {r.summary ? <p className="mt-1 line-clamp-1 text-xs text-slate-400">{r.summary}</p> : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="ghost" onClick={() => void togglePublish(r)}>{r.published ? 'Unpublish' : 'Publish'}</Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(r)}>Edit</Button>
                  <Button size="sm" variant="ghost" className="text-hub-danger" onClick={() => void remove(r.id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}