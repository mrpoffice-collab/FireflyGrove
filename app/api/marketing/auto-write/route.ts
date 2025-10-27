import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { limit = 5 } = await request.json()

    // Get planned topics that haven't been generated yet
    const plannedTopics = await prisma.contentCalendar.findMany({
      where: { status: 'planned' },
      orderBy: { scheduledFor: 'asc' },
      take: limit
    })

    if (plannedTopics.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No topics in calendar to generate',
        generated: 0
      })
    }

    console.log(`Auto-writing ${plannedTopics.length} blog posts...`)

    const generatedPosts = []

    for (const topic of plannedTopics) {
      try {
        console.log(`Generating: "${topic.topic}"...`)

        // AI prompt for blog generation
        const prompt = `You are a content writer for Firefly Grove, a family memory preservation app.

Write a comprehensive, SEO-optimized blog post:

TOPIC: ${topic.topic}
TARGET KEYWORDS (use naturally): ${topic.keywords.join(', ')}
TARGET AUDIENCE: Parents, adult children helping aging parents, people dealing with grief, family historians
TONE: Warm, empathetic, conversational (not corporate)

STRUCTURE:
1. Compelling headline (H1) - emotional hook
2. Opening paragraph - story or statistic that creates emotional connection
3. Why this matters - emotional connection to preserving family legacy
4. Main content with actionable advice (use H2 and H3 headings)
5. How Firefly Grove helps (natural product mention, not salesy)
6. Conclusion with clear next step
7. Call to action

REQUIREMENTS:
- 1500-2000 words
- Conversational, not corporate
- Include personal anecdotes (fictional but believable)
- SEO-optimized but human-first
- Mention Firefly Grove features naturally (organizing memories, creating timelines, preserving stories)
- Use markdown formatting (##, ###, **, -, etc.)

IMPORTANT: Return ONLY the blog post content in markdown format. No additional commentary.`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert content writer specializing in family memory preservation, legacy planning, and emotional storytelling.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 3000
          })
        })

        if (!response.ok) {
          console.error(`Failed to generate post for "${topic.topic}"`)
          continue
        }

        const data = await response.json()
        const content = data.choices[0].message.content.trim()

        // Generate slug
        const slug = topic.topic
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')

        // Extract title from content (first # heading) or use topic
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : topic.topic

        // Create draft post
        const post = await prisma.marketingPost.create({
          data: {
            platform: 'blog',
            postType: 'blog_post',
            title,
            content,
            slug,
            excerpt: topic.excerpt || topic.topic,
            metaDescription: topic.excerpt,
            keywords: topic.keywords,
            status: 'draft',
            generatedBy: 'ai',
            topic: topic.topic
          }
        })

        // Update calendar entry
        await prisma.contentCalendar.update({
          where: { id: topic.id },
          data: {
            status: 'generated',
            postId: post.id
          }
        })

        generatedPosts.push(post)
        console.log(`✅ Generated: "${title}"`)

        // Rate limit - wait 2 seconds between posts to avoid OpenAI rate limits
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`Error generating post for "${topic.topic}":`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${generatedPosts.length} blog posts`,
      generated: generatedPosts.length,
      posts: generatedPosts.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug
      }))
    })

  } catch (error: any) {
    console.error('Error in auto-write:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to auto-write posts' },
      { status: 500 }
    )
  }
}
