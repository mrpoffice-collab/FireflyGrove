import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/persons/transplantable
 *
 * Get all Person entities (trees) that the current user can transplant to their grove
 *
 * Returns persons where:
 * - Person.userId matches current user
 * - Person's original membership is in a different grove (not user's grove)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get user's grove
    const userGrove = await prisma.grove.findUnique({
      where: { userId },
    })

    if (!userGrove) {
      return NextResponse.json({ transplantable: [] })
    }

    // Find all persons where userId matches and they have an original membership in a different grove
    const persons = await prisma.person.findMany({
      where: {
        userId: userId,
        memberships: {
          some: {
            isOriginal: true,
            groveId: {
              not: userGrove.id,
            },
          },
        },
      },
      include: {
        memberships: {
          where: {
            isOriginal: true,
          },
          include: {
            grove: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const transplantable = persons.map((person) => {
      const originalMembership = person.memberships[0]
      return {
        id: person.id,
        name: person.name,
        isLegacy: person.isLegacy,
        birthDate: person.birthDate?.toISOString() || null,
        deathDate: person.deathDate?.toISOString() || null,
        memoryCount: person.memoryCount,
        currentGrove: {
          id: originalMembership.grove.id,
          name: originalMembership.grove.name,
          owner: originalMembership.grove.user,
        },
      }
    })

    return NextResponse.json({ transplantable })
  } catch (error: any) {
    console.error('Error fetching transplantable persons:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transplantable trees' },
      { status: 500 }
    )
  }
}
