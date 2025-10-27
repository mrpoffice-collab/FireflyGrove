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

    const { postsPerWeek = 3, weeks = 4 } = await request.json()

    console.log(`Generating ${postsPerWeek * weeks} blog topics...`)

    // AI prompt to generate content calendar
    const prompt = `You are a content strategist for Firefly Grove, a family memory preservation platform.

Generate ${postsPerWeek * weeks} blog post topic ideas optimized for SEO and emotional engagement.

TARGET AUDIENCE:
- Parents wanting to preserve family memories
- Adult children helping aging parents
- People dealing with grief/loss
- Family history enthusiasts
- People organizing old photos/videos

GOALS:
- Drive signups to Firefly Grove
- Rank in Google for memory preservation keywords
- Create emotional connection
- Provide actionable value

For each topic, provide:
1. SEO-optimized title (60-70 characters, include power words)
2. 3-5 target keywords (comma-separated)
3. Excerpt (150-160 characters for meta description)

Format as JSON array:
[
  {
    "title": "...",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "excerpt": "..."
  }
]

IMPORTANT: Return ONLY valid JSON, no other text.`

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
            content: 'You are an expert content strategist and SEO specialist. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate topics with AI' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const topicsJSON = data.choices[0].message.content.trim()

    // Extract JSON from markdown code blocks if present
    const jsonMatch = topicsJSON.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, topicsJSON]
    const cleanJSON = jsonMatch[1].trim()

    const topics = JSON.parse(cleanJSON)

    console.log(`Generated ${topics.length} topics`)

    // Create content calendar entries
    const calendar = []
    const now = new Date()

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i]

      // Schedule posts evenly across weeks
      const daysOffset = Math.floor((i / postsPerWeek) * 7) + (i % postsPerWeek) * Math.floor(7 / postsPerWeek)
      const publishDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000)

      const entry = await prisma.contentCalendar.create({
        data: {
          topic: topic.title,
          keywords: topic.keywords,
          excerpt: topic.excerpt,
          scheduledFor: publishDate,
          status: 'planned'
        }
      })

      calendar.push(entry)
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${calendar.length} blog topics for the next ${weeks} weeks`,
      calendar: calendar.slice(0, 10), // Return first 10 for preview
      totalPlanned: calendar.length
    })

  } catch (error: any) {
    console.error('Error generating content plan:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate content plan' },
      { status: 500 }
    )
  }
}
