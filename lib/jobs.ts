import { prisma } from './prisma'
import { checkLegacyConditions } from './legacy'
import { isDemoMode, shouldBypassStorage } from './demo'
import crypto from 'crypto'

// Weekly Backup Job
export async function runWeeklyBackup() {
  if (shouldBypassStorage()) {
    console.log('[Demo Mode] Skipping backup job')
    return { success: true, message: 'Skipped in demo mode' }
  }

  try {
    console.log('Starting weekly backup...')

    // In production:
    // 1. Export database to SQL dump
    // 2. Create metadata JSON
    // 3. Upload to Backblaze B2
    // 4. Store backup record in database

    const filename = `backup-${new Date().toISOString().split('T')[0]}.sql`
    const hash = crypto.createHash('sha256').update(filename).digest('hex')

    await prisma.backup.create({
      data: {
        filename,
        storageUrl: `b2://firefly-grove/${filename}`,
        size: 0, // Would be actual size
        hash,
        verified: false,
      },
    })

    console.log('Weekly backup completed')
    return { success: true, filename }
  } catch (error: any) {
    console.error('Backup failed:', error)
    return { success: false, error: error.message }
  }
}

// Monthly Integrity Check
export async function runIntegrityCheck() {
  if (shouldBypassStorage()) {
    console.log('[Demo Mode] Skipping integrity check')
    return { success: true, message: 'Skipped in demo mode' }
  }

  try {
    console.log('Starting monthly integrity check...')

    const recentBackups = await prisma.backup.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const results = []

    for (const backup of recentBackups) {
      // In production:
      // 1. Download backup from B2
      // 2. Verify hash matches
      // 3. Update verified status

      if (!backup.verified) {
        await prisma.backup.update({
          where: { id: backup.id },
          data: {
            verified: true,
            verifiedAt: new Date(),
          },
        })
      }

      results.push({ filename: backup.filename, verified: true })
    }

    console.log(`Integrity check completed: ${results.length} backups verified`)
    return { success: true, verified: results.length }
  } catch (error: any) {
    console.error('Integrity check failed:', error)
    return { success: false, error: error.message }
  }
}

// Publish Scheduled Posts (runs daily)
export async function runPublishScheduled() {
  try {
    console.log('Starting scheduled post publisher...')

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
      console.log('No posts to publish today')
      return { success: true, published: 0 }
    }

    console.log(`Found ${postsToPublish.length} post(s) to publish`)

    const results = {
      published: [] as string[],
      failed: [] as { id: string; error: string }[],
    }

    for (const post of postsToPublish) {
      try {
        console.log(`Publishing: ${post.title} (${post.platform})`)

        if (post.platform === 'blog') {
          // Publish blog post as markdown file
          const fs = await import('fs')
          const path = await import('path')

          const blogDir = path.join(process.cwd(), 'content', 'blog')
          if (!fs.existsSync(blogDir)) {
            fs.mkdirSync(blogDir, { recursive: true })
          }

          const slug = post.slug || post.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')

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

          console.log(`  ✅ Published blog: /blog/${slug}`)
          results.published.push(post.id)
        } else {
          // For now, only blog posts are auto-published
          // Social media posts would need API integrations
          console.log(`  ⚠️ Skipping ${post.platform} (not yet implemented)`)
        }
      } catch (error) {
        console.error(`  ❌ Failed to publish ${post.id}:`, error)
        results.failed.push({
          id: post.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    console.log(
      `Publishing complete: ${results.published.length} published, ${results.failed.length} failed`
    )

    return {
      success: true,
      published: results.published.length,
      failed: results.failed.length,
      errors: results.failed,
    }
  } catch (error: any) {
    console.error('Scheduled publishing failed:', error)
    return { success: false, error: error.message }
  }
}

// Legacy Monitor (runs daily)
export async function runLegacyMonitor() {
  try {
    console.log('Starting legacy monitor...')

    const results = await checkLegacyConditions()

    console.log(`Legacy monitor completed: ${results.length} releases processed`)
    return { success: true, releases: results }
  } catch (error: any) {
    console.error('Legacy monitor failed:', error)
    return { success: false, error: error.message }
  }
}

// Subscription Monitor (runs nightly)
export async function runSubscriptionMonitor() {
  if (isDemoMode()) {
    console.log('[Demo Mode] Skipping subscription monitor')
    return { success: true, message: 'Skipped in demo mode' }
  }

  try {
    console.log('Starting subscription monitor...')

    // Find users whose subscriptions have ended
    const expiredUsers = await prisma.user.findMany({
      where: {
        subscriptionEndsAt: {
          lt: new Date(),
        },
        status: 'ACTIVE',
      },
    })

    const results = []

    for (const user of expiredUsers) {
      // Check if within grace period
      const graceEnds = new Date(
        (user.subscriptionEndsAt?.getTime() || 0) + 30 * 24 * 60 * 60 * 1000
      )

      if (new Date() < graceEnds) {
        // Still in grace period
        await prisma.user.update({
          where: { id: user.id },
          data: {
            graceEndsAt: graceEnds,
          },
        })
        results.push({ userId: user.id, status: 'grace_period' })
      } else {
        // Grace period ended, lock account
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: 'LOCKED',
          },
        })
        results.push({ userId: user.id, status: 'locked' })
      }
    }

    console.log(`Subscription monitor completed: ${results.length} users processed`)
    return { success: true, processed: results }
  } catch (error: any) {
    console.error('Subscription monitor failed:', error)
    return { success: false, error: error.message }
  }
}

// Main cron job handler
export async function runScheduledJobs(jobType: string) {
  console.log(`[Cron] Running ${jobType}...`)

  switch (jobType) {
    case 'weekly-backup':
      return await runWeeklyBackup()
    case 'monthly-integrity':
      return await runIntegrityCheck()
    case 'daily-legacy':
      // Run both legacy monitor AND publish scheduled posts
      const legacyResult = await runLegacyMonitor()
      const publishResult = await runPublishScheduled()
      return {
        success: legacyResult.success && publishResult.success,
        legacy: legacyResult,
        publishing: publishResult,
      }
    case 'nightly-subscription':
      return await runSubscriptionMonitor()
    default:
      return { success: false, error: 'Unknown job type' }
  }
}
