import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * DELETE /api/marketing/drafts/delete
 * Delete draft posts (only if not published)
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

    const { postIds, autoFillGaps = false } = await req.json()

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: 'Invalid postIds' }, { status: 400 })
    }

    // Only allow deleting draft/scheduled posts (not published)
    const posts = await prisma.marketingPost.findMany({
      where: {
        id: { in: postIds },
        status: { in: ['draft', 'scheduled'] }, // Don't allow deleting published posts
      },
      orderBy: { scheduledFor: 'asc' },
    })

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'No eligible posts to delete (only draft/scheduled posts can be deleted)' },
        { status: 400 }
      )
    }

    // Delete posts
    const result = await prisma.marketingPost.deleteMany({
      where: {
        id: { in: posts.map((p) => p.id) },
      },
    })

    console.log(`🗑️ Deleted ${result.count} post(s) by ${session.user.email}`)

    // Auto-fill gaps if requested
    if (autoFillGaps) {
      // Get all remaining approved posts with scheduled dates
      const remainingPosts = await prisma.marketingPost.findMany({
        where: {
          isApproved: true,
          scheduledFor: { not: null },
        },
        orderBy: { scheduledFor: 'asc' },
      })

      if (remainingPosts.length > 0) {
        // Find the earliest scheduled date
        const startDate = new Date(remainingPosts[0].scheduledFor!)

        // Reschedule all posts evenly from start date
        for (let i = 0; i < remainingPosts.length; i++) {
          const newDate = new Date(startDate)
          newDate.setDate(startDate.getDate() + (i * 2)) // 2 days apart

          await prisma.marketingPost.update({
            where: { id: remainingPosts[i].id },
            data: { scheduledFor: newDate },
          })
        }

        console.log(`📅 Auto-filled gaps: rescheduled ${remainingPosts.length} posts`)
      }
    }

    return NextResponse.json({
      success: true,
      deleted: result.count,
      rescheduled: autoFillGaps,
    })
  } catch (error) {
    console.error('Error deleting posts:', error)
    return NextResponse.json(
      { error: 'Failed to delete posts' },
      { status: 500 }
    )
  }
}
