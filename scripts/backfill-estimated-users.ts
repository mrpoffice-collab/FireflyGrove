import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillEstimatedUsers() {
  try {
    console.log('🔄 Backfilling estimatedUsers for existing marketing posts...\n')

    // Get all posts that have a topic but no estimatedUsers
    const postsWithTopics = await prisma.marketingPost.findMany({
      where: {
        topic: { not: null },
        OR: [
          { estimatedUsers: null },
          { estimatedUsers: 0 },
        ],
      },
      select: {
        id: true,
        topic: true,
        title: true,
        platform: true,
      },
    })

    console.log(`Found ${postsWithTopics.length} posts that need estimatedUsers backfilled\n`)

    let updated = 0
    let notFound = 0

    for (const post of postsWithTopics) {
      // Find the topic score for this post's topic
      const topicScore = await prisma.topicScore.findFirst({
        where: {
          topic: post.topic!,
        },
        select: {
          estimatedUsers: true,
          topic: true,
        },
      })

      if (topicScore && topicScore.estimatedUsers) {
        // Update the post with the estimated users
        await prisma.marketingPost.update({
          where: { id: post.id },
          data: { estimatedUsers: topicScore.estimatedUsers },
        })

        console.log(`✅ ${post.platform.padEnd(10)} | "${post.title.substring(0, 50)}" → ${topicScore.estimatedUsers} users`)
        updated++
      } else {
        console.log(`⚠️  ${post.platform.padEnd(10)} | "${post.title.substring(0, 50)}" → Topic not found or no estimate`)
        notFound++
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   Updated: ${updated}`)
    console.log(`   Not found: ${notFound}`)
    console.log(`   Total: ${postsWithTopics.length}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backfillEstimatedUsers()
