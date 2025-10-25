import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/entries/:entryId/restore
 *
 * Restore a withdrawn or hidden memory
 * - Author can restore their own withdrawn memories
 * - Branch owner can restore any hidden memory
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { entryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const entryId = params.entryId

    // Find the entry
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            title: true,
            ownerId: true,
          },
        },
      },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      )
    }

    // Check permissions based on status
    const isAuthor = entry.authorId === userId
    const isBranchOwner = entry.branch.ownerId === userId

    if (entry.status === 'WITHDRAWN') {
      // Only author can restore withdrawn memories
      if (!isAuthor) {
        return NextResponse.json(
          { error: 'You can only restore your own withdrawn memories' },
          { status: 403 }
        )
      }
    } else if (entry.status === 'HIDDEN') {
      // Only branch owner can restore hidden memories
      if (!isBranchOwner) {
        return NextResponse.json(
          { error: 'Only the branch owner can restore hidden memories' },
          { status: 403 }
        )
      }
    } else if (entry.status === 'DELETED') {
      return NextResponse.json(
        { error: 'Deleted memories cannot be restored. Contact support if needed.' },
        { status: 400 }
      )
    } else if (entry.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'This memory is already active' },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid memory status' },
        { status: 400 }
      )
    }

    // Get branch with person info to check if we need to increment memory count
    const branch = await prisma.branch.findUnique({
      where: { id: entry.branchId },
      include: {
        person: {
          select: {
            id: true,
            isLegacy: true,
            memoryLimit: true,
          }
        }
      }
    })

    // Restore the entry in a transaction
    await prisma.$transaction(async (tx) => {
      // Update entry status back to ACTIVE
      await tx.entry.update({
        where: { id: entryId },
        data: {
          status: 'ACTIVE',
          // Clear the soft-delete timestamps
          withdrawnAt: null,
          hiddenAt: null,
          hiddenBy: null,
        },
      })

      // Increment memory count for Person-based legacy trees
      if (branch?.person?.isLegacy && branch.person.memoryLimit !== null) {
        await tx.person.update({
          where: { id: branch.person.id },
          data: { memoryCount: { increment: 1 } },
        })
      }

      // Create audit log
      await tx.audit.create({
        data: {
          actorId: userId,
          action: 'RESTORE',
          targetType: 'ENTRY',
          targetId: entry.id,
          metadata: JSON.stringify({
            previousStatus: entry.status,
            branchId: entry.branchId,
            branchTitle: entry.branch.title,
            restoredBy: userId === entry.authorId ? 'author' : 'branch_owner',
          }),
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Memory restored successfully',
    })
  } catch (error: any) {
    console.error('Error restoring entry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to restore memory' },
      { status: 500 }
    )
  }
}
