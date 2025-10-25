import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAccessibleBranchesWhere } from '@/lib/branch-access'

export const dynamic = 'force-dynamic'

/**
 * GET /api/trees/:treeId
 *
 * Get a specific tree with all its branches
 * Supports both old Tree model and new Person model
 * For Person model, includes branches from rooted trees (with access filtering)
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

    // Try to find as old Tree model first
    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: {
        grove: true,
        branches: {
          where: {
            AND: [
              {
                status: {
                  not: 'DELETED',
                },
              },
              { archived: false },
              // Only show branches user has access to
              getAccessibleBranchesWhere(userId),
            ],
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
            entries: {
              select: {
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
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

    // If found as old Tree model, return it
    if (tree) {
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
        grove: {
          id: tree.grove.id,
          name: tree.grove.name,
        },
        branches: tree.branches.map((branch) => ({
          id: branch.id,
          title: branch.title,
          description: branch.description,
          personStatus: branch.personStatus,
          createdAt: branch.createdAt.toISOString(),
          lastMemoryDate: branch.entries[0]?.createdAt?.toISOString() || null,
          owner: {
            id: branch.owner.id,
            name: branch.owner.name,
          },
          _count: {
            entries: branch._count.entries,
          },
        })),
      })
    }

    // Try as Person model (new architecture)
    // Find all rooted persons (including the original)
    const roots = await prisma.personRoot.findMany({
      where: {
        status: 'active',
        OR: [
          { personId1: treeId },
          { personId2: treeId },
        ],
      },
    })

    const personIds = new Set<string>([treeId])
    roots.forEach((root) => {
      personIds.add(root.personId1)
      personIds.add(root.personId2)
    })

    // Get the main person with their grove info
    const person = await prisma.person.findUnique({
      where: { id: treeId },
      include: {
        memberships: {
          include: {
            grove: true,
          },
          take: 1,
        },
      },
    })

    if (!person) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 })
    }

    // Get all accessible branches from this person and rooted persons
    const branches = await prisma.branch.findMany({
      where: {
        AND: [
          {
            personId: {
              in: Array.from(personIds),
            },
          },
          {
            status: {
              not: 'DELETED',
            },
          },
          { archived: false },
          // Only show branches user has access to
          getAccessibleBranchesWhere(userId),
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        person: {
          select: {
            id: true,
            name: true,
          },
        },
        entries: {
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
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
    })

    const grove = person.memberships[0]?.grove

    return NextResponse.json({
      id: person.id,
      name: person.name,
      description: null, // Person model doesn't have description yet
      status: 'ACTIVE',
      createdAt: person.createdAt.toISOString(),
      grove: grove ? {
        id: grove.id,
        name: grove.name,
      } : null,
      isRooted: roots.length > 0,
      rootedWith: roots.map(r => ({
        personId: r.personId1 === treeId ? r.personId2 : r.personId1,
      })),
      branches: branches.map((branch) => ({
        id: branch.id,
        title: branch.title,
        description: branch.description,
        personStatus: branch.personStatus,
        createdAt: branch.createdAt.toISOString(),
        lastMemoryDate: branch.entries[0]?.createdAt?.toISOString() || null,
        owner: {
          id: branch.owner.id,
          name: branch.owner.name,
        },
        _count: {
          entries: branch._count.entries,
        },
        // Indicate if this branch is from a rooted tree
        isFromRootedTree: branch.personId !== treeId,
        rootedTreeName: branch.personId !== treeId ? branch.person?.name : null,
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
