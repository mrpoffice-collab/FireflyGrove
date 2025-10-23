import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/branches/:branchId/restore
 *
 * Restore an archived branch
 * Only the branch owner can restore their archived branch
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const branchId = params.branchId

    // Find the branch
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
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
        { error: 'Only the branch owner can restore a branch' },
        { status: 403 }
      )
    }

    // Check if branch is archived
    if (!branch.archived) {
      return NextResponse.json(
        { error: 'This branch is not archived' },
        { status: 400 }
      )
    }

    // Restore the branch in a transaction
    await prisma.$transaction(async (tx) => {
      // Update branch
      await tx.branch.update({
        where: { id: branchId },
        data: {
          archived: false,
          archivedAt: null,
          archivedBy: null,
          status: 'ACTIVE',
        },
      })

      // Create audit log
      await tx.audit.create({
        data: {
          actorId: userId,
          action: 'RESTORE',
          targetType: 'BRANCH',
          targetId: branch.id,
          metadata: JSON.stringify({
            branchTitle: branch.title,
            previousStatus: branch.status,
          }),
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: `Branch "${branch.title}" restored successfully`,
    })
  } catch (error: any) {
    console.error('Error restoring branch:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to restore branch' },
      { status: 500 }
    )
  }
}
