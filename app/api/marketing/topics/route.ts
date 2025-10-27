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
    const status = searchParams.get('status') || undefined
    const minConfidence = searchParams.get('minConfidence')
      ? parseInt(searchParams.get('minConfidence')!)
      : undefined

    // Build query
    const where: any = {}
    if (status) where.status = status
    if (minConfidence) {
      where.confidenceScore = { gte: minConfidence }
    }

    const topics = await prisma.topicScore.findMany({
      where,
      orderBy: [{ confidenceScore: 'desc' }, { scoredAt: 'desc' }],
      take: 50,
    })

    // Get summary stats
    const stats = {
      total: topics.length,
      highConfidence: topics.filter((t) => t.confidenceScore >= 80).length,
      mediumConfidence: topics.filter(
        (t) => t.confidenceScore >= 65 && t.confidenceScore < 80
      ).length,
      lowConfidence: topics.filter((t) => t.confidenceScore < 65).length,
    }

    return NextResponse.json({
      topics,
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
