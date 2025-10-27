import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/marketing/topics
 * Get all scored topics with optional filters
 */
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const minConfidence = searchParams.get('minConfidence')
      ? parseInt(searchParams.get('minConfidence')!)
      : undefined
    const showAll = searchParams.get('showAll') === 'true'

    // Smart filter: Only show "candidate" topics by default
    // (hide drafted/published/dismissed topics)
    const where: any = {}
    if (status) {
      where.status = status
    } else if (!showAll) {
      // Default: only show candidates (not drafted, published, or dismissed)
      where.status = 'candidate'
    }

    if (minConfidence) {
      where.confidenceScore = { gte: minConfidence }
    }

    // Fetch topics
    const topics = await prisma.topicScore.findMany({
      where,
      orderBy: [{ confidenceScore: 'desc' }, { scoredAt: 'desc' }],
    })

    // Smart filter: Remove topics with similar content published < 360 days ago
    const filteredTopics = []
    const oneYearAgo = new Date()
    oneYearAgo.setDate(oneYearAgo.getDate() - 360)

    for (const topic of topics) {
      // Check if similar content exists (by primary keyword)
      const similarPost = await prisma.marketingPost.findFirst({
        where: {
          keywords: {
            has: topic.primaryKeyword,
          },
          publishedAt: {
            gte: oneYearAgo,
          },
        },
        select: { id: true, title: true, publishedAt: true },
      })

      // Only include if no similar post within 360 days
      if (!similarPost) {
        filteredTopics.push(topic)
      } else {
        console.log(
          `⏭️ Skipping "${topic.topic}" - similar post "${similarPost.title}" published ${similarPost.publishedAt}`
        )
      }
    }

    // Get summary stats
    const stats = {
      total: filteredTopics.length,
      highConfidence: filteredTopics.filter((t) => t.confidenceScore >= 80).length,
      mediumConfidence: filteredTopics.filter(
        (t) => t.confidenceScore >= 65 && t.confidenceScore < 80
      ).length,
      lowConfidence: filteredTopics.filter((t) => t.confidenceScore < 65).length,
      filtered: topics.length - filteredTopics.length,
    }

    return NextResponse.json({
      topics: filteredTopics,
      stats,
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}
