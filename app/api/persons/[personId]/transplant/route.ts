import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/persons/:personId/transplant
 *
 * Transplant a tree (Person) from one grove to another
 * This allows a user to move their tree from someone else's grove to their own grove
 *
 * Requirements:
 * - Person must have userId (be a registered user)
 * - Requester must be the Person.userId (can only transplant your own tree)
 * - Destination grove must belong to the requester
 * - Destination grove must have available tree slots
 *
 * Body: { destinationGroveId: string }
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
    const { destinationGroveId } = body

    if (!destinationGroveId) {
      return NextResponse.json(
        { error: 'Destination grove ID is required' },
        { status: 400 }
      )
    }

    // Get the Person entity
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        memberships: {
          include: {
            grove: true,
          },
        },
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Verify person has a userId (is a registered user)
    if (!person.userId) {
      return NextResponse.json(
        { error: 'This tree cannot be transplanted because it is not linked to a user account' },
        { status: 400 }
      )
    }

    // Verify requester is the person's user
    if (person.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only transplant your own tree' },
        { status: 403 }
      )
    }

    // Get destination grove
    const destinationGrove = await prisma.grove.findUnique({
      where: { id: destinationGroveId },
    })

    if (!destinationGrove) {
      return NextResponse.json(
        { error: 'Destination grove not found' },
        { status: 404 }
      )
    }

    // Verify user owns destination grove
    if (destinationGrove.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only transplant to your own grove' },
        { status: 403 }
      )
    }

    // Find current original membership (where the tree was planted)
    const currentMembership = person.memberships.find(m => m.isOriginal)

    if (!currentMembership) {
      return NextResponse.json(
        { error: 'This tree does not have an original grove location' },
        { status: 400 }
      )
    }

    const sourceGroveId = currentMembership.groveId

    // Check if already in destination grove
    if (sourceGroveId === destinationGroveId) {
      return NextResponse.json(
        { error: 'Tree is already in this grove' },
        { status: 400 }
      )
    }

    // Check if destination grove has available slots
    if (destinationGrove.treeCount >= destinationGrove.treeLimit) {
      return NextResponse.json(
        { error: 'Destination grove has reached its tree limit. Please upgrade your plan.' },
        { status: 400 }
      )
    }

    // Perform the transplant in a transaction
    await prisma.$transaction(async (tx) => {
      // Remove from source grove
      await tx.groveTreeMembership.delete({
        where: { id: currentMembership.id },
      })

      // Decrement source grove tree count
      await tx.grove.update({
        where: { id: sourceGroveId },
        data: { treeCount: { decrement: 1 } },
      })

      // Check if already has a non-original membership in destination grove
      const existingDestMembership = person.memberships.find(
        m => m.groveId === destinationGroveId
      )

      if (existingDestMembership) {
        // Update existing membership to be original
        await tx.groveTreeMembership.update({
          where: { id: existingDestMembership.id },
          data: { isOriginal: true },
        })
      } else {
        // Create new membership in destination grove
        await tx.groveTreeMembership.create({
          data: {
            groveId: destinationGroveId,
            personId: personId,
            isOriginal: true,
            adoptionType: 'adopted',
            status: 'active',
          },
        })
      }

      // Increment destination grove tree count
      await tx.grove.update({
        where: { id: destinationGroveId },
        data: { treeCount: { increment: 1 } },
      })
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'TREE_TRANSPLANTED',
        targetType: 'PERSON',
        targetId: personId,
        metadata: JSON.stringify({
          sourceGroveId,
          destinationGroveId,
          personName: person.name,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: `${person.name}'s tree has been transplanted to your grove`,
      person: {
        id: person.id,
        name: person.name,
      },
      sourceGroveId,
      destinationGroveId,
    })
  } catch (error: any) {
    console.error('Error transplanting tree:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transplant tree' },
      { status: 500 }
    )
  }
}
