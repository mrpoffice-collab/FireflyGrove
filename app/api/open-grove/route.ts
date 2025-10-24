import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOpenGroveId } from '@/lib/openGrove'

export const dynamic = 'force-dynamic'

/**
 * GET /api/open-grove
 *
 * Get all public memorials in the Open Grove
 * Query params:
 *   - search: string (optional) - search by name
 *   - sortBy: 'recent' | 'name' | 'memories' (default: 'recent')
 *   - limit: number (default: 50, max: 100)
 *   - offset: number (default: 0)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'recent'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get Open Grove ID
    const openGroveId = await getOpenGroveId()

    // Build where clause
    const where: any = {
      isLegacy: true,
      discoveryEnabled: true, // Only show public memorials
      memberships: {
        some: {
          groveId: openGroveId,
          status: 'active',
        },
      },
    }

    // Add search filter
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'name') {
      orderBy = { name: 'asc' }
    } else if (sortBy === 'memories') {
      orderBy = { memoryCount: 'desc' }
    }

    // Fetch memorials
    const [memorials, total] = await Promise.all([
      prisma.person.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          branches: {
            select: {
              id: true,
              title: true,
            },
            take: 1,
          },
        },
      }),
      prisma.person.count({ where }),
    ])

    return NextResponse.json({
      memorials: memorials.map((person) => ({
        id: person.id,
        name: person.name,
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        memoryCount: person.memoryCount,
        memoryLimit: person.memoryLimit,
        ownerName: person.owner?.name || 'Unknown',
        branchId: person.branches[0]?.id || null,
        branchTitle: person.branches[0]?.title || person.name,
        createdAt: person.createdAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    console.error('Error fetching Open Grove memorials:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch memorials' },
      { status: 500 }
    )
  }
}
