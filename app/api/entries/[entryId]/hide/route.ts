import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/entries/:entryId/hide
 *
 * Hide a memory from view (soft delete by branch owner)
 * Only the branch owner can hide any memory in their branch
 * Sets status to HIDDEN with timestamp and actor tracking
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Find the entry with branch info
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
            owner: {
              select: {
                name: true,
              },
            },
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

    // Check if user is the branch owner
    if (entry.branch.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the branch owner can hide memories' },
        { status: 403 }
      )
    }

    // Check if memory is already hidden or deleted
    if (entry.status === 'HIDDEN') {
      return NextResponse.json(
        { error: 'This memory is already hidden' },
        { status: 400 }
      )
    }

    if (entry.status === 'DELETED') {
      return NextResponse.json(
        { error: 'This memory has been deleted and cannot be hidden' },
        { status: 400 }
      )
    }

    // Hide the entry in a transaction
    await prisma.$transaction(async (tx) => {
      // Update entry status
      await tx.entry.update({
        where: { id: entryId },
        data: {
          status: 'HIDDEN',
          hiddenAt: new Date(),
          hiddenBy: userId,
        },
      })

      // Create audit log
      await tx.audit.create({
        data: {
          actorId: userId,
          action: 'HIDE',
          targetType: 'ENTRY',
          targetId: entry.id,
          metadata: JSON.stringify({
            previousStatus: entry.status,
            authorId: entry.authorId,
            authorName: entry.author.name,
            branchId: entry.branchId,
            branchTitle: entry.branch.title,
          }),
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Memory hidden. You can restore it from your trash within 30 days.',
    })
  } catch (error: any) {
    console.error('Error hiding entry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to hide memory' },
      { status: 500 }
    )
  }
}
