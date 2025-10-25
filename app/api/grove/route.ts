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

    // Find or create user's grove
    let grove = await prisma.grove.findUnique({
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
        memberships: {
          where: {
            status: 'active',
          },
          include: {
            person: {
              include: {
                _count: {
                  select: {
                    branches: true,
                  },
                },
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
      // Create grove if it doesn't exist (first-time user)
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      // Beta testers get Family Grove (10 trees), others get Trial (1 tree)
      const planType = user?.isBetaTester ? 'family' : 'trial'
      const treeLimit = user?.isBetaTester ? 10 : 1

      await prisma.grove.create({
        data: {
          userId,
          name: `${user?.name}'s Grove`,
          planType,
          treeLimit,
          treeCount: 0,
          status: 'active',
        },
      })

      if (user?.isBetaTester) {
        console.log(`[Beta] Created Family Grove for beta tester ${user.email}`)
      }

      // Fetch the newly created grove with includes
      grove = await prisma.grove.findUnique({
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
          memberships: {
            where: {
              status: 'active',
            },
            include: {
              person: {
                include: {
                  _count: {
                    select: {
                      branches: true,
                    },
                  },
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
        return NextResponse.json({ error: 'Failed to create grove' }, { status: 500 })
      }
    }

    // Separate original trees from rooted trees
    const originalPersons = grove.memberships.filter(m => m.isOriginal)
    const rootedPersons = grove.memberships.filter(m => !m.isOriginal && m.adoptionType === 'rooted')

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
      persons: originalPersons.map((membership) => ({
        id: membership.person.id,
        name: membership.person.name,
        isLegacy: membership.person.isLegacy,
        memoryCount: membership.person.memoryCount,
        createdAt: membership.createdAt.toISOString(),
        _count: {
          branches: membership.person._count.branches,
        },
      })),
      rootedPersons: rootedPersons.map((membership) => ({
        id: membership.person.id,
        name: membership.person.name,
        isLegacy: membership.person.isLegacy,
        memoryCount: membership.person.memoryCount,
        birthDate: membership.person.birthDate?.toISOString() || null,
        deathDate: membership.person.deathDate?.toISOString() || null,
        createdAt: membership.createdAt.toISOString(),
        _count: {
          branches: membership.person._count.branches,
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
