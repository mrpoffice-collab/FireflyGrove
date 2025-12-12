import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/entries/:entryId/undo
 *
 * Undo a recently created memory within 60 seconds
 * Only the author can undo their own memory
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
      },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      )
    }

    // Check if user is the author
    if (entry.authorId !== userId) {
      return NextResponse.json(
        { error: 'You can only undo your own memories' },
        { status: 403 }
      )
    }

    // Check if memory is already deleted/withdrawn
    if (entry.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This memory has already been removed' },
        { status: 400 }
      )
    }

    // Check if within 60-second window
    const now = new Date()
    const createdAt = new Date(entry.createdAt)
    const secondsElapsed = (now.getTime() - createdAt.getTime()) / 1000

    if (secondsElapsed > 60) {
      return NextResponse.json(
        {
          error: 'undo_window_expired',
          message: 'The undo window has expired. You can withdraw this memory from the settings instead.',
          secondsElapsed: Math.round(secondsElapsed),
        },
        { status: 400 }
      )
    }

    // Permanently delete the entry (within undo window, we can truly delete)
    await prisma.$transaction(async (tx) => {
      // Create audit log before deletion
      await tx.audit.create({
        data: {
          actorId: userId,
          action: 'UNDO',
          targetType: 'ENTRY',
          targetId: entry.id,
          metadata: JSON.stringify({
            text: entry.text,
            branchId: entry.branchId,
            secondsAfterCreation: Math.round(secondsElapsed),
            reason: 'Undo within 60-second window',
          }),
        },
      })

      // Delete the entry
      await tx.entry.delete({
        where: { id: entryId },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Memory removed',
      undoneAt: new Date(),
    })
  } catch (error: any) {
    console.error('Error undoing entry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to undo memory' },
      { status: 500 }
    )
  }
}
