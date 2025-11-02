import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get dashboard stats
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // User stats
    const [
      totalUsers,
      betaTesters,
      activeSubscribers,
      trialUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBetaTester: true } }),
      prisma.user.count({
        where: {
          subscriptionStatus: 'active',
          status: 'ACTIVE'
        }
      }),
      prisma.grove.count({
        where: {
          planType: 'trial',
          status: 'active'
        }
      })
    ])

    // Content stats
    const [
      totalMemories,
      totalBranches,
      publicMemorials,
      pendingReports
    ] = await Promise.all([
      prisma.entry.count(),
      prisma.branch.count(),
      prisma.person.count({
        where: {
          isLegacy: true,
          discoveryEnabled: true
        }
      }),
      prisma.report.count({
        where: {
          status: 'OPEN'
        }
      })
    ])

    // 24h activity
    const [
      newUsers24h,
      newMemories24h,
      errors24h
    ] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: yesterday }
        }
      }),
      prisma.entry.count({
        where: {
          createdAt: { gte: yesterday }
        }
      }),
      prisma.analyticsEvent.count({
        where: {
          isError: true,
          createdAt: { gte: yesterday }
        }
      })
    ])

    // Beta invites
    const betaInvites = await prisma.betaInvite.findMany({
      select: {
        signedUp: true
      }
    })

    const totalSent = betaInvites.length
    const totalSignups = betaInvites.filter(i => i.signedUp).length
    const conversionRate = totalSent > 0
      ? ((totalSignups / totalSent) * 100).toFixed(1)
      : '0.0'

    // Generate alerts
    const alerts = []

    if (pendingReports > 0) {
      alerts.push({
        id: 'pending-reports',
        type: 'warning',
        category: 'Content Moderation',
        message: `${pendingReports} content report${pendingReports !== 1 ? 's' : ''} pending review`,
        count: pendingReports,
        action: { label: 'Review', href: '/admin/content/reports' }
      })
    }

    if (errors24h > 10) {
      alerts.push({
        id: 'high-error-rate',
        type: 'error',
        category: 'System Health',
        message: `${errors24h} errors in the last 24 hours`,
        count: errors24h,
        action: { label: 'View Logs', href: '/admin/system/health' }
      })
    }

    // Check for expiring trials (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const expiringTrials = await prisma.user.count({
      where: {
        subscriptionStatus: null,
        grove: {
          planType: 'trial',
          createdAt: {
            lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Trial started more than 7 days ago
          }
        }
      }
    })

    if (expiringTrials > 0) {
      alerts.push({
        id: 'expiring-trials',
        type: 'info',
        category: 'User Retention',
        message: `${expiringTrials} trial${expiringTrials !== 1 ? 's' : ''} expiring soon`,
        count: expiringTrials,
        action: { label: 'View Users', href: '/admin/users' }
      })
    }

    const stats = {
      users: {
        total: totalUsers,
        betaTesters,
        activeSubscribers,
        trialUsers
      },
      content: {
        totalMemories,
        totalBranches,
        publicMemorials,
        pendingReports
      },
      activity: {
        last24h: {
          newUsers: newUsers24h,
          newMemories: newMemories24h,
          errors: errors24h
        }
      },
      betaInvites: {
        totalSent,
        totalSignups,
        conversionRate
      }
    }

    return NextResponse.json({ stats, alerts })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
}
