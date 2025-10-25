import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/groves/available-for-transplant
 *
 * Get all groves where the user has caretaker permission
 * Used for transplanting trees between groves
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Find all groves where the user is the owner
    const groves = await prisma.grove.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        treeLimit: true,
        _count: {
          select: {
            trees: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({
      groves: groves.map((grove) => ({
        id: grove.id,
        name: grove.name,
        treeCount: grove._count.trees,
        treeLimit: grove.treeLimit,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching available groves:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch available groves' },
      { status: 500 }
    )
  }
}
