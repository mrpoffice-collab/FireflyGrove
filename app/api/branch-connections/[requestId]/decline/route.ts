import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/branch-connections/:requestId/decline
 *
 * Decline a connection request
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { requestId } = await params

    // Get the connection request
    const request = await prisma.branchConnectionRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return NextResponse.json(
        { error: 'Connection request not found' },
        { status: 404 }
      )
    }

    if (request.status !== 'pending') {
      return NextResponse.json(
        { error: `This request has already been ${request.status}` },
        { status: 400 }
      )
    }

    // Check if request has expired
    if (new Date() > request.expiresAt) {
      await prisma.branchConnectionRequest.update({
        where: { id: requestId },
        data: { status: 'expired' },
      })

      return NextResponse.json(
        { error: 'This request has expired' },
        { status: 400 }
      )
    }

    // Verify user has permission to decline (must be targetUserId)
    if (request.targetUserId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to decline this request' },
        { status: 403 }
      )
    }

    // Decline the request
    await prisma.branchConnectionRequest.update({
      where: { id: requestId },
      data: {
        status: 'declined',
        respondedAt: new Date(),
        respondedBy: userId,
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'CONNECTION_REQUEST_DECLINED',
        targetType: 'BRANCH_CONNECTION_REQUEST',
        targetId: requestId,
        metadata: JSON.stringify({
          branchId: request.branchId,
          personId: request.personId,
          requesterId: request.requesterId,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Connection request declined',
    })
  } catch (error: any) {
    console.error('Error declining connection request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to decline connection request' },
      { status: 500 }
    )
  }
}
