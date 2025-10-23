import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/entries/:entryId/withdraw
 *
 * Withdraw a memory (soft delete by author)
 * Only the author can withdraw their own memory
 * Sets status to WITHDRAWN and timestamp
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
            title: true,
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
        { error: 'You can only withdraw your own memories' },
        { status: 403 }
      )
    }

    // Check if memory is already withdrawn or deleted
    if (entry.status === 'WITHDRAWN') {
      return NextResponse.json(
        { error: 'This memory has already been withdrawn' },
        { status: 400 }
      )
    }

    if (entry.status === 'DELETED') {
      return NextResponse.json(
        { error: 'This memory has been deleted and cannot be withdrawn' },
        { status: 400 }
      )
    }

    // Withdraw the entry in a transaction
    await prisma.$transaction(async (tx) => {
      // Update entry status
      await tx.entry.update({
        where: { id: entryId },
        data: {
          status: 'WITHDRAWN',
          withdrawnAt: new Date(),
        },
      })

      // Create audit log
      await tx.audit.create({
        data: {
          actorId: userId,
          action: 'WITHDRAW',
          targetType: 'ENTRY',
          targetId: entry.id,
          metadata: JSON.stringify({
            previousStatus: entry.status,
            branchId: entry.branchId,
            branchTitle: entry.branch.title,
          }),
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Memory withdrawn. You can restore it from your trash within 30 days.',
    })
  } catch (error: any) {
    console.error('Error withdrawing entry:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to withdraw memory' },
      { status: 500 }
    )
  }
}
