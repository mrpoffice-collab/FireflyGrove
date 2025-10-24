import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/branch-connections/request
 *
 * Create a connection request to link a branch to an existing Person entity
 * Body: { branchId: string, personId: string, message?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { branchId, personId, message } = body

    if (!branchId || !personId) {
      return NextResponse.json(
        { error: 'Branch ID and Person ID are required' },
        { status: 400 }
      )
    }

    // Verify user owns the branch
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    })

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      )
    }

    if (branch.ownerId !== userId) {
      return NextResponse.json(
        { error: 'You can only create connection requests for your own branches' },
        { status: 403 }
      )
    }

    // Check if branch is already linked to a person
    if (branch.personId) {
      return NextResponse.json(
        { error: 'This branch is already linked to a person' },
        { status: 400 }
      )
    }

    // Get the Person entity
    const person = await prisma.person.findUnique({
      where: { id: personId },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Check if a pending request already exists
    const existingRequest = await prisma.branchConnectionRequest.findFirst({
      where: {
        branchId,
        personId,
        status: 'pending',
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A connection request is already pending for this branch and person' },
        { status: 400 }
      )
    }

    // AUTO-ACCEPT if Person.userId matches requester (user linking to their own person)
    if (person.userId === userId) {
      // Directly link the branch to the person
      await prisma.branch.update({
        where: { id: branchId },
        data: { personId },
      })

      // Create audit log
      await prisma.audit.create({
        data: {
          actorId: userId,
          action: 'BRANCH_PERSON_LINK',
          targetType: 'BRANCH',
          targetId: branchId,
          metadata: JSON.stringify({
            personId,
            autoAccepted: true,
            reason: 'User linking to their own Person entity',
          }),
        },
      })

      return NextResponse.json({
        success: true,
        autoAccepted: true,
        message: 'Branch automatically linked to your person entity',
      })
    }

    // Create connection request for two-sided consent
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Expires in 30 days

    const request = await prisma.branchConnectionRequest.create({
      data: {
        requesterId: userId,
        personId,
        branchId,
        targetUserId: person.userId || person.ownerId,
        status: 'pending',
        message: message || null,
        expiresAt,
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'CONNECTION_REQUEST_CREATED',
        targetType: 'BRANCH_CONNECTION_REQUEST',
        targetId: request.id,
        metadata: JSON.stringify({
          branchId,
          personId,
          targetUserId: person.userId || person.ownerId,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      request: {
        id: request.id,
        status: request.status,
        createdAt: request.createdAt.toISOString(),
        expiresAt: request.expiresAt.toISOString(),
      },
      message: 'Connection request sent successfully',
    })
  } catch (error: any) {
    console.error('Error creating connection request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create connection request' },
      { status: 500 }
    )
  }
}
