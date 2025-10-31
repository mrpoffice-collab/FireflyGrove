import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stats
 *
 * Get platform-wide statistics (requires authentication)
 */
export async function GET() {
  try {
    // Require authentication to view platform stats
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [groveCount, treeCount, branchCount, memoryCount] = await Promise.all([
      prisma.grove.count(),
      prisma.tree.count(),
      prisma.branch.count(),
      prisma.entry.count(),
    ])

    return NextResponse.json({
      groves: groveCount,
      trees: treeCount,
      branches: branchCount,
      memories: memoryCount,
    })
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
