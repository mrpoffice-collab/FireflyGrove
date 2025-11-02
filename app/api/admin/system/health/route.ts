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

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // System info
    const system = {
      uptime: formatUptime(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform
    }

    // Database health check
    const dbStart = Date.now()
    let database = {
      status: 'connected' as 'connected' | 'disconnected' | 'error',
      responseTime: 0
    }

    try {
      await prisma.$queryRaw`SELECT 1`
      database.responseTime = Date.now() - dbStart
      database.status = 'connected'
    } catch (error) {
      database.status = 'error'
      database.responseTime = Date.now() - dbStart
    }

    // Error stats
    const [errors24h, errors7d, recentErrors] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          isError: true,
          createdAt: { gte: yesterday }
        }
      }),
      prisma.analyticsEvent.count({
        where: {
          isError: true,
          createdAt: { gte: lastWeek }
        }
      }),
      prisma.analyticsEvent.findMany({
        where: {
          isError: true
        },
        select: {
          id: true,
          eventType: true,
          action: true,
          createdAt: true,
          metadata: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      })
    ])

    // Storage stats
    const [totalBranches, totalEntries, entriesWithMedia] = await Promise.all([
      prisma.branch.count(),
      prisma.entry.count(),
      prisma.entry.count({
        where: {
          OR: [
            { photoUrl: { not: null } },
            { audioUrl: { not: null } }
          ]
        }
      })
    ])

    const healthData = {
      system,
      database,
      errors: {
        last24h: errors24h,
        last7d: errors7d,
        recentErrors
      },
      storage: {
        totalBranches,
        totalEntries,
        entriesWithMedia
      }
    }

    return NextResponse.json(healthData)
  } catch (error) {
    console.error('System health error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    )
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.length > 0 ? parts.join(' ') : '< 1m'
}
