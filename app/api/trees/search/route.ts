import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/trees/search
 *
 * Search for trees (Person entities) across accessible groves
 * Used for finding matching trees to create root connections
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const excludePersonId = searchParams.get('excludePersonId')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Search for Person entities where:
    // 1. The user has access through GroveTreeMembership
    // 2. OR the Person is in the Open Grove (discoveryEnabled = true)
    // 3. Exclude the current person if specified

    const persons = await prisma.person.findMany({
      where: {
        AND: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          excludePersonId
            ? {
                id: {
                  not: excludePersonId,
                },
              }
            : {},
          {
            OR: [
              // Trees in user's own groves
              {
                memberships: {
                  some: {
                    grove: {
                      userId,
                    },
                  },
                },
              },
              // Trees in Open Grove with discovery enabled
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
        ],
      },
      include: {
        memberships: {
          include: {
            grove: {
              select: {
                id: true,
                name: true,
                userId: true,
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 1, // Just get one membership to show grove info
        },
      },
      take: 20, // Limit results
    })

    const results = persons.map((person) => {
      const membership = person.memberships[0]
      const grove = membership?.grove

      return {
        personId: person.id,
        name: person.name,
        groveName: grove?.name || 'Unknown Grove',
        caretakerName: grove?.user?.name || 'Unknown',
        birthDate: person.birthDate?.toISOString() || null,
        deathDate: person.deathDate?.toISOString() || null,
        isLegacy: person.isLegacy,
      }
    })

    return NextResponse.json({
      results,
      query,
    })
  } catch (error: any) {
    console.error('Error searching trees:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search trees' },
      { status: 500 }
    )
  }
}
