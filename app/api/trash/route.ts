import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/trash
 *
 * Get all soft-deleted items for the current user:
 * - Memories they've withdrawn
 * - Memories hidden from their branches (if owner)
 * - Archived branches they own
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get withdrawn memories (by user)
    const withdrawnMemories = await prisma.entry.findMany({
      where: {
        authorId: userId,
        status: 'WITHDRAWN',
      },
      include: {
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        withdrawnAt: 'desc',
      },
    })

    // Get hidden memories (from branches user owns)
    const hiddenMemories = await prisma.entry.findMany({
      where: {
        status: 'HIDDEN',
        branch: {
          ownerId: userId,
        },
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        hiddenAt: 'desc',
      },
    })

    // Get archived branches
    const archivedBranches = await prisma.branch.findMany({
      where: {
        ownerId: userId,
        archived: true,
      },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: {
        archivedAt: 'desc',
      },
    })

    // Calculate days until permanent deletion (30 days retention)
    const calculateDaysLeft = (timestamp: Date | null) => {
      if (!timestamp) return null
      const deletionDate = new Date(timestamp)
      deletionDate.setDate(deletionDate.getDate() + 30)
      const now = new Date()
      const daysLeft = Math.ceil((deletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(0, daysLeft)
    }

    return NextResponse.json({
      withdrawnMemories: withdrawnMemories.map((entry) => ({
        id: entry.id,
        text: entry.text,
        branchId: entry.branch.id,
        branchTitle: entry.branch.title,
        withdrawnAt: entry.withdrawnAt,
        daysLeft: calculateDaysLeft(entry.withdrawnAt),
      })),
      hiddenMemories: hiddenMemories.map((entry) => ({
        id: entry.id,
        text: entry.text,
        authorName: entry.author.name,
        branchId: entry.branch.id,
        branchTitle: entry.branch.title,
        hiddenAt: entry.hiddenAt,
        hiddenBy: entry.hiddenBy,
        daysLeft: calculateDaysLeft(entry.hiddenAt),
      })),
      archivedBranches: archivedBranches.map((branch) => ({
        id: branch.id,
        title: branch.title,
        description: branch.description,
        entryCount: branch._count.entries,
        archivedAt: branch.archivedAt,
        daysLeft: calculateDaysLeft(branch.archivedAt),
      })),
    })
  } catch (error: any) {
    console.error('Error fetching trash:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trash' },
      { status: 500 }
    )
  }
}
