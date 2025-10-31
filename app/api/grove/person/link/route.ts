import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { linkPersonToGrove, findPersonById, isPersonInGrove } from '@/lib/person'

export const dynamic = 'force-dynamic'

/**
 * POST /api/grove/person/link
 *
 * Link an existing Person to a Grove (does not count toward tree limit)
 * Body: {
 *   groveId: string
 *   personId: string
 *   adoptionType?: "adopted" | "rooted" (default: "rooted")
 * }
 *
 * adoptionType:
 * - "rooted": Person is linked (doesn't use tree slot)
 * - "adopted": Person is moved/adopted (uses tree slot)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { groveId, personId, adoptionType = 'rooted' } = body

    // Validation
    if (!groveId) {
      return NextResponse.json(
        { error: 'Grove ID is required' },
        { status: 400 }
      )
    }

    if (!personId) {
      return NextResponse.json(
        { error: 'Person ID is required' },
        { status: 400 }
      )
    }

    if (adoptionType !== 'rooted' && adoptionType !== 'adopted') {
      return NextResponse.json(
        { error: 'Invalid adoption type. Must be "rooted" or "adopted"' },
        { status: 400 }
      )
    }

    // Verify user owns the Grove
    const { prisma } = await import('@/lib/prisma')
    const grove = await prisma.grove.findUnique({
      where: { id: groveId },
      select: {
        userId: true,
        status: true,
        isOpenGrove: true,
      },
    })

    if (!grove) {
      return NextResponse.json(
        { error: 'Grove not found' },
        { status: 404 }
      )
    }

    if (grove.userId !== userId && !grove.isOpenGrove) {
      return NextResponse.json(
        { error: 'You can only link people to your own Grove' },
        { status: 403 }
      )
    }

    // Verify Person exists
    const person = await findPersonById(personId)
    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    // Check if already linked
    const alreadyLinked = await isPersonInGrove(personId, groveId)
    if (alreadyLinked) {
      return NextResponse.json(
        { error: 'This person is already in your Grove' },
        { status: 400 }
      )
    }

    // Link Person to Grove
    const membership = await linkPersonToGrove(personId, groveId, adoptionType)

    // Create a Branch if one doesn't exist for this Person
    const existingBranch = await prisma.branch.findFirst({
      where: {
        personId,
        ownerId: userId,
      },
    })

    let branch
    if (!existingBranch) {
      branch = await prisma.branch.create({
        data: {
          personId,
          title: person.name,
          personStatus: person.isLegacy ? 'legacy' : 'living',
          ownerId: userId,
          status: 'ACTIVE',
        },
      })
    } else {
      branch = existingBranch
    }

    return NextResponse.json({
      success: true,
      message: adoptionType === 'adopted'
        ? 'Person adopted into your Grove'
        : 'Person linked to your Grove',
      person: {
        id: person.id,
        name: person.name,
        isLegacy: person.isLegacy,
        memoryCount: person.memoryCount,
        groveCount: person.groveCount + 1, // +1 for this new link
      },
      membership: {
        id: membership.id,
        isOriginal: membership.isOriginal,
        adoptionType: membership.adoptionType,
        status: membership.status,
        countsTowardLimit: adoptionType === 'adopted',
      },
      branch: {
        id: branch.id,
        title: branch.title,
      },
    })
  } catch (error) {
    console.error('Error linking person:', error)

    if (error instanceof Error) {
      if (error.message.includes('tree limit')) {
        return NextResponse.json(
          { error: error.message, needsUpgrade: true },
          { status: 400 }
        )
      }
      if (error.message.includes('already linked')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to link person' },
      { status: 500 }
    )
  }
}
