import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/marketing/topics/top
 * Get top topic candidates by confidence score
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
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 10

    // Get top candidates (not yet published)
    const topCandidates = await prisma.topicScore.findMany({
      where: {
        status: { in: ['candidate', 'approved'] },
        confidenceScore: { gte: 65 }, // Only show good topics
      },
      orderBy: [{ confidenceScore: 'desc' }, { estimatedUsers: 'desc' }],
      take: limit,
    })

    // Calculate total estimated users if we write all top topics
    const totalEstimatedUsers = topCandidates.reduce(
      (sum, t) => sum + (t.estimatedUsers || 0),
      0
    )

    return NextResponse.json({
      topCandidates,
      count: topCandidates.length,
      totalEstimatedUsers,
      averageConfidence:
        topCandidates.length > 0
          ? Math.round(
              topCandidates.reduce((sum, t) => sum + t.confidenceScore, 0) /
                topCandidates.length
            )
          : 0,
    })
  } catch (error) {
    console.error('Error fetching top topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top topics' },
      { status: 500 }
    )
  }
}
