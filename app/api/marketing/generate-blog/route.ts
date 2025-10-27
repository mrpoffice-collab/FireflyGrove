import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface GenerateRequest {
  topic: string
  keywords: string[]
  targetAudience?: string
  tone?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body: GenerateRequest = await request.json()
    const { topic, keywords, targetAudience = 'families preserving memories', tone = 'empathetic and helpful' } = body

    // Generate blog post with ChatGPT
    const prompt = `
You are a content writer for Firefly Grove, a family memory preservation app.

Write a comprehensive, SEO-optimized blog post:

TOPIC: ${topic}

TARGET KEYWORDS (use naturally): ${keywords.join(', ')}

TARGET AUDIENCE: ${targetAudience}

TONE: ${tone}

STRUCTURE:
1. Compelling headline (H1) - emotional hook
2. Opening paragraph - story or statistic that grabs attention
3. Why this matters - emotional connection
4. Main content with actionable advice:
   - Use H2 and H3 headings
   - Include bullet points
   - Add examples and stories
   - Make it actionable
5. How Firefly Grove helps (natural product mention)
6. Conclusion with clear next step
7. Call to action

REQUIREMENTS:
- 2000-2500 words
- Conversational, not corporate
- Include personal anecdotes (fictional but believable)
- SEO-optimized but human-first
- Mention Firefly Grove features naturally (sound wave art, memorial videos, digital legacy)
- Include internal link opportunities like [LINK: related-post-title]

FORMATTING:
- Use markdown format
- H1 for title
- H2 for main sections
- H3 for subsections
- Bold key phrases
- Bullet lists where appropriate
- Write meta description (155 chars) at the end

Write the complete blog post now.
`

    console.log('Generating blog post with AI...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer specializing in memory preservation, family legacy, and emotional storytelling.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    const generatedContent = data.choices[0].message.content || ''

    // Extract title (first H1)
    const titleMatch = generatedContent.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : topic

    // Extract meta description (look for "Meta:" at the end)
    const metaMatch = generatedContent.match(/Meta description:(.+)/i)
    const metaDescription = metaMatch ? metaMatch[1].trim() : `${title.substring(0, 150)}...`

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Save as draft
    const post = await prisma.marketingPost.create({
      data: {
        platform: 'blog',
        postType: 'blog_post',
        title,
        content: generatedContent,
        excerpt: generatedContent.substring(0, 300),
        slug,
        metaDescription,
        keywords,
        status: 'draft',
        generatedBy: 'ai',
        topic
      }
    })

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.slug,
        metaDescription: post.metaDescription
      }
    })

  } catch (error: any) {
    console.error('Error generating blog post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate blog post' },
      { status: 500 }
    )
  }
}
