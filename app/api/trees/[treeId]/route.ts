import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/trees/:treeId
 *
 * Get a specific tree with all its branches
 */
export async function GET(
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

    // Find the tree with branches
    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: {
        grove: true,
        branches: {
          where: {
            status: {
              not: 'DELETED',
            },
            archived: false,
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                entries: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 })
    }

    // Verify user owns this grove
    if (tree.grove.userId !== userId) {
      return NextResponse.json(
        { error: 'You do not have access to this tree' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: tree.id,
      name: tree.name,
      description: tree.description,
      status: tree.status,
      createdAt: tree.createdAt.toISOString(),
      branches: tree.branches.map((branch) => ({
        id: branch.id,
        title: branch.title,
        description: branch.description,
        personStatus: branch.personStatus,
        createdAt: branch.createdAt.toISOString(),
        owner: {
          id: branch.owner.id,
          name: branch.owner.name,
        },
        _count: {
          entries: branch._count.entries,
        },
      })),
    })
  } catch (error: any) {
    console.error('Error fetching tree:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tree' },
      { status: 500 }
    )
  }
}
