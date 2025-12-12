import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/memories/:memoryId/approve
 *
 * Approve a pending shared memory for a branch
 * Changes visibilityStatus from 'pending_approval' to 'active'
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

    // Find the pending link
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
        { error: 'Shared memory not found' },
        { status: 404 }
      )
    }

    if (link.visibilityStatus !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Memory is not pending approval' },
        { status: 400 }
      )
    }

    // Approve: set to active
    await prisma.memoryBranchLink.update({
      where: { id: link.id },
      data: {
        visibilityStatus: 'active',
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'TAG_APPROVED',
        targetType: 'ENTRY',
        targetId: memoryId,
        metadata: JSON.stringify({
          branchId,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Memory approved and is now visible in your branch',
    })
  } catch (error: any) {
    console.error('Error approving memory:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to approve memory' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/memories/:memoryId/decline
 *
 * Decline a pending shared memory for a branch
 * Changes visibilityStatus from 'pending_approval' to 'removed_by_user'
 */
export async function DELETE(
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

    // Find the pending link
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
        { error: 'Shared memory not found' },
        { status: 404 }
      )
    }

    if (link.visibilityStatus !== 'pending_approval') {
      return NextResponse.json(
        { error: 'Memory is not pending approval' },
        { status: 400 }
      )
    }

    // Decline: set to removed_by_user
    await prisma.memoryBranchLink.update({
      where: { id: link.id },
      data: {
        visibilityStatus: 'removed_by_user',
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'TAG_DECLINED',
        targetType: 'ENTRY',
        targetId: memoryId,
        metadata: JSON.stringify({
          branchId,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Memory declined',
    })
  } catch (error: any) {
    console.error('Error declining memory:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to decline memory' },
      { status: 500 }
    )
  }
}
