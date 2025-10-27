import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // North Star Metric: Total Users
    const totalUsers = await prisma.user.count()

    // Acquisition Metrics (Last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    })

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    })

    // Content Performance
    const publishedPosts = await prisma.marketingPost.count({
      where: { status: 'published' }
    })

    const totalViews = await prisma.marketingPost.aggregate({
      _sum: { views: true },
      where: { status: 'published' }
    })

    const totalSignups = await prisma.marketingPost.aggregate({
      _sum: { signups: true },
      where: { status: 'published' }
    })

    // Engagement Metrics
    const totalMemories = await prisma.entry.count()
    const totalBranches = await prisma.branch.count()
    const totalGroves = await prisma.grove.count()

    // Video & Sound Art
    const videosGenerated = await prisma.videoGeneration.count()
    const soundArtsCreated = await prisma.soundArt.count()

    // Email subscribers (assuming beta invites track this)
    const emailSubscribers = await prisma.betaInvite.count({
      where: { signedUp: false }
    })

    // Top performing posts
    const topPosts = await prisma.marketingPost.findMany({
      where: { status: 'published' },
      orderBy: { signups: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        views: true,
        signups: true,
        publishedAt: true
      }
    })

    // Calculate conversion rates
    const conversionRate = totalViews._sum.views && totalViews._sum.views > 0
      ? ((totalSignups._sum.signups || 0) / totalViews._sum.views * 100).toFixed(2)
      : '0.00'

    return NextResponse.json({
      northStar: {
        totalUsers,
        goal: 100,
        progress: (totalUsers / 100 * 100).toFixed(0)
      },
      acquisition: {
        newUsersThisMonth: newUsers,
        newUsersThisWeek: newUsersThisWeek,
        emailSubscribers
      },
      content: {
        publishedPosts,
        totalViews: totalViews._sum.views || 0,
        totalSignups: totalSignups._sum.signups || 0,
        conversionRate: parseFloat(conversionRate),
        topPosts
      },
      engagement: {
        totalMemories,
        totalBranches,
        totalGroves,
        videosGenerated,
        soundArtsCreated
      }
    })
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    )
  }
}
