import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/stats
 *
 * Get platform-wide statistics
 */
export async function GET() {
  try {
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
