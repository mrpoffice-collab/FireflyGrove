import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/branch-connections/:requestId/accept
 *
 * Accept a connection request and link the branch to the Person
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const requestId = params.requestId

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

    // Verify user has permission to accept (must be targetUserId)
    if (request.targetUserId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to accept this request' },
        { status: 403 }
      )
    }

    // Get branch and person
    const [branch, person] = await Promise.all([
      prisma.branch.findUnique({ where: { id: request.branchId } }),
      prisma.person.findUnique({ where: { id: request.personId } }),
    ])

    if (!branch || !person) {
      return NextResponse.json(
        { error: 'Branch or Person not found' },
        { status: 404 }
      )
    }

    // Check if branch is still available (not already linked)
    if (branch.personId) {
      return NextResponse.json(
        { error: 'This branch is already linked to another person' },
        { status: 400 }
      )
    }

    // Accept the request and link the branch
    await prisma.$transaction(async (tx) => {
      // Update request status
      await tx.branchConnectionRequest.update({
        where: { id: requestId },
        data: {
          status: 'accepted',
          respondedAt: new Date(),
          respondedBy: userId,
        },
      })

      // Link branch to person
      await tx.branch.update({
        where: { id: request.branchId },
        data: { personId: request.personId },
      })
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'CONNECTION_REQUEST_ACCEPTED',
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
      message: 'Connection request accepted. Branch is now linked to the person.',
    })
  } catch (error: any) {
    console.error('Error accepting connection request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to accept connection request' },
      { status: 500 }
    )
  }
}
