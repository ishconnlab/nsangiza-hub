import { Router } from 'express'
import { z } from 'zod'
import { ApiError, asyncHandler } from '../lib/errors'
import { ok } from '../lib/response'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import CommunityGroup from '../models/CommunityGroup'
import CommunityPost from '../models/CommunityPost'
import User from '../models/User'
import Notification from '../models/Notification'
import { Types } from 'mongoose'

const router = Router()

router.get(
  '/groups',
  asyncHandler(async (_req, res) => {
    const groups = await CommunityGroup.find({ active: true }).sort({ memberCount: -1 }).lean()
    res.json(
      ok({
        groups: groups.map((g) => ({
          id: String(g._id),
          name: g.name,
          slug: g.slug,
          description: g.description,
          category: g.category,
          memberCount: g.memberCount,
          moderated: g.moderated,
          rules: g.rules,
        })),
        note: 'Community spaces are moderated.',
      }),
    )
  }),
)

router.get(
  '/groups/mine',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const groups = await CommunityGroup.find({ active: true, members: req.userId }).lean()
    res.json(ok({ groups: groups.map((g) => ({ id: String(g._id), name: g.name, slug: g.slug, memberCount: g.memberCount })) }))
  }),
)

router.get(
  '/groups/:id',
  asyncHandler(async (req, res) => {
    const group = await CommunityGroup.findById(req.params.id).lean()
    if (!group || !group.active) throw ApiError.notFound('Group not found.')
    res.json(ok({ group: { id: String(group._id), name: group.name, slug: group.slug, description: group.description, category: group.category, memberCount: group.memberCount, moderated: group.moderated, rules: group.rules } }))
  }),
)

const REACTION_KINDS = ['supportive', 'thoughtful', 'grateful'] as const
type ReactionKind = (typeof REACTION_KINDS)[number]
type ReactionCounts = Record<ReactionKind, number>

function reactionPayload(post: { reactions?: unknown; reactedBy?: unknown }, userId?: string) {
  const counts = (post.reactions ?? {}) as Partial<ReactionCounts>
  const by = (post.reactedBy ?? {}) as Partial<Record<ReactionKind, unknown[]>>
  const reactions: ReactionCounts = {
    supportive: counts.supportive ?? 0,
    thoughtful: counts.thoughtful ?? 0,
    grateful: counts.grateful ?? 0,
  }
  let my: ReactionKind | null = null
  if (userId) {
    for (const kind of REACTION_KINDS) {
      if ((by[kind] ?? []).some((u) => String(u) === userId)) {
        my = kind
        break
      }
    }
  }
  return { ...reactions, my }
}

router.get(
  '/groups/:id/posts',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const group = await CommunityGroup.findById(req.params.id).lean()
    if (!group || !group.active) throw ApiError.notFound('Group not found.')
    const posts = await CommunityPost.find({ group: group._id, hidden: false }).sort({ createdAt: -1 }).limit(50).lean()
    res.json(
      ok({
        posts: posts.map((p) => ({
          id: String(p._id),
          authorName: p.authorName,
          body: p.body,
          reactions: reactionPayload(p, req.userId),
          commentCount: p.commentCount,
          comments: p.comments,
          createdAt: p.createdAt,
          moderated: p.moderated,
        })),
      }),
    )
  }),
)

const postSchema = z.object({ body: z.string().min(2, 'Please write a message.').max(2000) })

router.post(
  '/groups/:id/posts',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const group = await CommunityGroup.findById(req.params.id)
    if (!group || !group.active) throw ApiError.notFound('Group not found.')
    const body = postSchema.parse(req.body)
    const user = await User.findById(req.userId).lean()

    if (!group.members.some((m) => String(m) === req.userId)) {
      group.members.push(new (await import('mongoose')).Types.ObjectId(req.userId!))
      group.memberCount += 1
      await group.save()
    }

    const post = await CommunityPost.create({
      group: group._id,
      author: req.userId,
      authorName: user?.displayName ?? 'Member',
      body: body.body,
    })
    res.status(201).json(ok({ post: { id: String(post._id), authorName: post.authorName, body: post.body, createdAt: post.createdAt } }, 'Shared in the community space.'))
  }),
)

const commentSchema = z.object({ body: z.string().min(2, 'Please write a reply.').max(1000) })

async function assertMembership(groupId: unknown, userId?: string) {
  const isMember = await CommunityGroup.exists({ _id: groupId, members: userId })
  if (!isMember) throw ApiError.forbidden('Join this group before taking part.')
}

router.post(
  '/posts/:id/comments',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const post = await CommunityPost.findById(req.params.id)
    if (!post || post.hidden) throw ApiError.notFound('Post not found.')
    await assertMembership(post.group, req.userId)
    const body = commentSchema.parse(req.body)
    const user = await User.findById(req.userId).lean()
    const authorName = user?.displayName ?? 'Member'

    post.comments.push({ authorName, body: body.body, createdAt: new Date() })
    post.commentCount = post.comments.length
    await post.save()

    if (String(post.author) !== req.userId) {
      await Notification.create({
        user: post.author,
        type: 'community',
        title: 'New reply to your post',
        // Do not copy community content into the notification feed — open the
        // group to read the reply privately.
        body: `${authorName} replied to your post.`,
        link: `/app/community/${String(post.group)}`,
      })
    }

    res.status(201).json(ok({ comments: post.comments, commentCount: post.commentCount }, 'Reply posted.'))
  }),
)

const reactionSchema = z.object({ kind: z.enum(REACTION_KINDS) })

router.post(
  '/posts/:id/reactions',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const post = await CommunityPost.findById(req.params.id)
    if (!post || post.hidden) throw ApiError.notFound('Post not found.')
    await assertMembership(post.group, req.userId)
    const { kind } = reactionSchema.parse(req.body)
    const userId = new Types.ObjectId(req.userId!)
    const by = (post.reactedBy ?? {}) as Partial<Record<ReactionKind, Types.ObjectId[]>>
    const counts = (post.reactions ?? {}) as Partial<ReactionCounts>

    const had = (by[kind] ?? []).some((u) => String(u) === req.userId)
    for (const k of REACTION_KINDS) {
      const list = by[k] ?? []
      const kept = list.filter((u) => String(u) !== req.userId)
      by[k] = kept
      counts[k] = Math.max(0, (counts[k] ?? 0) - (list.length - kept.length))
    }
    if (!had) {
      const list = by[kind] ?? []
      list.push(userId)
      by[kind] = list
      counts[kind] = (counts[kind] ?? 0) + 1
    }
    post.reactedBy = by as typeof post.reactedBy
    post.reactions = counts as typeof post.reactions
    await post.save()

    res.json(ok({ reactions: reactionPayload(post, req.userId) }))
  }),
)

router.post(
  '/groups/:id/join',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const group = await CommunityGroup.findById(req.params.id)
    if (!group || !group.active) throw ApiError.notFound('Group not found.')
    if (!group.members.some((m) => String(m) === req.userId)) {
      group.members.push(new Types.ObjectId(req.userId!))
      group.memberCount = group.members.length
      await group.save()
    }
    res.json(ok({ memberCount: group.memberCount, isMember: true }, 'Joined the group.'))
  }),
)

router.post(
  '/groups/:id/leave',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const group = await CommunityGroup.findById(req.params.id)
    if (!group || !group.active) throw ApiError.notFound('Group not found.')
    group.members = group.members.filter((m) => String(m) !== req.userId)
    group.memberCount = group.members.length
    await group.save()
    res.json(ok({ memberCount: group.memberCount, isMember: false }, 'Left the group.'))
  }),
)

const reportSchema = z.object({ reason: z.string().min(1).max(300) })

router.post(
  '/posts/:id/report',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const post = await CommunityPost.findById(req.params.id)
    if (!post) throw ApiError.notFound('Post not found.')
    const body = reportSchema.parse(req.body)
    post.reported = true
    post.reportReason = body.reason
    await post.save()
    await Notification.create({ user: req.userId, type: 'community', title: 'Post reported', body: 'Thanks for flagging this. A moderator will review it.', link: '/app/community' })
    res.json(ok({ id: post._id }, 'Post reported. A moderator will review it.'))
  }),
)

export default router