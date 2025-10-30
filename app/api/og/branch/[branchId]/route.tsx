import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/og/branch/[branchId]
 * Returns Open Graph metadata for a branch
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const branchId = params.branchId

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        entries: {
          where: {
            mediaUrl: { not: null },
          },
          select: {
            mediaUrl: true,
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    const imageUrl = branch.entries[0]?.mediaUrl || `${req.nextUrl.origin}/og-default.jpg`
    const description = branch.description || `Memories and stories about ${branch.title}`

    return NextResponse.json({
      title: `${branch.title} - Firefly Grove`,
      description,
      image: imageUrl,
      url: `${req.nextUrl.origin}/branch/${branchId}`,
    })
  } catch (error) {
    console.error('Error fetching OG data:', error)
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 })
  }
}
