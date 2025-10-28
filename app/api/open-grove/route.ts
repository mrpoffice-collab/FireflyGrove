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

    // Fetch memorials and calculate total memories
    const [memorials, total, allMemorials] = await Promise.all([
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
            where: {
              status: 'ACTIVE',
            },
            select: {
              id: true,
              title: true,
            },
            take: 1,
            orderBy: {
              createdAt: 'asc', // Get the first/primary branch
            },
          },
        },
      }),
      prisma.person.count({ where }),
      // Get all memorials to calculate total memory count
      prisma.person.findMany({
        where,
        select: {
          memoryCount: true,
        },
      }),
    ])

    // Calculate total memories across all memorials
    const totalMemories = allMemorials.reduce((sum, person) => sum + (person.memoryCount || 0), 0)

    // Fetch memory ages for firefly visualization
    const memoryAges = await prisma.entry.findMany({
      where: {
        branch: {
          person: {
            isLegacy: true,
            discoveryEnabled: true,
            memberships: {
              some: {
                groveId: openGroveId,
                status: 'active',
              },
            },
          },
        },
        status: 'ACTIVE',
        visibility: 'LEGACY',
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate ages in days
    const now = new Date()
    const ages = memoryAges.map((entry) => {
      const ageMs = now.getTime() - new Date(entry.createdAt).getTime()
      return Math.floor(ageMs / (1000 * 60 * 60 * 24)) // Convert to days
    })

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
      totalMemories,
      memoryAges: ages,
    })
  } catch (error: any) {
    console.error('Error fetching Open Grove memorials:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch memorials' },
      { status: 500 }
    )
  }
}
