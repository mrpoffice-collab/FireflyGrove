import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publishBlogPost } from '@/lib/marketing/blogPublisher'
import { publishToFacebook } from '@/lib/marketing/platforms/facebook'
import { publishToPinterest } from '@/lib/marketing/platforms/pinterest'
import { publishToReddit } from '@/lib/marketing/platforms/reddit'
import { sendNewsletter } from '@/lib/marketing/platforms/email'

/**
 * POST /api/cron/publish-scheduled
 *
 * Cron job endpoint to auto-publish approved posts on their scheduled date
 *
 * To set up:
 * 1. Vercel Cron: Add to vercel.json:
 *    {
 *      "crons": [{
 *        "path": "/api/cron/publish-scheduled",
 *        "schedule": "0 9 * * *"  // 9 AM daily
 *      }]
 *    }
 *
 * 2. Or use external cron service (cron-job.org, EasyCron) to POST to this URL daily
 *
 * 3. Secure with CRON_SECRET env var to prevent unauthorized execution
 */
export async function POST(req: NextRequest) {
  try {
    // Security: Verify cron secret
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Running scheduled publishing cron job...')

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
      console.log('✅ No posts to publish today')
      return NextResponse.json({
        success: true,
        message: 'No posts to publish',
        published: 0,
      })
    }

    console.log(`📝 Found ${postsToPublish.length} post(s) to publish`)

    const results = {
      published: [] as string[],
      failed: [] as { id: string; error: string }[],
    }

    for (const post of postsToPublish) {
      try {
        console.log(`Publishing: ${post.title} (${post.platform})`)

        let publishResult
        let platformSuccess = false

        // Publish based on platform
        switch (post.platform) {
          case 'blog':
            // Write markdown file
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
            platformSuccess = true
            console.log(`  ✅ Published blog: ${url}`)
            break

          case 'facebook':
            // Post to Facebook
            const fbResult = await publishToFacebook({
              message: post.content,
              link: post.slug ? `https://fireflygrove.app/blog/${post.slug}` : undefined,
            })
            platformSuccess = fbResult.success
            if (fbResult.success) {
              console.log(`  ✅ Posted to Facebook: ${fbResult.postId}`)
            } else {
              console.error(`  ❌ Facebook failed: ${fbResult.error}`)
            }
            break

          case 'pinterest':
            // Create Pinterest pin with image
            const pinterestResult = await publishToPinterest({
              title: post.title,
              description: post.pinDescription || post.content,
              link: post.slug ? `https://fireflygrove.app/blog/${post.slug}` : 'https://fireflygrove.app',
              imageUrl: post.image || undefined, // Use assigned image if available
            })
            platformSuccess = pinterestResult.success
            if (pinterestResult.success) {
              console.log(`  ✅ Created Pinterest pin: ${pinterestResult.pinId}`)
            } else {
              console.error(`  ❌ Pinterest failed: ${pinterestResult.error}`)
            }
            break

          case 'reddit':
            // Post to Reddit
            const redditResult = await publishToReddit({
              subreddit: post.subreddit || 'test',
              title: post.title,
              body: post.content,
            })
            platformSuccess = redditResult.success
            if (redditResult.success) {
              console.log(`  ✅ Posted to Reddit: ${redditResult.postUrl}`)
            } else {
              console.error(`  ❌ Reddit failed: ${redditResult.error}`)
            }
            break

          case 'email':
            // Send newsletter
            const emailResult = await sendNewsletter({
              subject: post.title,
              content: post.content,
            })
            platformSuccess = emailResult.success
            if (emailResult.success) {
              console.log(`  ✅ Newsletter sent: ${emailResult.emailId}`)
            } else {
              console.error(`  ❌ Email failed: ${emailResult.error}`)
            }
            break

          default:
            console.log(`  ⚠️ Unknown platform: ${post.platform}`)
            platformSuccess = false
        }

        if (platformSuccess) {
          // Update status to published
          await prisma.marketingPost.update({
            where: { id: post.id },
            data: {
              status: 'published',
              publishedAt: new Date(),
            },
          })

          results.published.push(post.id)
        } else {
          // Mark as failed
          await prisma.marketingPost.update({
            where: { id: post.id },
            data: {
              status: 'failed',
            },
          })

          results.failed.push({
            id: post.id,
            error: 'Platform publishing failed',
          })
        }
      } catch (error) {
        console.error(`  ❌ Failed to publish ${post.id}:`, error)
        results.failed.push({
          id: post.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        // Mark as failed
        await prisma.marketingPost.update({
          where: { id: post.id },
          data: {
            status: 'failed',
          },
        })
      }
    }

    console.log(
      `✅ Publishing complete: ${results.published.length} published, ${results.failed.length} failed`
    )

    return NextResponse.json({
      success: true,
      message: `Published ${results.published.length} post(s)`,
      published: results.published.length,
      failed: results.failed.length,
      errors: results.failed,
    })
  } catch (error) {
    console.error('Error in scheduled publishing:', error)
    return NextResponse.json(
      {
        error: 'Failed to run scheduled publishing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/publish-scheduled
 * Check what posts are scheduled to publish
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date()

    const upcomingPosts = await prisma.marketingPost.findMany({
      where: {
        status: 'draft',
        isApproved: true,
        scheduledFor: {
          gte: now,
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      select: {
        id: true,
        title: true,
        platform: true,
        scheduledFor: true,
      },
    })

    const overduePosts = await prisma.marketingPost.findMany({
      where: {
        status: 'draft',
        isApproved: true,
        scheduledFor: {
          lt: now,
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
      select: {
        id: true,
        title: true,
        platform: true,
        scheduledFor: true,
      },
    })

    return NextResponse.json({
      upcoming: upcomingPosts,
      overdue: overduePosts,
      stats: {
        upcoming: upcomingPosts.length,
        overdue: overduePosts.length,
      },
    })
  } catch (error) {
    console.error('Error checking scheduled posts:', error)
    return NextResponse.json(
      { error: 'Failed to check scheduled posts' },
      { status: 500 }
    )
  }
}
