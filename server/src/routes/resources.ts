import { Router } from 'express'
import { ApiError, asyncHandler } from '../lib/errors'
import { paginated, ok } from '../lib/response'
import Resource from '../models/Resource'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, language, featured, page = '1', pageSize = '12' } = req.query as Record<string, string>
    const filter: Record<string, unknown> = { published: true }
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ]
    }
    if (category) filter.category = category
    if (language) filter.language = language
    if (featured === 'true') filter.featuredImage = { $ne: '' }

    const pageNum = Math.max(1, Number(page) || 1)
    const size = Math.min(50, Math.max(1, Number(pageSize) || 12))
    const total = await Resource.countDocuments(filter)
    const items = await Resource.find(filter)
      .sort({ publishedAt: -1 })
      .skip((pageNum - 1) * size)
      .limit(size)
      .lean()

    res.json(
      paginated(
        items.map((r) => ({
          id: String(r._id),
          title: r.title,
          slug: r.slug,
          summary: r.summary,
          category: r.category,
          language: r.language,
          readingTimeMin: r.readingTimeMin,
          author: r.author,
          publishedAt: r.publishedAt,
          featuredImage: r.featuredImage,
          tags: r.tags,
        })),
        pageNum,
        size,
        total,
      ),
    )
  }),
)

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await Resource.distinct('category', { published: true })
    res.json(ok({ categories }, 'Success'))
  }),
)

router.get(
  '/featured',
  asyncHandler(async (_req, res) => {
    const items = await Resource.find({ published: true }).sort({ publishedAt: -1 }).limit(4).lean()
    res.json(ok({ resources: items.map((r) => ({ id: String(r._id), title: r.title, slug: r.slug, summary: r.summary, category: r.category, readingTimeMin: r.readingTimeMin })) }))
  }),
)

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const resource = await Resource.findOne({ slug: req.params.slug, published: true }).lean()
    if (!resource) throw ApiError.notFound('Resource not found.')
    const related = await Resource.find({ _id: { $nin: [resource._id] }, published: true, category: resource.category })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug summary category readingTimeMin')
      .lean()
    res.json(
      ok({
        resource: {
          id: String(resource._id),
          title: resource.title,
          slug: resource.slug,
          summary: resource.summary,
          body: resource.body,
          category: resource.category,
          language: resource.language,
          readingTimeMin: resource.readingTimeMin,
          author: resource.author,
          published: resource.published,
          publishedAt: resource.publishedAt,
          featuredImage: resource.featuredImage,
          tags: resource.tags,
        },
        related,
      }),
    )
  }),
)

export default router