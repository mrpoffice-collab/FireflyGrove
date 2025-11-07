import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAnalyticsAPI() {
  console.log('🔍 Testing Analytics API Query...\n')

  const now = new Date()
  const startDate = new Date()
  startDate.setHours(now.getHours() - 24) // Last 24 hours

  console.log('📅 Timeframe: Last 24 hours')
  console.log(`Start: ${startDate.toISOString()}`)
  console.log(`End: ${now.toISOString()}\n`)

  // Total events count
  const totalEvents = await prisma.analyticsEvent.count({
    where: { createdAt: { gte: startDate } },
  })
  console.log(`✅ Total Events: ${totalEvents}`)

  // Events by category
  const eventsByCategory = await prisma.analyticsEvent.groupBy({
    by: ['category'],
    where: { createdAt: { gte: startDate } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  })
  console.log('\n📊 Events by Category:')
  eventsByCategory.forEach(item => {
    console.log(`  - ${item.category}: ${item._count.id}`)
  })

  // Events by type
  const eventsByType = await prisma.analyticsEvent.groupBy({
    by: ['eventType'],
    where: { createdAt: { gte: startDate } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })
  console.log('\n🎯 Events by Type:')
  eventsByType.forEach(item => {
    console.log(`  - ${item.eventType}: ${item._count.id}`)
  })

  // Recent events
  const recentEvents = await prisma.analyticsEvent.findMany({
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
  })
  console.log(`\n📝 Recent Events (${recentEvents.length} total):`)
  recentEvents.forEach((event, i) => {
    console.log(`\n  ${i + 1}. ${event.eventType} (${event.action})`)
    console.log(`     Category: ${event.category}`)
    console.log(`     Time: ${event.createdAt.toLocaleString()}`)
    console.log(`     User: ${event.userId ? event.userId.slice(-8) : 'anon'}`)
    console.log(`     Status: ${event.isError ? 'Error' : event.isAbandoned ? 'Abandoned' : 'Success'}`)
  })

  // Beta invites
  const betaInvites = await prisma.betaInvite.findMany({
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
  })
  console.log(`\n\n📧 Beta Invites (Last 24h): ${betaInvites.length}`)
  betaInvites.forEach(invite => {
    console.log(`  - ${invite.email} (${invite.signedUp ? 'Signed Up' : 'Pending'})`)
  })

  await prisma.$disconnect()
}

testAnalyticsAPI().catch(console.error)
