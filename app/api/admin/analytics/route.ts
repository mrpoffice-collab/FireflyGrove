import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get('timeframe') || '7days'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (timeframe) {
      case '24hours':
        startDate.setHours(now.getHours() - 24)
        break
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case '90days':
        startDate.setDate(now.getDate() - 90)
        break
      case 'all':
        startDate = new Date(0) // Beginning of time
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Fetch analytics data
    const [
      totalEvents,
      eventsByCategory,
      eventsByType,
      recentEvents,
      userActivity,
      errorEvents,
      abandonedActions,
      betaInviteStats,
    ] = await Promise.all([
      // Total events count
      prisma.analyticsEvent.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Events by category
      prisma.analyticsEvent.groupBy({
        by: ['category'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      // Events by type
      prisma.analyticsEvent.groupBy({
        by: ['eventType'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Recent events (last 50)
      prisma.analyticsEvent.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          userId: true,
          eventType: true,
          category: true,
          action: true,
          isError: true,
          isSuccess: true,
          isAbandoned: true,
          createdAt: true,
        },
      }),

      // Active users count
      prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: startDate },
          userId: { not: null },
        },
        _count: { id: true },
      }),

      // Error events
      prisma.analyticsEvent.count({
        where: {
          createdAt: { gte: startDate },
          isError: true,
        },
      }),

      // Abandoned actions
      prisma.analyticsEvent.count({
        where: {
          createdAt: { gte: startDate },
          isAbandoned: true,
        },
      }),

      // Beta invite statistics
      prisma.betaInvite.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          email: true,
          name: true,
          sentBy: true,
          signedUp: true,
          signedUpAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Calculate beta invite metrics
    const totalInvitesSent = betaInviteStats.length
    const totalSignups = betaInviteStats.filter(i => i.signedUp).length
    const conversionRate = totalInvitesSent > 0 ? (totalSignups / totalInvitesSent * 100).toFixed(1) : '0.0'

    return NextResponse.json({
      timeframe,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      summary: {
        totalEvents,
        activeUsers: userActivity.length,
        errorEvents,
        abandonedActions,
      },
      eventsByCategory: eventsByCategory.map((item) => ({
        category: item.category,
        count: item._count.id,
      })),
      eventsByType: eventsByType.map((item) => ({
        eventType: item.eventType,
        count: item._count.id,
      })),
      recentEvents,
      betaInvites: {
        totalSent: totalInvitesSent,
        totalSignups: totalSignups,
        conversionRate: conversionRate,
        invites: betaInviteStats,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
