import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateContentBrief } from '@/lib/marketing/briefGenerator'
import { writeContentFromBrief } from '@/lib/marketing/contentWriter'
import { repurposeContent } from '@/lib/marketing/contentRepurposer'

interface FormatConfig {
  blog?: number // How many blog posts (always 1 for the main post)
  newsletter?: number // Newsletter email (0 or 1)
  facebook?: number // How many FB posts
  pinterest?: number // How many pinterest pins
  reddit?: number // How many reddit posts
}

/**
 * POST /api/marketing/topics/batch-generate
 * Generate content from multiple selected topics
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const {
      topicIds, // Array of topic IDs to generate from
      formats, // { blog: 1, reddit: 0, pinterest: 0, email: 0 }
      startDate, // When to start scheduling posts
      intervalDays, // Days between posts (default: 7)
    } = body as {
      topicIds: string[]
      formats: FormatConfig
      startDate?: string
      intervalDays?: number
    }

    if (!topicIds || topicIds.length === 0) {
      return NextResponse.json(
        { error: 'No topics selected' },
        { status: 400 }
      )
    }

    console.log(
      `📝 Starting batch generation for ${topicIds.length} topics...`
    )

    // Helper function to find next available date (skip dates with existing posts)
    const findNextAvailableDate = async (
      startDate: Date,
      intervalDays: number
    ): Promise<Date> => {
      let candidateDate = new Date(startDate)

      while (true) {
        // Create date range for the full day
        const dayStart = new Date(candidateDate)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(candidateDate)
        dayEnd.setHours(23, 59, 59, 999)

        // Check if any approved posts are scheduled for this date
        const existingPost = await prisma.marketingPost.findFirst({
          where: {
            isApproved: true,
            scheduledFor: {
              gte: dayStart,
              lt: dayEnd,
            },
          },
        })

        if (!existingPost) {
          // Date is free!
          return candidateDate
        }

        // Date has a post, try next interval
        console.log(
          `  ⏭️ ${candidateDate.toLocaleDateString()} already has a post, trying next date...`
        )
        candidateDate = new Date(candidateDate)
        candidateDate.setDate(candidateDate.getDate() + intervalDays)
      }
    }

    const results = []
    const errors = []
    let currentDate = startDate ? new Date(startDate) : new Date()
    const interval = intervalDays || 7

    for (const topicId of topicIds) {
      try {
        const topic = await prisma.topicScore.findUnique({
          where: { id: topicId },
        })

        if (!topic) {
          errors.push({ topicId, error: 'Topic not found' })
          continue
        }

        console.log(`\n📝 Processing: ${topic.topic}`)

        // Find next available date (skip conflicts)
        currentDate = await findNextAvailableDate(currentDate, interval)
        console.log(`  📅 Scheduled for: ${currentDate.toLocaleDateString()}`)

        // Generate brief if doesn't exist
        let brief = await prisma.contentBrief.findUnique({
          where: { topicScoreId: topicId },
        })

        if (!brief) {
          console.log('  → Generating brief...')
          const briefData = await generateContentBrief({ topicScoreId: topicId })
          brief = await prisma.contentBrief.create({
            data: {
              topicScoreId: topicId,
              title: briefData.title,
              targetKeywords: briefData.targetKeywords,
              suggestedLength: briefData.suggestedLength,
              outlinePoints: JSON.stringify(briefData.outlinePoints),
              suggestedH2s: briefData.suggestedH2s,
              ctaRecommendation: briefData.ctaRecommendation,
              toneNotes: briefData.toneNotes,
              status: 'completed',
            },
          })
        }

        // Generate content for each format
        const generatedPosts = []

        // Step 1: Generate main blog post (always needed as source)
        console.log('  → Writing blog post...')
        const blogContent = await writeContentFromBrief(brief.id)

        const blogPost = await prisma.marketingPost.create({
          data: {
            platform: 'blog',
            postType: 'blog_post',
            title: blogContent.title,
            content: blogContent.content,
            excerpt: blogContent.excerpt,
            slug: blogContent.slug,
            metaDescription: blogContent.metaDescription,
            image: blogContent.image,
            keywords: brief.targetKeywords,
            status: 'draft',
            scheduledFor: currentDate,
            generatedBy: 'ai',
            topic: topic.topic,
          },
        })

        generatedPosts.push(blogPost)

        // Update topic to link the post
        await prisma.topicScore.update({
          where: { id: topicId },
          data: {
            status: 'drafted',
            postId: blogPost.id,
          },
        })

        // Add to content calendar
        await prisma.contentCalendar.create({
          data: {
            topic: topic.topic,
            keywords: brief.targetKeywords,
            excerpt: blogContent.excerpt,
            scheduledFor: new Date(currentDate),
            status: 'generated',
            postId: blogPost.id,
          },
        })

        // Step 2: Repurpose blog into other formats
        // Social posts scheduled 1 day after blog
        const socialDate = new Date(blogPost.scheduledFor || currentDate)
        socialDate.setDate(socialDate.getDate() + 1)

        // Set up next candidate date for next post (will check for conflicts before using)
        const nextCandidateDate = new Date(currentDate)
        nextCandidateDate.setDate(nextCandidateDate.getDate() + interval)
        currentDate = nextCandidateDate
        if (formats.newsletter || formats.facebook || formats.pinterest || formats.reddit) {
          console.log('  → Repurposing content...')

          const repurposed = await repurposeContent(
            {
              title: blogContent.title,
              content: blogContent.content,
              excerpt: blogContent.excerpt,
              keywords: brief.targetKeywords,
            },
            {
              newsletter: formats.newsletter,
              facebook: formats.facebook,
              pinterest: formats.pinterest,
              reddit: formats.reddit,
            }
          )

          // Save newsletter
          if (repurposed.newsletter) {
            const newsletterPost = await prisma.marketingPost.create({
              data: {
                platform: 'email',
                postType: 'email',
                title: `Newsletter: ${blogContent.title}`,
                content: repurposed.newsletter,
                excerpt: blogContent.excerpt,
                keywords: brief.targetKeywords,
                status: 'draft',
                scheduledFor: socialDate,
                generatedBy: 'ai',
                topic: topic.topic,
              },
            })
            generatedPosts.push(newsletterPost)
          }

          // Save Facebook posts
          if (repurposed.facebook) {
            for (let i = 0; i < repurposed.facebook.length; i++) {
              const fbPost = await prisma.marketingPost.create({
                data: {
                  platform: 'facebook',
                  postType: 'social_post',
                  title: `FB: ${blogContent.title} (${i + 1})`,
                  content: repurposed.facebook[i],
                  excerpt: blogContent.excerpt.substring(0, 100),
                  keywords: brief.targetKeywords,
                  status: 'draft',
                  scheduledFor: socialDate,
                  generatedBy: 'ai',
                  topic: topic.topic,
                },
              })
              generatedPosts.push(fbPost)
            }
          }

          // Save Pinterest pins
          if (repurposed.pinterest) {
            for (let i = 0; i < repurposed.pinterest.length; i++) {
              const pin = repurposed.pinterest[i]
              const pinterestPost = await prisma.marketingPost.create({
                data: {
                  platform: 'pinterest',
                  postType: 'social_post',
                  title: pin.title,
                  content: pin.description,
                  excerpt: pin.description.substring(0, 100),
                  keywords: brief.targetKeywords,
                  status: 'draft',
                  scheduledFor: socialDate,
                  generatedBy: 'ai',
                  topic: topic.topic,
                  pinDescription: pin.description,
                },
              })
              generatedPosts.push(pinterestPost)
            }
          }

          // Save Reddit posts
          if (repurposed.reddit) {
            for (let i = 0; i < repurposed.reddit.length; i++) {
              const redditPost = repurposed.reddit[i]
              const post = await prisma.marketingPost.create({
                data: {
                  platform: 'reddit',
                  postType: 'social_post',
                  title: `${redditPost.subreddit}: ${redditPost.title}`,
                  content: `**Subreddit**: ${redditPost.subreddit}\n**Title**: ${redditPost.title}\n\n${redditPost.body}`,
                  excerpt: redditPost.body.substring(0, 100),
                  keywords: brief.targetKeywords,
                  status: 'draft',
                  scheduledFor: socialDate,
                  generatedBy: 'ai',
                  topic: topic.topic,
                  subreddit: redditPost.subreddit.replace('r/', ''),
                },
              })
              generatedPosts.push(post)
            }
          }
        }

        results.push({
          topicId,
          topic: topic.topic,
          postsGenerated: generatedPosts.length,
          posts: generatedPosts.map((p) => ({ id: p.id, title: p.title })),
        })

        console.log(`  ✅ Generated ${generatedPosts.length} posts`)
      } catch (error) {
        console.error(`  ❌ Error processing topic ${topicId}:`, error)
        errors.push({
          topicId,
          error: (error as Error).message,
        })
      }
    }

    const summary = {
      success: results.length,
      errors: errors.length,
      totalPosts: results.reduce((sum, r) => sum + r.postsGenerated, 0),
    }

    console.log(`\n✅ Batch generation complete:`, summary)

    return NextResponse.json({
      success: true,
      summary,
      results,
      errors,
      message: `Generated ${summary.totalPosts} posts from ${summary.success} topics`,
    })
  } catch (error) {
    console.error('Error in batch generation:', error)
    return NextResponse.json(
      {
        error: 'Batch generation failed',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
