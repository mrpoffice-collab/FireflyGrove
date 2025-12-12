import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/branches/:branchId/archive
 *
 * Archive a branch (soft delete by owner)
 * Only the branch owner can archive their branch
 * Sets archived flag and timestamp
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { branchId } = await params

    // Find the branch
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
    })

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Check if user is the owner
    if (branch.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the branch owner can archive a branch' },
        { status: 403 }
      )
    }

    // Check if branch is already archived
    if (branch.archived) {
      return NextResponse.json(
        { error: 'This branch is already archived' },
        { status: 400 }
      )
    }

    // Archive the branch in a transaction
    await prisma.$transaction(async (tx) => {
      // Update branch
      await tx.branch.update({
        where: { id: branchId },
        data: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: userId,
          status: 'ARCHIVED',
        },
      })

      // Create audit log
      await tx.audit.create({
        data: {
          actorId: userId,
          action: 'ARCHIVE',
          targetType: 'BRANCH',
          targetId: branch.id,
          metadata: JSON.stringify({
            branchTitle: branch.title,
            entryCount: branch._count.entries,
            previousStatus: branch.status,
          }),
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: `Branch "${branch.title}" archived. You can restore it from your archived branches within 30 days.`,
    })
  } catch (error: any) {
    console.error('Error archiving branch:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to archive branch' },
      { status: 500 }
    )
  }
}
