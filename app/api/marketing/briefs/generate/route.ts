import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateContentBrief } from '@/lib/marketing/briefGenerator'

/**
 * POST /api/marketing/briefs/generate
 * Generate a content brief from a scored topic
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
    const { topicScoreId } = body

    if (!topicScoreId) {
      return NextResponse.json(
        { error: 'topicScoreId is required' },
        { status: 400 }
      )
    }

    // Check if brief already exists
    const existing = await prisma.contentBrief.findUnique({
      where: { topicScoreId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Brief already exists for this topic' },
        { status: 400 }
      )
    }

    // Generate the brief
    const briefData = await generateContentBrief({ topicScoreId })

    // Save to database
    const brief = await prisma.contentBrief.create({
      data: {
        topicScoreId,
        title: briefData.title,
        targetKeywords: briefData.targetKeywords,
        suggestedLength: briefData.suggestedLength,
        outlinePoints: JSON.stringify(briefData.outlinePoints),
        suggestedH2s: briefData.suggestedH2s,
        ctaRecommendation: briefData.ctaRecommendation,
        toneNotes: briefData.toneNotes,
        status: 'draft',
      },
    })

    // Update topic status to 'approved'
    await prisma.topicScore.update({
      where: { id: topicScoreId },
      data: { status: 'approved' },
    })

    return NextResponse.json({
      success: true,
      brief,
      briefData,
    })
  } catch (error) {
    console.error('Error generating brief:', error)
    return NextResponse.json(
      { error: 'Failed to generate brief', details: (error as Error).message },
      { status: 500 }
    )
  }
}
