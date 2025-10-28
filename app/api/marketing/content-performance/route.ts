import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/marketing/content-performance
 * Get content performance: estimated vs actual users
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all topic scores with linked posts
    const topicScores = await prisma.topicScore.findMany({
      where: {
        status: {
          in: ['drafted', 'published'],
        },
      },
      orderBy: {
        scoredAt: 'desc',
      },
    })

    // Get related posts
    const postIds = topicScores.map((t) => t.postId).filter((id): id is string => id !== null)
    const posts = await prisma.marketingPost.findMany({
      where: { id: { in: postIds } },
      select: {
        id: true,
        title: true,
        platform: true,
        status: true,
        publishedAt: true,
        isApproved: true,
        scheduledFor: true,
      },
    })

    const postMap = new Map(posts.map((p) => [p.id, p]))

    // Calculate metrics
    const totalEstimatedUsers = topicScores.reduce(
      (sum, t) => sum + (t.estimatedUsers || 0),
      0
    )
    const totalActualUsers = topicScores.reduce(
      (sum, t) => sum + (t.actualUsers || 0),
      0
    )

    const publishedCount = topicScores.filter((t) => t.status === 'published').length
    const draftedCount = topicScores.filter((t) => t.status === 'drafted').length

    // Group by platform
    const byPlatform: Record<string, {
      count: number
      estimatedUsers: number
      actualUsers: number
    }> = {}

    topicScores.forEach((topic) => {
      const post = topic.postId ? postMap.get(topic.postId) : null
      const platform = post?.platform || 'unknown'
      if (!byPlatform[platform]) {
        byPlatform[platform] = { count: 0, estimatedUsers: 0, actualUsers: 0 }
      }
      byPlatform[platform].count++
      byPlatform[platform].estimatedUsers += topic.estimatedUsers || 0
      byPlatform[platform].actualUsers += topic.actualUsers || 0
    })

    // Performance accuracy
    const topicsWithActualData = topicScores.filter(
      (t) => t.actualUsers !== null && t.actualUsers !== undefined && t.actualUsers > 0
    )

    const accuracy = topicsWithActualData.length > 0
      ? topicsWithActualData.reduce((sum, t) => {
          const estimated = t.estimatedUsers || 0
          const actual = t.actualUsers || 0
          if (estimated === 0) return sum
          // Calculate accuracy as 100% - abs(error%)
          const error = Math.abs((actual - estimated) / estimated)
          return sum + Math.max(0, 1 - error)
        }, 0) / topicsWithActualData.length
      : null

    // Top performers (best actual vs estimated)
    const topPerformers = topicsWithActualData
      .map((t) => ({
        topic: t.topic,
        estimated: t.estimatedUsers || 0,
        actual: t.actualUsers || 0,
        variance: ((t.actualUsers! - (t.estimatedUsers || 0)) / (t.estimatedUsers || 1)) * 100,
      }))
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      overview: {
        totalTopics: topicScores.length,
        published: publishedCount,
        drafted: draftedCount,
        estimatedUsers: totalEstimatedUsers,
        actualUsers: totalActualUsers,
        accuracy: accuracy ? Math.round(accuracy * 100) : null,
        trackedTopics: topicsWithActualData.length,
      },
      byPlatform,
      topPerformers,
      topics: topicScores.map((t) => {
        const post = t.postId ? postMap.get(t.postId) : null
        return {
          id: t.id,
          topic: t.topic,
          confidenceScore: Math.round(t.confidenceScore),
          relevanceScore: Math.round(t.relevanceScore),
          demandScore: Math.round(t.demandScore),
          estimatedUsers: t.estimatedUsers,
          actualUsers: t.actualUsers,
          status: t.status,
          publishedAt: t.publishedAt,
          post: post ? {
            id: post.id,
            title: post.title,
            platform: post.platform,
            status: post.status,
            publishedAt: post.publishedAt,
          } : null,
          variance: t.actualUsers !== null && t.estimatedUsers
            ? Math.round(((t.actualUsers - t.estimatedUsers) / t.estimatedUsers) * 100)
            : null,
        }
      }),
    })
  } catch (error: any) {
    console.error('Error fetching content performance:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch content performance' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/marketing/content-performance
 * Update actual user count for a topic
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { topicId, actualUsers } = body

    if (!topicId || actualUsers === undefined) {
      return NextResponse.json(
        { error: 'topicId and actualUsers required' },
        { status: 400 }
      )
    }

    // Update the topic score
    const updated = await prisma.topicScore.update({
      where: { id: topicId },
      data: { actualUsers: parseInt(actualUsers) },
    })

    console.log(`📊 Updated actual users for "${updated.topic}": ${actualUsers} (estimated: ${updated.estimatedUsers})`)

    return NextResponse.json({
      success: true,
      topic: updated,
    })
  } catch (error: any) {
    console.error('Error updating content performance:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update content performance' },
      { status: 500 }
    )
  }
}
