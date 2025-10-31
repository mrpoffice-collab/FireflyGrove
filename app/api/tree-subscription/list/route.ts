import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tree-subscription/list
 *
 * Returns all individual tree subscriptions for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Fetch all tree subscriptions for this user
    const subscriptions = await prisma.treeSubscription.findMany({
      where: {
        userId,
      },
      include: {
        membership: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                isLegacy: true,
              },
            },
            grove: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format response
    const formattedSubscriptions = subscriptions.map((sub) => ({
      id: sub.id,
      status: sub.status,
      renewalDate: sub.renewalDate?.toISOString() || null,
      createdAt: sub.createdAt.toISOString(),
      stripeSubscriptionId: sub.stripeSubscriptionId,
      person: {
        id: sub.membership.person.id,
        name: sub.membership.person.name,
        isLegacy: sub.membership.person.isLegacy,
      },
      grove: {
        id: sub.membership.grove.id,
        name: sub.membership.grove.name,
      },
      membershipId: sub.membershipId,
    }))

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
      count: formattedSubscriptions.length,
    })
  } catch (error: any) {
    console.error('Error fetching tree subscriptions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tree subscriptions' },
      { status: 500 }
    )
  }
}
