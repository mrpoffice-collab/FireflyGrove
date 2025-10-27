import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/marketing/drafts/approve
 * Approve posts for auto-publishing
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

    const { postIds } = await req.json()

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: 'Invalid postIds' }, { status: 400 })
    }

    // Approve all posts
    const result = await prisma.marketingPost.updateMany({
      where: {
        id: { in: postIds },
        status: 'draft',
      },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: session.user.email,
      },
    })

    console.log(`✅ Approved ${result.count} post(s) by ${session.user.email}`)

    return NextResponse.json({
      success: true,
      approved: result.count,
    })
  } catch (error) {
    console.error('Error approving posts:', error)
    return NextResponse.json(
      { error: 'Failed to approve posts' },
      { status: 500 }
    )
  }
}
