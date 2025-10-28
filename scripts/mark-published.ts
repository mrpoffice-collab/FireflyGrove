import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function markOverdueAsPublished() {
  try {
    const now = new Date()

    // Find all approved draft blog posts scheduled for today or earlier
    const postsToPublish = await prisma.marketingPost.findMany({
      where: {
        status: 'draft',
        isApproved: true,
        platform: 'blog',
        scheduledFor: {
          lte: now,
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    })

    if (postsToPublish.length === 0) {
      console.log('✅ No overdue blog posts to publish')
      return
    }

    console.log(`\n📝 Found ${postsToPublish.length} overdue blog post(s)\n`)

    // Ensure blog directory exists
    const blogDir = path.join(process.cwd(), 'content', 'blog')
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true })
    }

    for (const post of postsToPublish) {
      try {
        console.log(`Publishing: ${post.title}`)
        console.log(`  Scheduled: ${post.scheduledFor?.toLocaleDateString()}`)

        // Generate slug
        const slug = post.slug || post.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        // Create markdown file
        const filename = `${slug}.md`
        const filepath = path.join(blogDir, filename)

        const publishDate = new Date()
        const dateStr = publishDate.toISOString().split('T')[0]
        const wordCount = post.content.split(/\s+/).length
        const readTime = Math.ceil(wordCount / 200)
        const imageUrl = post.image || 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=1200&h=630&fit=crop'

        const markdown = `---
title: "${post.title.replace(/"/g, '\\"')}"
date: "${dateStr}"
excerpt: "${(post.excerpt || post.metaDescription || '').replace(/"/g, '\\"')}"
author: "Firefly Grove Team"
category: "Memory Preservation"
readTime: "${readTime} min read"
image: "${imageUrl}"
---

${post.content}
`

        fs.writeFileSync(filepath, markdown, 'utf-8')

        // Update database
        await prisma.marketingPost.update({
          where: { id: post.id },
          data: {
            status: 'published',
            publishedAt: publishDate,
            slug: slug,
          },
        })

        console.log(`  ✅ Published: /blog/${slug}\n`)
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

markOverdueAsPublished()
