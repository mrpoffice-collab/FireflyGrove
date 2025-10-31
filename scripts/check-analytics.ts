import { prisma } from '../lib/prisma.js'

async function checkAnalytics() {
  try {
    const count = await prisma.analyticsEvent.count()
    console.log('Total analytics events:', count)

    const recent = await prisma.analyticsEvent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eventType: true,
        category: true,
        action: true,
        userId: true,
        createdAt: true,
      },
    })

    console.log('\nRecent events:')
    recent.forEach((event) => {
      console.log(`  - ${event.createdAt.toISOString()} | ${event.category}/${event.eventType} | User: ${event.userId?.slice(-8) || 'anon'}`)
    })

    // Check timeframe data
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const last24h = await prisma.analyticsEvent.count({
      where: { createdAt: { gte: oneDayAgo } },
    })

    console.log(`\nLast 24 hours: ${last24h} events`)

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkAnalytics()
