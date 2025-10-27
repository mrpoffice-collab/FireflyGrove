import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/marketing/posts/[id]/reschedule
 * Update the scheduled date for a post
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { scheduledFor } = await req.json()

    if (!scheduledFor) {
      return NextResponse.json({ error: 'scheduledFor is required' }, { status: 400 })
    }

    // Update the post
    const post = await prisma.marketingPost.update({
      where: { id: params.id },
      data: {
        scheduledFor: new Date(scheduledFor),
      },
    })

    console.log(`📅 Rescheduled post ${params.id} to ${scheduledFor}`)

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error rescheduling post:', error)
    return NextResponse.json(
      { error: 'Failed to reschedule post' },
      { status: 500 }
    )
  }
}
