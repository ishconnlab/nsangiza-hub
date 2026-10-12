import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { HandHeart, Lightbulb, MessageCircle, Send, ShieldAlert, ThumbsUp, Users } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { EmptyState, Loading } from '../../components/PageHeader'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog'
import { formatRelative } from '../../lib/format'
import { ApiError } from '../../lib/api'
import type { ReactionKind } from '../../types'
import {
  useAddComment,
  useCreatePost,
  useGroup,
  useGroupPosts,
  useJoinGroup,
  useLeaveGroup,
  useMyGroups,
  useReportPost,
  useToggleReaction,
} from '../../services/community'

const REACTIONS: { kind: ReactionKind; label: string; icon: typeof ThumbsUp }[] = [
  { kind: 'supportive', label: 'Supportive', icon: ThumbsUp },
  { kind: 'thoughtful', label: 'Thoughtful', icon: Lightbulb },
  { kind: 'grateful', label: 'Grateful', icon: HandHeart },
]

export default function CommunityGroupPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const id = groupId ?? ''
  const { data: groupData, isLoading: groupLoading, isError: groupError } = useGroup(id)
  const { data, isLoading, isError } = useGroupPosts(id)
  const myGroups = useMyGroups()
  const createMutation = useCreatePost()
  const reportMutation = useReportPost()
  const joinMutation = useJoinGroup()
  const leaveMutation = useLeaveGroup()
  const reactionMutation = useToggleReaction(id)
  const commentMutation = useAddComment(id)

  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reportFor, setReportFor] = useState<string | null>(null)
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')

  const group = groupData?.data.group
  const isMember = (myGroups.data?.data.groups ?? []).some((g) => g.id === id)

  async function post() {
    if (!id || !body.trim()) return
    setSubmitting(true)
    try {
      await createMutation.mutateAsync({ groupId: id, body: body.trim() })
      toast.success('Shared in the community space.')
      setBody('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not share your post.')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleReaction(postId: string, kind: ReactionKind) {
    try {
      await reactionMutation.mutateAsync({ id: postId, kind })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not save your reaction.')
    }
  }

  async function sendComment(postId: string) {
    if (!commentText.trim()) return
    try {
      await commentMutation.mutateAsync({ id: postId, body: commentText.trim() })
      setCommentText('')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not post your reply.')
    }
  }

  async function report(reason: string) {
    if (!reportFor) return
    try {
      await reportMutation.mutateAsync({ id: reportFor, reason })
      toast.success('Reported. A moderator will review it.')
      setReportFor(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not report.')
    }
  }

  async function toggleMembership() {
    try {
      if (isMember) {
        await leaveMutation.mutateAsync(id)
        toast.success('You left the group.')
      } else {
        await joinMutation.mutateAsync(id)
        toast.success('You joined the group.')
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update membership.')
    }
  }

  if (groupLoading || isLoading) return <Loading label="Loading group…" />
  if (groupError || isError) return <EmptyState title="Could not load this group" />
  if (!group) return <EmptyState title="Group not found" action={<Link to="/app/community"><Button variant="outline">Back to community</Button></Link>} />

  const posts = data?.data.posts ?? []

  return (
    <div>
      <p className="text-sm text-hub-muted">
        <Link to="/app/community" className="hover:text-hub-primary">Community</Link> → {group.name}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-hub-text">{group.name}</h1>
            {group.moderated && <Badge variant="secondary">Moderated</Badge>}
          </div>
          <p className="mt-1 text-sm text-hub-muted">{group.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {group.memberCount} members
          </Badge>
          <Button
            size="sm"
            variant={isMember ? 'outline' : 'default'}
            onClick={() => void toggleMembership()}
            disabled={joinMutation.isPending || leaveMutation.isPending}
          >
            {joinMutation.isPending || leaveMutation.isPending ? 'Saving…' : isMember ? 'Leave group' : 'Join group'}
          </Button>
        </div>
      </div>

      {group.rules && group.rules.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-hub-muted">Group rules</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-hub-muted">
            {group.rules.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} placeholder="Share how you're doing, or ask for support…" />
        <div className="mt-3 flex justify-end">
          <Button onClick={post} disabled={submitting || !body.trim()} className="inline-flex items-center gap-1.5">
            <Send className="h-4 w-4" />
            {submitting ? 'Posting…' : 'Post'}
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <EmptyState title="No posts yet" description="Be the first to start a gentle conversation." />
      ) : (
        <div className="mt-6 space-y-4">
          {posts.map((p) => {
            const reactions = p.reactions
            const comments = p.comments ?? []
            const commentsOpen = openComments === p.id
            return (
              <Card key={p.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-hub-primary-light text-xs font-bold text-hub-primary">
                        {p.authorName?.charAt(0).toUpperCase() ?? '?'}
                      </span>
                      <span className="text-sm font-medium text-hub-text">{p.authorName ?? 'Member'}</span>
                      <span className="text-xs text-slate-400">· {formatRelative(p.createdAt)}</span>
                    </div>
                    <Dialog open={reportFor === p.id} onOpenChange={(open) => setReportFor(open ? p.id : null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" aria-label="Report post" className="text-slate-400">
                          <ShieldAlert className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report this post</DialogTitle>
                          <DialogDescription>A moderator will review it privately.</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                          Reason: <span className="font-medium">Breaks group rules</span>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button variant="ghost" className="text-hub-danger" onClick={() => void report('Breaks group rules')}>
                            Report
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-hub-text">{p.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {REACTIONS.map(({ kind, label, icon: Icon }) => {
                      const count = reactions?.[kind] ?? 0
                      const mine = reactions?.my === kind
                      return (
                        <button
                          key={kind}
                          type="button"
                          aria-label={`${label} (${count})`}
                          aria-pressed={mine}
                          onClick={() => void toggleReaction(p.id, kind)}
                          disabled={reactionMutation.isPending}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                            mine
                              ? 'border-hub-primary bg-hub-primary-light text-hub-primary'
                              : 'border-slate-200 text-hub-muted hover:border-hub-primary/40 hover:text-hub-primary'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {count}
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setOpenComments(commentsOpen ? null : p.id)}
                      className="ml-auto inline-flex items-center gap-1.5 text-xs text-hub-muted hover:text-hub-primary"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {p.commentCount ?? comments.length} replies
                    </button>
                    {p.moderated && <Badge variant="secondary">Moderated</Badge>}
                  </div>

                  {commentsOpen && (
                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                      {comments.length === 0 ? (
                        <p className="text-sm text-hub-muted">No replies yet — be the first to respond kindly.</p>
                      ) : (
                        comments.map((c) => (
                          <div key={c._id} className="flex gap-2.5">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-hub-muted">
                              {c.authorName?.charAt(0).toUpperCase() ?? '?'}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-hub-text">
                                {c.authorName ?? 'Member'} <span className="font-normal text-slate-400">· {c.createdAt ? formatRelative(c.createdAt) : ''}</span>
                              </p>
                              <p className="mt-0.5 whitespace-pre-line text-sm text-hub-text">{c.body}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div className="flex items-center gap-2">
                        <Textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          maxLength={1000}
                          placeholder="Write a kind reply…"
                          rows={1}
                          className="min-h-9"
                        />
                        <Button
                          size="sm"
                          onClick={() => void sendComment(p.id)}
                          disabled={commentMutation.isPending || !commentText.trim()}
                          aria-label="Send reply"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
