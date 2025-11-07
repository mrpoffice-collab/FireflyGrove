import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkInviteAnalytics() {
  console.log('🔍 Checking Invite Analytics...\n')

  // 1. Get all analytics events related to invites
  console.log('📊 ANALYTICS EVENTS (All Time):')
  console.log('=' .repeat(60))

  const analyticsEvents = await prisma.analyticsEvent.findMany({
    where: {
      category: 'invites'
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  })

  if (analyticsEvents.length === 0) {
    console.log('❌ No invite analytics events found!')
  } else {
    console.log(`Found ${analyticsEvents.length} events:\n`)

    // Group by action
    const eventsByAction = analyticsEvents.reduce((acc, event) => {
      if (!acc[event.action]) acc[event.action] = []
      acc[event.action].push(event)
      return acc
    }, {} as Record<string, typeof analyticsEvents>)

    for (const [action, events] of Object.entries(eventsByAction)) {
      console.log(`\n${action}: ${events.length} times`)
      events.slice(0, 3).forEach(event => {
        console.log(`  - ${event.createdAt.toLocaleString()}`)
        if (event.metadata) {
          console.log(`    Metadata: ${JSON.stringify(event.metadata, null, 2)}`)
        }
      })
    }
  }

  // 2. Get all beta invites
  console.log('\n\n📧 BETA INVITES (All Time):')
  console.log('=' .repeat(60))

  const betaInvites = await prisma.betaInvite.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (betaInvites.length === 0) {
    console.log('❌ No beta invites found!')
  } else {
    console.log(`Found ${betaInvites.length} invites:\n`)

    betaInvites.forEach((invite, i) => {
      console.log(`\n${i + 1}. ${invite.email}`)
      console.log(`   Signed up: ${invite.signedUp ? '✅ YES' : '❌ Pending'}`)
      console.log(`   Sent: ${invite.createdAt.toLocaleString()}`)
      console.log(`   Sent by user ID: ${invite.sentBy || 'Unknown'}`)
      if (invite.signedUp && invite.signedUpAt) {
        console.log(`   Signed up at: ${invite.signedUpAt.toLocaleString()}`)
      }
      if (invite.name) {
        console.log(`   Name: ${invite.name}`)
      }
      if (invite.message) {
        console.log(`   Message: ${invite.message.substring(0, 50)}${invite.message.length > 50 ? '...' : ''}`)
      }
    })
  }

  // 3. Check for Mickey Mouse specifically
  console.log('\n\n🐭 MICKEY MOUSE CHECK:')
  console.log('=' .repeat(60))

  const mickeyInvite = await prisma.betaInvite.findFirst({
    where: {
      OR: [
        { email: { contains: 'mickey', mode: 'insensitive' } },
        { name: { contains: 'mickey', mode: 'insensitive' } },
        { email: { contains: 'mouse', mode: 'insensitive' } },
        { name: { contains: 'mouse', mode: 'insensitive' } }
      ]
    }
  })

  if (!mickeyInvite) {
    console.log('❌ No Mickey Mouse invite found')
  } else {
    console.log('✅ Found Mickey Mouse invite!')
    console.log(`   Email: ${mickeyInvite.email}`)
    console.log(`   Name: ${mickeyInvite.name || 'N/A'}`)
    console.log(`   Signed up: ${mickeyInvite.signedUp ? '✅ YES' : '❌ Pending'}`)
    console.log(`   Sent: ${mickeyInvite.createdAt.toLocaleString()}`)
    console.log(`   Sent by user ID: ${mickeyInvite.sentBy || 'Unknown'}`)
    if (mickeyInvite.signedUp && mickeyInvite.signedUpAt) {
      console.log(`   Signed up at: ${mickeyInvite.signedUpAt.toLocaleString()}`)
    }
  }

  // 4. Recent activity (last 24 hours)
  console.log('\n\n⏰ LAST 24 HOURS ACTIVITY:')
  console.log('=' .repeat(60))

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const recentAnalytics = await prisma.analyticsEvent.count({
    where: {
      category: 'invites',
      createdAt: { gte: yesterday }
    }
  })

  const recentInvites = await prisma.betaInvite.count({
    where: {
      createdAt: { gte: yesterday }
    }
  })

  console.log(`Analytics events: ${recentAnalytics}`)
  console.log(`Beta invites sent: ${recentInvites}`)

  await prisma.$disconnect()
}

checkInviteAnalytics().catch(console.error)
