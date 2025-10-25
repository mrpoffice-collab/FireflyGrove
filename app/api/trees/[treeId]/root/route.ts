import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/trees/:treeId/root
 *
 * Create a root connection between two Person entities (trees)
 * Enables bidirectional memory sharing across groves
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { treeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const personId1 = params.treeId

    const body = await req.json()
    const { targetPersonId } = body

    if (!targetPersonId) {
      return NextResponse.json(
        { error: 'Target person ID is required' },
        { status: 400 }
      )
    }

    if (personId1 === targetPersonId) {
      return NextResponse.json(
        { error: 'Cannot root a tree with itself' },
        { status: 400 }
      )
    }

    // Verify the source person exists and user has access
    const sourcePerson = await prisma.person.findFirst({
      where: {
        id: personId1,
        memberships: {
          some: {
            grove: {
              userId,
            },
          },
        },
      },
      include: {
        memberships: {
          include: {
            grove: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
      },
    })

    if (!sourcePerson) {
      return NextResponse.json(
        { error: 'Source tree not found or access denied' },
        { status: 404 }
      )
    }

    // Verify the target person exists and user has access (or it's in Open Grove)
    const targetPerson = await prisma.person.findFirst({
      where: {
        id: targetPersonId,
        OR: [
          {
            memberships: {
              some: {
                grove: {
                  userId,
                },
              },
            },
          },
          {
            discoveryEnabled: true,
            memberships: {
              some: {
                grove: {
                  isOpenGrove: true,
                },
              },
            },
          },
        ],
      },
      include: {
        memberships: {
          include: {
            grove: {
              select: {
                name: true,
              },
            },
          },
          take: 1,
        },
      },
    })

    if (!targetPerson) {
      return NextResponse.json(
        { error: 'Target tree not found or access denied' },
        { status: 404 }
      )
    }

    // Check if a root connection already exists (in either direction)
    const existingRoot = await prisma.personRoot.findFirst({
      where: {
        OR: [
          {
            personId1: personId1,
            personId2: targetPersonId,
          },
          {
            personId1: targetPersonId,
            personId2: personId1,
          },
        ],
        status: 'active',
      },
    })

    if (existingRoot) {
      return NextResponse.json(
        { error: 'These trees are already rooted together' },
        { status: 400 }
      )
    }

    // Create the root connection
    // Always store with the smaller ID first for consistency
    const [smallerId, largerId] = [personId1, targetPersonId].sort()

    await prisma.personRoot.create({
      data: {
        personId1: smallerId,
        personId2: largerId,
        createdBy: userId,
        status: 'active',
      },
    })

    console.log(
      `[Root] Created root connection between ${sourcePerson.name} and ${targetPerson.name}`
    )

    return NextResponse.json({
      success: true,
      message: `Successfully rooted ${sourcePerson.name} with ${targetPerson.name}`,
      root: {
        sourceName: sourcePerson.name,
        sourceGrove: sourcePerson.memberships[0]?.grove.name,
        targetName: targetPerson.name,
        targetGrove: targetPerson.memberships[0]?.grove.name,
      },
    })
  } catch (error: any) {
    console.error('Error creating root connection:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create root connection' },
      { status: 500 }
    )
  }
}
