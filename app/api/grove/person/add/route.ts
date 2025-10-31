import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPersonInGrove } from '@/lib/person'
import { canAddOriginalTree } from '@/lib/capacity'

export const dynamic = 'force-dynamic'

/**
 * POST /api/grove/person/add
 *
 * Create a new Person and add to Grove as an original tree
 * Body: {
 *   groveId: string
 *   name: string
 *   birthDate?: string (ISO date)
 *   deathDate?: string (ISO date)
 *   isLegacy?: boolean
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { groveId, name, birthDate, deathDate, isLegacy } = body

    // Validation
    if (!groveId) {
      return NextResponse.json(
        { error: 'Grove ID is required' },
        { status: 400 }
      )
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
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
        { error: 'You can only add people to your own Grove' },
        { status: 403 }
      )
    }

    // Check capacity
    const hasCapacity = await canAddOriginalTree(groveId)
    if (!hasCapacity) {
      return NextResponse.json(
        {
          error: 'Grove has reached its tree limit',
          needsUpgrade: true,
        },
        { status: 400 }
      )
    }

    // Parse dates if provided
    let birthDateObj: Date | undefined
    let deathDateObj: Date | undefined

    if (birthDate) {
      birthDateObj = new Date(birthDate)
      if (isNaN(birthDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid birth date' },
          { status: 400 }
        )
      }
    }

    if (deathDate) {
      deathDateObj = new Date(deathDate)
      if (isNaN(deathDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid death date' },
          { status: 400 }
        )
      }

      // Death date must be in the past
      if (deathDateObj > new Date()) {
        return NextResponse.json(
          { error: 'Death date must be in the past' },
          { status: 400 }
        )
      }
    }

    // Validate legacy tree requirements
    if (isLegacy) {
      if (!birthDate) {
        return NextResponse.json(
          { error: 'Birth date is required for legacy trees' },
          { status: 400 }
        )
      }
      if (!deathDate) {
        return NextResponse.json(
          { error: 'Death date is required for legacy trees' },
          { status: 400 }
        )
      }
    }

    // Calculate trustee expiration for legacy trees (60 days)
    let trusteeExpiresAt: Date | undefined
    if (isLegacy) {
      trusteeExpiresAt = new Date()
      trusteeExpiresAt.setDate(trusteeExpiresAt.getDate() + 60)
    }

    // Create Person and add to Grove
    const result = await createPersonInGrove(groveId, {
      name,
      userId: isLegacy ? undefined : userId,
      birthDate: birthDateObj,
      deathDate: deathDateObj,
      isLegacy: isLegacy ?? false,
      trusteeId: isLegacy ? userId : undefined,
      ownerId: userId,
      moderatorId: userId,
      trusteeExpiresAt,
      discoveryEnabled: grove.isOpenGrove ? true : false,
      memoryLimit: grove.isOpenGrove ? 100 : undefined,
    })

    // Create a Branch for this Person
    const branch = await prisma.branch.create({
      data: {
        personId: result.person.id,
        title: name.trim(),
        personStatus: isLegacy ? 'legacy' : 'living',
        ownerId: userId,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({
      success: true,
      person: {
        id: result.person.id,
        name: result.person.name,
        isLegacy: result.person.isLegacy,
        memoryCount: result.person.memoryCount,
      },
      membership: {
        id: result.membership.id,
        isOriginal: result.membership.isOriginal,
        status: result.membership.status,
      },
      branch: {
        id: branch.id,
        title: branch.title,
      },
    })
  } catch (error) {
    console.error('Error creating person:', error)

    if (error instanceof Error) {
      if (error.message.includes('tree limit')) {
        return NextResponse.json(
          { error: error.message, needsUpgrade: true },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    )
  }
}
