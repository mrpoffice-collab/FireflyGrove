/**
 * Check Recent Beta Invites - Last 48 Hours
 *
 * Detailed check of invites from the last 2 days
 */

import { prisma } from '../lib/prisma'

async function main() {
  console.log('🔍 Checking Recent Beta Invites (Last 48 Hours)...\n')

  const now = new Date()
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  console.log(`📅 Current time: ${now.toLocaleString()}`)
  console.log(`📅 48 hours ago: ${twoDaysAgo.toLocaleString()}`)
  console.log(`📅 24 hours ago: ${yesterday.toLocaleString()}`)
  console.log('')

  // Get invites from last 48 hours
  const recentInvites = await prisma.betaInvite.findMany({
    where: {
      createdAt: { gte: twoDaysAgo }
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      sentBy: true,
      signedUp: true,
      signedUpAt: true,
      createdAt: true,
      updatedAt: true,
      message: true,
    }
  })

  console.log(`📊 Found ${recentInvites.length} invites in the last 48 hours\n`)

  if (recentInvites.length === 0) {
    console.log('❌ No invites found in the last 48 hours')
    console.log('')
    console.log('💡 This means:')
    console.log('   • No email invites were sent via /api/admin/send-beta-invite')
    console.log('   • No self-signups via /api/beta-signup')
    console.log('   • Check if invites were sent via different method (text/manual)')
    console.log('')

    // Show most recent invite
    const lastInvite = await prisma.betaInvite.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (lastInvite) {
      console.log('📧 Most recent invite in database:')
      console.log(`   Email: ${lastInvite.email}`)
      console.log(`   Name: ${lastInvite.name || '(none)'}`)
      console.log(`   Sent: ${new Date(lastInvite.createdAt).toLocaleString()}`)
      console.log(`   Status: ${lastInvite.signedUp ? 'Signed Up' : 'Pending'}`)
    }
  } else {
    console.log('📧 Recent Invites:')
    console.log('─'.repeat(80))

    recentInvites.forEach((invite, index) => {
      const createdAt = new Date(invite.createdAt)
      const hoursAgo = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
      const minutesAgo = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60))

      const timeAgo = hoursAgo > 0
        ? `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`
        : `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`

      const status = invite.signedUp ? '✅ SIGNED UP' : '⏳ PENDING'
      const source = invite.sentBy ? '👤 Admin/User Invite' : '🚀 Self-Signup'

      console.log(`\n${index + 1}. ${invite.email}`)
      console.log(`   Name: ${invite.name || '(none)'}`)
      console.log(`   Status: ${status}`)
      console.log(`   Source: ${source}`)
      console.log(`   Sent: ${createdAt.toLocaleString()} (${timeAgo})`)

      if (invite.signedUp && invite.signedUpAt) {
        console.log(`   Signup: ${new Date(invite.signedUpAt).toLocaleString()}`)
      }

      if (invite.message) {
        console.log(`   Message: "${invite.message.substring(0, 60)}${invite.message.length > 60 ? '...' : ''}"`)
      }

      if (invite.sentBy) {
        console.log(`   Sent By User ID: ${invite.sentBy}`)
      }
    })

    console.log('\n' + '─'.repeat(80))
  }

  // Check for registrations in last 48 hours
  console.log('\n👤 New User Registrations (Last 48 Hours):')

  const newUsers = await prisma.user.findMany({
    where: {
      createdAt: { gte: twoDaysAgo }
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      isBetaTester: true,
      createdAt: true,
    }
  })

  if (newUsers.length === 0) {
    console.log('   No new user registrations')
  } else {
    newUsers.forEach((user, index) => {
      const createdAt = new Date(user.createdAt)
      const hoursAgo = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))

      console.log(`\n   ${index + 1}. ${user.email}`)
      console.log(`      Name: ${user.name}`)
      console.log(`      Beta Tester: ${user.isBetaTester ? 'Yes' : 'No'}`)
      console.log(`      Registered: ${createdAt.toLocaleString()} (${hoursAgo}h ago)`)
    })
  }

  console.log('')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
