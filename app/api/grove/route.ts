import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/grove
 *
 * Returns the user's Grove with all Trees and their branch counts
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Find user's grove
    const grove = await prisma.grove.findUnique({
      where: { userId },
      include: {
        trees: {
          where: {
            status: {
              not: 'DELETED',
            },
          },
          include: {
            _count: {
              select: {
                branches: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!grove) {
      return NextResponse.json({ error: 'Grove not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: grove.id,
      name: grove.name,
      planType: grove.planType,
      treeLimit: grove.treeLimit,
      status: grove.status,
      trees: grove.trees.map((tree) => ({
        id: tree.id,
        name: tree.name,
        description: tree.description,
        status: tree.status,
        createdAt: tree.createdAt.toISOString(),
        _count: {
          branches: tree._count.branches,
        },
      })),
    })
  } catch (error: any) {
    console.error('Error fetching grove:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch grove' },
      { status: 500 }
    )
  }
}
