import { prisma } from '../lib/prisma.js'
import { trackEventServer, AnalyticsEvents, AnalyticsCategories, AnalyticsActions } from '../lib/analytics.js'

async function testAnalytics() {
  try {
    console.log('Testing analytics tracking...\n')

    // Get a user to test with
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ No users found in database. Please create a user first.')
      process.exit(1)
    }

    console.log(`✓ Found user: ${user.name} (${user.email})`)

    // Track a test event
    console.log('\nTracking test event...')
    await trackEventServer(prisma, user.id, {
      eventType: AnalyticsEvents.MEMORY_CREATED,
      category: AnalyticsCategories.MEMORIES,
      action: AnalyticsActions.CREATED,
      metadata: {
        test: true,
        memoryType: 'text',
      },
    })

    console.log('✓ Test event tracked successfully')

    // Get recent analytics
    console.log('\nFetching recent analytics...')
    const recentEvents = await prisma.analyticsEvent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eventType: true,
        category: true,
        action: true,
        userId: true,
        createdAt: true,
        metadata: true,
      },
    })

    console.log(`\n✓ Total recent events: ${recentEvents.length}`)
    console.log('\nMost recent events:')
    recentEvents.forEach((event, i) => {
      const metadata = event.metadata ? JSON.parse(event.metadata as string) : {}
      const testFlag = metadata.test ? ' [TEST]' : ''
      console.log(`  ${i + 1}. ${event.createdAt.toISOString()} | ${event.category}/${event.eventType}${testFlag}`)
    })

    // Get summary
    console.log('\n--- Event Summary by Category ---')
    const byCategory = await prisma.analyticsEvent.groupBy({
      by: ['category'],
      _count: true,
    })

    byCategory.forEach((row) => {
      console.log(`  ${row.category}: ${row._count} events`)
    })

    console.log('\n✅ Analytics tracking is working!')

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

testAnalytics()
