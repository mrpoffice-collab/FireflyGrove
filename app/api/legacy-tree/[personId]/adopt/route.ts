import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOpenGroveId } from '@/lib/openGrove'

export const dynamic = 'force-dynamic'

/**
 * POST /api/legacy-tree/:personId/adopt
 *
 * Adopt a legacy tree from Open Grove into user's private grove
 * Body: { groveId: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { personId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const personId = params.personId
    const body = await req.json()
    const { groveId } = body

    if (!groveId) {
      return NextResponse.json(
        { error: 'Grove ID is required' },
        { status: 400 }
      )
    }

    // Verify user owns the target grove
    const grove = await prisma.grove.findUnique({
      where: { id: groveId },
    })

    if (!grove) {
      return NextResponse.json(
        { error: 'Grove not found' },
        { status: 404 }
      )
    }

    if (grove.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only adopt trees into your own grove' },
        { status: 403 }
      )
    }

    // Check grove capacity
    if (grove.treeCount >= grove.treeLimit) {
      return NextResponse.json(
        { error: 'Grove is at capacity. Upgrade your plan to add more trees.' },
        { status: 403 }
      )
    }

    // Find the person (legacy tree)
    const person = await prisma.person.findUnique({
      where: { id: personId },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Legacy tree not found' },
        { status: 404 }
      )
    }

    if (!person.isLegacy) {
      return NextResponse.json(
        { error: 'This is not a legacy tree' },
        { status: 400 }
      )
    }

    // Only owner can adopt
    if (person.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the owner can adopt this tree into a grove' },
        { status: 403 }
      )
    }

    const openGroveId = await getOpenGroveId()

    // Check if tree is currently in Open Grove
    const currentMembership = await prisma.groveTreeMembership.findFirst({
      where: {
        personId,
        groveId: openGroveId,
        isOriginal: true,
      },
    })

    if (!currentMembership) {
      return NextResponse.json(
        { error: 'This tree is not in the Open Grove and cannot be adopted' },
        { status: 400 }
      )
    }

    // Transaction: Move tree from Open Grove to private grove
    await prisma.$transaction(async (tx) => {
      // Remove from Open Grove
      await tx.groveTreeMembership.delete({
        where: { id: currentMembership.id },
      })

      // Add to user's grove
      await tx.groveTreeMembership.create({
        data: {
          groveId,
          personId,
          isOriginal: true,
          status: 'active',
          adoptionType: 'adopted',
        },
      })

      // Update person: remove memory limit
      await tx.person.update({
        where: { id: personId },
        data: {
          memoryLimit: null, // Unlimited memories in private grove
        },
      })

      // Increment tree count in target grove
      await tx.grove.update({
        where: { id: groveId },
        data: { treeCount: { increment: 1 } },
      })
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'ADOPT',
        targetType: 'PERSON',
        targetId: personId,
        metadata: JSON.stringify({
          fromGrove: openGroveId,
          toGrove: groveId,
          removedMemoryLimit: true,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Legacy tree adopted into your grove successfully!',
    })
  } catch (error: any) {
    console.error('Error adopting legacy tree:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to adopt legacy tree' },
      { status: 500 }
    )
  }
}
