import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkScheduledPosts() {
  try {
    const now = new Date()

    console.log(`\n📅 Current time: ${now.toLocaleString()}\n`)

    // Find overdue posts (scheduled for yesterday or earlier)
    const overduePosts = await prisma.marketingPost.findMany({
      where: {
        scheduledFor: {
          lt: now,
        },
        status: {
          in: ['draft', 'scheduled']
        }
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      select: {
        id: true,
        title: true,
        platform: true,
        status: true,
        isApproved: true,
        scheduledFor: true,
        createdAt: true,
      },
    })

    console.log(`🔍 Found ${overduePosts.length} overdue post(s):\n`)

    overduePosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title.substring(0, 60)}...`)
      console.log(`   ID: ${post.id.substring(0, 12)}...`)
      console.log(`   Platform: ${post.platform}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Approved: ${post.isApproved ? '✅ Yes' : '❌ No'}`)
      console.log(`   Scheduled: ${post.scheduledFor?.toLocaleDateString()}`)
      console.log(`   Days overdue: ${Math.floor((now.getTime() - (post.scheduledFor?.getTime() || 0)) / (1000 * 60 * 60 * 24))}`)
      console.log('')
    })

    // Find upcoming posts
    const upcomingPosts = await prisma.marketingPost.findMany({
      where: {
        scheduledFor: {
          gte: now,
        },
        status: {
          in: ['draft', 'scheduled']
        }
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        platform: true,
        status: true,
        isApproved: true,
        scheduledFor: true,
      },
    })

    console.log(`📆 Next ${upcomingPosts.length} upcoming post(s):\n`)

    upcomingPosts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title.substring(0, 60)}...`)
      console.log(`   Platform: ${post.platform}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Approved: ${post.isApproved ? '✅ Yes' : '❌ No'}`)
      console.log(`   Scheduled: ${post.scheduledFor?.toLocaleDateString()}`)
      console.log('')
    })

    console.log('\n💡 Note: Posts need to be:')
    console.log('   - Status: "draft"')
    console.log('   - isApproved: true')
    console.log('   - scheduledFor: in the past')
    console.log('\nTo publish, the cron job /api/cron/publish-scheduled must run.')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkScheduledPosts()
