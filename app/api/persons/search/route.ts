import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/persons/search
 *
 * Search for existing Users and Persons by name
 * Enables discovery when creating branches
 *
 * Query params:
 *   - name: string (required) - name to search for
 *   - limit: number (optional, default: 5, max: 20)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const name = searchParams.get('name')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20)

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }

    const searchTerm = name.trim()

    // Search for registered Users
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        persons: {
          select: {
            id: true,
            name: true,
            isLegacy: true,
          },
          take: 1,
        },
      },
      take: limit,
    })

    // Search for Persons (with discovery enabled or owned by requester)
    const persons = await prisma.person.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        OR: [
          { discoveryEnabled: true },
          { ownerId: (session.user as any).id },
        ],
      },
      select: {
        id: true,
        name: true,
        userId: true,
        isLegacy: true,
        discoveryEnabled: true,
        birthDate: true,
        deathDate: true,
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        memberships: {
          select: {
            groveId: true,
            isOriginal: true,
          },
        },
      },
      take: limit,
    })

    // Format results
    const results = {
      registeredUsers: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        type: 'registered_user',
        hasPersonEntity: user.persons.length > 0,
        personId: user.persons[0]?.id || null,
        isLegacy: user.persons[0]?.isLegacy || false,
      })),
      persons: persons.map((person) => ({
        id: person.id,
        name: person.name,
        type: 'person',
        isLegacy: person.isLegacy,
        hasUserAccount: !!person.userId,
        userId: person.userId,
        groveCount: person.memberships.filter((m) => m.isOriginal).length,
        owner: person.owner
          ? {
              id: person.owner.id,
              name: person.owner.name,
            }
          : null,
        birthDate: person.birthDate?.toISOString() || null,
        deathDate: person.deathDate?.toISOString() || null,
      })),
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Error searching persons:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search persons' },
      { status: 500 }
    )
  }
}
