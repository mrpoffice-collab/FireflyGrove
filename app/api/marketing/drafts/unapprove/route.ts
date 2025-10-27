import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/marketing/drafts/unapprove
 * Remove approval from a post
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

    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: 'Invalid postId' }, { status: 400 })
    }

    // Unapprove post
    await prisma.marketingPost.update({
      where: { id: postId },
      data: {
        isApproved: false,
        approvedAt: null,
        approvedBy: null,
      },
    })

    console.log(`↩️ Unapproved post ${postId} by ${session.user.email}`)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error unapproving post:', error)
    return NextResponse.json(
      { error: 'Failed to unapprove post' },
      { status: 500 }
    )
  }
}
