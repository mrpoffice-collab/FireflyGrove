import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/activity
 *
 * Returns recent user activity for admin users only
 * Shows: new users, beta testers, grove creations
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get activity from the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBetaTester: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get recent groves
    const recentGroves = await prisma.grove.findMany({
      where: {
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Combine into activity feed
    const activities = []

    // Add user signups
    for (const user of recentUsers) {
      activities.push({
        id: `user-${user.id}`,
        type: user.isBetaTester ? 'beta_signup' : 'user_signup',
        message: user.isBetaTester
          ? `${user.name} is now a beta tester`
          : `${user.name} created an account`,
        user: {
          name: user.name,
          email: user.email,
        },
        timestamp: user.createdAt.toISOString(),
      })
    }

    // Add grove creations
    for (const grove of recentGroves) {
      activities.push({
        id: `grove-${grove.id}`,
        type: 'grove_created',
        message: `${grove.user.name} created a grove: ${grove.name}`,
        user: {
          name: grove.user.name,
          email: grove.user.email,
        },
        grove: {
          name: grove.name,
        },
        timestamp: grove.createdAt.toISOString(),
      })
    }

    // Sort by timestamp descending
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      activities,
      count: activities.length,
    })
  } catch (error: any) {
    console.error('Error fetching admin activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
