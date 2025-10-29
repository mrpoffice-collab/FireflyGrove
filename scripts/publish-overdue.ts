import { PrismaClient } from '@prisma/client'
import { publishBlogPost } from '../lib/marketing/blogPublisher'

const prisma = new PrismaClient()

async function publishOverduePosts() {
  try {
    const now = new Date()

    // Find all approved draft posts scheduled for today or earlier
    const postsToPublish = await prisma.marketingPost.findMany({
      where: {
        status: 'draft',
        isApproved: true,
        scheduledFor: {
          lte: now,
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    })

    if (postsToPublish.length === 0) {
      console.log('✅ No overdue posts to publish')
      return
    }

    console.log(`\n📝 Found ${postsToPublish.length} overdue post(s) to publish\n`)

    for (const post of postsToPublish) {
      try {
        console.log(`Publishing: ${post.title}`)
        console.log(`  Platform: ${post.platform}`)
        console.log(`  Scheduled: ${post.scheduledFor?.toLocaleDateString()}`)

        if (post.platform === 'blog') {
          // Publish blog post
          const url = await publishBlogPost({
            id: post.id,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            slug: post.slug,
            metaDescription: post.metaDescription,
            keywords: post.keywords,
            scheduledFor: post.scheduledFor,
            topic: post.topic,
          })

          // Update status to published
          await prisma.marketingPost.update({
            where: { id: post.id },
            data: {
              status: 'published',
              publishedAt: new Date(),
            },
          })

          console.log(`  ✅ Published: ${url}\n`)
        } else {
          console.log(`  ⚠️  Skipping ${post.platform} (only blog posts supported in this script)`)
          console.log(`     Run the full cron job for social media publishing\n`)
        }
      } catch (error) {
        console.error(`  ❌ Failed:`, error)
        console.log('')
      }
    }

    console.log('✅ Publishing complete!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

publishOverduePosts()
