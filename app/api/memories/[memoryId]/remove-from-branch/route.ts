import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/memories/:memoryId/remove-from-branch
 *
 * Remove a shared memory from the current user's branch
 * Sets visibilityStatus to 'removed_by_user'
 * No notification sent to original creator
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ memoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { memoryId } = await params
    const body = await req.json()
    const { branchId } = body

    if (!branchId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns/manages this branch
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    })

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    if (branch.ownerId !== userId) {
      return NextResponse.json(
        { error: 'You do not manage this branch' },
        { status: 403 }
      )
    }

    // Find the memory link
    const link = await prisma.memoryBranchLink.findUnique({
      where: {
        memoryId_branchId: {
          memoryId,
          branchId,
        },
      },
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Memory not found in this branch' },
        { status: 404 }
      )
    }

    // Cannot remove from origin branch (must withdraw/delete instead)
    if (link.role === 'origin') {
      return NextResponse.json(
        { error: 'Cannot remove from origin branch. Use withdraw or delete instead.' },
        { status: 400 }
      )
    }

    // Update link to removed_by_user
    await prisma.memoryBranchLink.update({
      where: { id: link.id },
      data: {
        visibilityStatus: 'removed_by_user',
      },
    })

    // Create audit log (quietly, no notification)
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'MEMORY_REMOVED_BY_USER',
        targetType: 'ENTRY',
        targetId: memoryId,
        metadata: JSON.stringify({
          branchId,
          previousStatus: link.visibilityStatus,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Memory removed from your branch',
    })
  } catch (error: any) {
    console.error('Error removing memory from branch:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove memory' },
      { status: 500 }
    )
  }
}
