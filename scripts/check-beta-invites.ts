/**
 * Check Beta Invites - Diagnostic Script
 *
 * Checks the database for beta invites and displays stats
 */

import { prisma } from '../lib/prisma'

async function main() {
  console.log('🔍 Checking Beta Invites in Database...\n')

  // Get all beta invites
  const allInvites = await prisma.betaInvite.findMany({
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

  console.log(`📊 Total Invites: ${allInvites.length}`)
  console.log(`✅ Signed Up: ${allInvites.filter(i => i.signedUp).length}`)
  console.log(`⏳ Pending: ${allInvites.filter(i => !i.signedUp).length}`)
  console.log('')

  // Group by timeframe
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  console.log('📅 Invites by Timeframe:')
  console.log(`   Last 24h: ${allInvites.filter(i => new Date(i.createdAt) > last24h).length}`)
  console.log(`   Last 7d:  ${allInvites.filter(i => new Date(i.createdAt) > last7d).length}`)
  console.log(`   Last 30d: ${allInvites.filter(i => new Date(i.createdAt) > last30d).length}`)
  console.log('')

  // Show recent invites
  const recentInvites = allInvites.slice(0, 10)

  if (recentInvites.length > 0) {
    console.log('📧 Recent Invites (last 10):')
    console.log('─'.repeat(80))

    recentInvites.forEach((invite, index) => {
      const status = invite.signedUp ? '✅ SIGNED UP' : '⏳ PENDING'
      const date = new Date(invite.createdAt).toLocaleDateString()
      const signupDate = invite.signedUpAt ? new Date(invite.signedUpAt).toLocaleDateString() : '-'

      console.log(`${index + 1}. ${invite.email}`)
      console.log(`   Name: ${invite.name || '(none)'}`)
      console.log(`   Status: ${status}`)
      console.log(`   Sent: ${date}`)
      console.log(`   Signup: ${signupDate}`)
      console.log(`   Message: ${invite.message ? `"${invite.message.substring(0, 50)}..."` : '(none)'}`)
      console.log('')
    })
  } else {
    console.log('❌ No invites found in database')
    console.log('')
    console.log('💡 Possible reasons:')
    console.log('   1. No invites have been sent yet')
    console.log('   2. Using wrong database environment')
    console.log('   3. Invites were deleted')
    console.log('')
    console.log('✅ To send a test invite:')
    console.log('   npm run send-test-beta-invite')
  }

  // Check for invites with no sentBy (self-signups)
  const selfSignups = allInvites.filter(i => !i.sentBy)
  if (selfSignups.length > 0) {
    console.log(`\n🚀 Self-Signups (via Facebook/direct): ${selfSignups.length}`)
  }

  // Check for invites sent by admin
  const adminInvites = allInvites.filter(i => i.sentBy)
  if (adminInvites.length > 0) {
    console.log(`\n👤 Admin/User Invites: ${adminInvites.length}`)
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
