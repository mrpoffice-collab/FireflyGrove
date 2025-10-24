import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { memoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memoryId } = params
    const { searchParams } = new URL(req.url)
    const branchId = searchParams.get('branchId')

    if (!branchId) {
      return NextResponse.json({ error: 'branchId required' }, { status: 400 })
    }

    // Get all links for this memory
    const links = await prisma.memoryBranchLink.findMany({
      where: {
        memoryId,
        visibilityStatus: {
          in: ['active', 'pending_approval'],
        },
      },
      include: {
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Check if memory is shared (more than one link)
    const isShared = links.length > 1

    // Find origin branch
    const originLink = links.find((link) => link.role === 'origin')
    const originBranch = originLink && originLink.branchId !== branchId
      ? originLink.branch.title
      : null

    // Find other shared branches (excluding current branch and origin)
    const sharedBranches = links
      .filter((link) =>
        link.role === 'shared' &&
        link.branchId !== branchId &&
        link.visibilityStatus === 'active'
      )
      .map((link) => link.branch.title)

    return NextResponse.json({
      isShared,
      originBranch,
      sharedBranches,
    })
  } catch (error) {
    console.error('Error fetching sharing info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sharing info' },
      { status: 500 }
    )
  }
}
