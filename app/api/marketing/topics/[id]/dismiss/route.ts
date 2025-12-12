import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/marketing/topics/[id]/dismiss
 * Mark a topic as dismissed (won't show up in candidate list anymore)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params
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

    // Update topic status to dismissed
    const updatedTopic = await prisma.topicScore.update({
      where: { id: topicId },
      data: { status: 'dismissed' },
    })

    return NextResponse.json({
      success: true,
      topic: updatedTopic,
    })
  } catch (error) {
    console.error('Error dismissing topic:', error)
    return NextResponse.json(
      { error: 'Failed to dismiss topic' },
      { status: 500 }
    )
  }
}
