import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackEventServer, AnalyticsEvents, AnalyticsCategories, AnalyticsActions } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

/**
 * POST /api/trees
 *
 * Create a new tree in the user's grove
 * Enforces tree capacity limits based on subscription plan
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tree name is required' },
        { status: 400 }
      )
    }

    // Get user's grove with tree count
    const grove = await prisma.grove.findUnique({
      where: { userId },
      include: {
        _count: {
          select: {
            trees: {
              where: {
                status: {
                  not: 'DELETED',
                },
              },
            },
          },
        },
      },
    })

    if (!grove) {
      return NextResponse.json({ error: 'Grove not found' }, { status: 404 })
    }

    // Check if grove is canceled
    if (grove.status === 'canceled') {
      return NextResponse.json(
        { error: 'Your subscription is canceled. Please reactivate to create trees.' },
        { status: 403 }
      )
    }

    // Check capacity
    const currentTreeCount = grove._count.trees
    if (currentTreeCount >= grove.treeLimit) {
      return NextResponse.json(
        {
          error: `You've reached your tree capacity (${grove.treeLimit}). Upgrade your plan to add more trees.`,
          currentCount: currentTreeCount,
          limit: grove.treeLimit,
        },
        { status: 403 }
      )
    }

    // Create tree
    const tree = await prisma.tree.create({
      data: {
        groveId: grove.id,
        name: name.trim(),
        description: description?.trim() || null,
        status: 'ACTIVE',
      },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'CREATE_TREE',
        targetType: 'TREE',
        targetId: tree.id,
        metadata: JSON.stringify({
          name: tree.name,
          description: tree.description,
        }),
      },
    })

    // Track tree creation
    await trackEventServer(prisma, userId, {
      eventType: AnalyticsEvents.TREE_CREATED,
      category: AnalyticsCategories.TREES,
      action: AnalyticsActions.CREATED,
      metadata: {
        treeId: tree.id,
        currentTreeCount: currentTreeCount + 1,
        treeLimit: grove.treeLimit,
        planType: grove.planType,
      },
    })

    return NextResponse.json({
      success: true,
      tree: {
        id: tree.id,
        name: tree.name,
        description: tree.description,
        status: tree.status,
        createdAt: tree.createdAt.toISOString(),
      },
      message: 'Tree created successfully',
    })
  } catch (error: any) {
    console.error('Error creating tree:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create tree' },
      { status: 500 }
    )
  }
}
