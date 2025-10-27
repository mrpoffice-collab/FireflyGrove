import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/marketing/drafts
 * Get all draft posts for review
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

    // Fetch all draft posts
    const drafts = await prisma.marketingPost.findMany({
      where: {
        status: 'draft',
      },
      orderBy: [
        { scheduledFor: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({
      drafts,
      stats: {
        total: drafts.length,
        approved: drafts.filter((d) => d.isApproved).length,
        pending: drafts.filter((d) => !d.isApproved).length,
      },
    })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
}
