import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { scoreTopic } from '@/lib/marketing/topicScorer'

/**
 * POST /api/marketing/topics/score
 * Score a new content topic
 */
export async function POST(req: NextRequest) {
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
    const { topic, primaryKeyword, relatedKeywords, description } = body

    if (!topic || !primaryKeyword) {
      return NextResponse.json(
        { error: 'Topic and primary keyword are required' },
        { status: 400 }
      )
    }

    // Score the topic
    const scores = await scoreTopic({
      topic,
      primaryKeyword,
      relatedKeywords: relatedKeywords || [],
    })

    // Save to database
    const topicScore = await prisma.topicScore.create({
      data: {
        topic,
        description,
        primaryKeyword,
        relatedKeywords: relatedKeywords || [],
        demandScore: scores.demandScore,
        competitionScore: scores.competitionScore,
        relevanceScore: scores.relevanceScore,
        confidenceScore: scores.confidenceScore,
        estimatedUsers: scores.estimatedUsers,
        reasoningNotes: scores.reasoningNotes,
        status: 'candidate',
      },
    })

    return NextResponse.json({
      success: true,
      topicScore,
      scores,
    })
  } catch (error) {
    console.error('Error scoring topic:', error)
    return NextResponse.json(
      { error: 'Failed to score topic' },
      { status: 500 }
    )
  }
}
