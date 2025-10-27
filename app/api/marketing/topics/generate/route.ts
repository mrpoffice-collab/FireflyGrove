import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTopics } from '@/lib/marketing/topicGenerator'

/**
 * POST /api/marketing/topics/generate
 * Automatically generate and score topics
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
    const {
      count = 20, // Default: generate 20 topics
      minConfidence = 65, // Default: only keep 65%+ confidence
      focusAreas,
    } = body

    console.log(
      `🚀 Starting automated topic generation: ${count} topics, ${minConfidence}% min confidence`
    )

    // Generate and score topics
    const scoredTopics = await generateTopics({
      count,
      minConfidence,
      focusAreas,
    })

    // Save to database
    const savedTopics = []
    for (const topic of scoredTopics) {
      const saved = await prisma.topicScore.create({
        data: {
          topic: topic.topic,
          description: topic.description,
          primaryKeyword: topic.primaryKeyword,
          relatedKeywords: topic.relatedKeywords,
          demandScore: topic.scores.demandScore,
          competitionScore: topic.scores.competitionScore,
          relevanceScore: topic.scores.relevanceScore,
          confidenceScore: topic.scores.confidenceScore,
          estimatedUsers: topic.scores.estimatedUsers,
          reasoningNotes: topic.scores.reasoningNotes,
          status: 'candidate',
        },
      })
      savedTopics.push(saved)
    }

    // Calculate summary stats
    const stats = {
      generated: count,
      passed: savedTopics.length,
      averageConfidence:
        savedTopics.length > 0
          ? Math.round(
              savedTopics.reduce((sum, t) => sum + t.confidenceScore, 0) /
                savedTopics.length
            )
          : 0,
      totalEstimatedUsers: savedTopics.reduce(
        (sum, t) => sum + (t.estimatedUsers || 0),
        0
      ),
      highConfidence: savedTopics.filter((t) => t.confidenceScore >= 80).length,
      mediumConfidence: savedTopics.filter(
        (t) => t.confidenceScore >= 65 && t.confidenceScore < 80
      ).length,
    }

    console.log('✅ Topic generation complete:', stats)

    return NextResponse.json({
      success: true,
      topics: savedTopics,
      stats,
      message: `Generated ${stats.passed} winning topics (${stats.highConfidence} high confidence, ${stats.mediumConfidence} medium confidence)`,
    })
  } catch (error) {
    console.error('Error generating topics:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate topics',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
