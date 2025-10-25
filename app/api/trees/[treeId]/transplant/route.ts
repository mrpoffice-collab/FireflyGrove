import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/trees/:treeId/transplant
 *
 * Transplant a tree from one grove to another
 * - Legacy trees: no slot changes
 * - Living trees: frees slot in origin, consumes slot in destination
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { treeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const treeId = params.treeId

    const body = await req.json()
    const { destinationGroveId, keepContributors } = body

    if (!destinationGroveId) {
      return NextResponse.json(
        { error: 'Destination grove ID is required' },
        { status: 400 }
      )
    }

    // Find the tree with its current grove and branches
    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: {
        grove: true,
        branches: {
          select: {
            personStatus: true,
          },
        },
      },
    })

    if (!tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 })
    }

    // Verify user owns the source grove
    if (tree.grove.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to move this tree' },
        { status: 403 }
      )
    }

    // Find the destination grove
    const destinationGrove = await prisma.grove.findUnique({
      where: { id: destinationGroveId },
      include: {
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
    })

    if (!destinationGrove) {
      return NextResponse.json(
        { error: 'Destination grove not found' },
        { status: 404 }
      )
    }

    // Verify user owns the destination grove
    if (destinationGrove.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to add trees to this grove' },
        { status: 403 }
      )
    }

    // Check if tree is legacy (any branch with legacy status)
    const isLegacyTree = tree.branches.some(
      (branch) => branch.personStatus === 'legacy'
    )

    // For living trees, check if destination grove has space
    if (!isLegacyTree) {
      const currentTreeCount = destinationGrove._count.trees
      if (currentTreeCount >= destinationGrove.treeLimit) {
        return NextResponse.json(
          {
            error:
              'Destination grove has reached its tree limit. Please upgrade the plan or choose a different grove.',
          },
          { status: 400 }
        )
      }
    }

    // Perform the transplant
    await prisma.tree.update({
      where: { id: treeId },
      data: {
        groveId: destinationGroveId,
      },
    })

    console.log(
      `[Transplant] Tree ${tree.name} moved from ${tree.grove.name} to ${destinationGrove.name}`
    )
    console.log(`[Transplant] Is legacy tree: ${isLegacyTree}`)
    console.log(`[Transplant] Keep contributors: ${keepContributors}`)

    return NextResponse.json({
      success: true,
      message: `Tree successfully transplanted to ${destinationGrove.name}`,
      tree: {
        id: tree.id,
        name: tree.name,
        newGroveId: destinationGroveId,
        newGroveName: destinationGrove.name,
      },
    })
  } catch (error: any) {
    console.error('Error transplanting tree:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to transplant tree' },
      { status: 500 }
    )
  }
}
