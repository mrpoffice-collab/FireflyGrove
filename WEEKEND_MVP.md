# 🚀 Weekend MVP Build Plan - Marketing Command Center

## Goal
Build a working AI content generator and trend scanner in ONE WEEKEND (10-12 hours)

---

## Saturday Build (6 hours)

### Part 1: Database Schema (30 minutes)

Add to `prisma/schema.prisma`:

```prisma
model MarketingPost {
  id            String   @id @default(cuid())

  platform      String   // blog, reddit, pinterest, email
  postType      String   // blog_post, social_post, email
  title         String
  content       String   @db.Text
  excerpt       String?  @db.Text

  status        String   // draft, published
  publishedAt   DateTime?

  // SEO
  slug          String?  @unique
  metaDescription String?
  keywords      String[] // Array of keywords

  // Performance
  views         Int      @default(0)
  signups       Int      @default(0)

  // AI metadata
  generatedBy   String   @default("human") // ai, human
  topic         String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([platform, status])
  @@index([publishedAt])
}

model TrendingTopic {
  id            String   @id @default(cuid())

  source        String   // reddit, google_trends, pinterest
  subreddit     String?  // If from Reddit

  title         String
  description   String?  @db.Text
  url           String?

  score         Float    // engagement score
  engagement    Int      // upvotes, comments, shares

  keywords      String[]

  // Content idea
  contentIdea   String?  @db.Text
  priority      String   @default("medium") // high, medium, low

  status        String   @default("new") // new, used, dismissed

  detectedAt    DateTime @default(now())

  @@index([source, score])
  @@index([status, priority])
}

model PerformanceMetric {
  id            String   @id @default(cuid())
  date          DateTime @db.Date

  // Traffic
  visitors      Int      @default(0)
  sessions      Int      @default(0)
  pageviews     Int      @default(0)

  // Conversions
  signups       Int      @default(0)
  conversionRate Float   @default(0)

  // Top sources
  topSource     String?
  topPost       String?

  createdAt     DateTime @default(now())

  @@unique([date])
  @@index([date])
}
```

Run: `npx prisma db push`

---

### Part 2: AI Content Generator (2.5 hours)

**File: `app/api/marketing/generate-blog/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // or 'gpt-4' if you have access
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

    const generatedContent = completion.choices[0].message.content || ''

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
```

**File: `app/api/marketing/posts/route.ts`** (List drafts)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'draft'

    const posts = await prisma.marketingPost.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
```

**File: `app/api/marketing/posts/[id]/publish/route.ts`** (Publish draft)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const postId = params.id

    // Update post to published
    const post = await prisma.marketingPost.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date()
      }
    })

    // TODO: Trigger email newsletter, social sharing, etc.

    return NextResponse.json({
      success: true,
      post,
      message: 'Blog post published successfully!'
    })
  } catch (error) {
    console.error('Error publishing post:', error)
    return NextResponse.json({ error: 'Failed to publish post' }, { status: 500 })
  }
}
```

---

### Part 3: Reddit Trend Scanner (2 hours)

**File: `app/api/marketing/scan-reddit/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SUBREDDITS = [
  'Genealogy',
  'GriefSupport',
  'Journaling',
  'MemoryPreservation',
  'FamilyHistory',
  'DigitalNomad',
  'Productivity'
]

interface RedditPost {
  title: string
  subreddit: string
  score: number
  num_comments: number
  permalink: string
  created_utc: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Scanning Reddit for trends...')

    const allTrends: any[] = []

    for (const subreddit of SUBREDDITS) {
      try {
        // Fetch top posts from last 24 hours
        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=25`,
          {
            headers: {
              'User-Agent': 'Firefly Grove Marketing Scanner 1.0'
            }
          }
        )

        if (!response.ok) continue

        const data = await response.json()
        const posts: RedditPost[] = data.data.children.map((child: any) => child.data)

        // Filter high-engagement posts
        const highEngagement = posts.filter(
          post => post.score > 50 || post.num_comments > 20
        )

        for (const post of highEngagement) {
          // Extract keywords from title
          const keywords = extractKeywords(post.title)

          // Calculate score (weighted: upvotes + comments)
          const score = post.score + (post.num_comments * 2)

          // Generate content idea
          const contentIdea = generateContentIdea(post.title, subreddit)

          // Determine priority
          const priority = score > 500 ? 'high' : score > 200 ? 'medium' : 'low'

          // Save to database
          const trend = await prisma.trendingTopic.create({
            data: {
              source: 'reddit',
              subreddit: subreddit,
              title: post.title,
              description: `High-engagement post in r/${subreddit}`,
              url: `https://reddit.com${post.permalink}`,
              score: score,
              engagement: post.score + post.num_comments,
              keywords,
              contentIdea,
              priority,
              status: 'new'
            }
          })

          allTrends.push(trend)
        }

        // Rate limiting - wait 2 seconds between subreddits
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.error(`Error scanning r/${subreddit}:`, error)
        continue
      }
    }

    return NextResponse.json({
      success: true,
      trendsFound: allTrends.length,
      trends: allTrends.slice(0, 10) // Return top 10
    })

  } catch (error: any) {
    console.error('Error scanning Reddit:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to scan Reddit' },
      { status: 500 }
    )
  }
}

function extractKeywords(title: string): string[] {
  // Simple keyword extraction (can be improved with NLP)
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were']

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))

  // Return top 5 unique words
  return [...new Set(words)].slice(0, 5)
}

function generateContentIdea(title: string, subreddit: string): string {
  return `Blog post inspired by r/${subreddit} discussion: "${title}". Connect this topic to memory preservation or family legacy planning.`
}
```

**File: `app/api/marketing/trends/route.ts`** (Get recent trends)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trends = await prisma.trendingTopic.findMany({
      where: {
        status: 'new',
        detectedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: [
        { priority: 'desc' },
        { score: 'desc' }
      ],
      take: 20
    })

    return NextResponse.json(trends)
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
  }
}
```

---

### Part 4: Marketing Dashboard UI (1 hour)

**File: `app/marketing-genius/page.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

interface TrendingTopic {
  id: string
  source: string
  subreddit: string | null
  title: string
  description: string | null
  url: string | null
  score: number
  engagement: number
  keywords: string[]
  contentIdea: string | null
  priority: string
  status: string
  detectedAt: string
}

interface MarketingPost {
  id: string
  platform: string
  title: string
  content: string
  excerpt: string | null
  status: string
  generatedBy: string
  keywords: string[]
  createdAt: string
}

export default function MarketingGeniusPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trends, setTrends] = useState<TrendingTopic[]>([])
  const [draftPosts, setDraftPosts] = useState<MarketingPost[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Content generation form
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      // Check if admin
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      // Fetch trends
      const trendsRes = await fetch('/api/marketing/trends')
      if (trendsRes.ok) {
        const trendsData = await trendsRes.json()
        setTrends(trendsData)
      }

      // Fetch draft posts
      const postsRes = await fetch('/api/marketing/posts?status=draft')
      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setDraftPosts(postsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScanReddit = async () => {
    setScanning(true)
    try {
      const res = await fetch('/api/marketing/scan-reddit', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        alert(`Found ${data.trendsFound} new trending topics!`)
        fetchData() // Refresh
      } else {
        alert('Failed to scan Reddit')
      }
    } catch (error) {
      console.error('Error scanning Reddit:', error)
      alert('Error scanning Reddit')
    } finally {
      setScanning(false)
    }
  }

  const handleGeneratePost = async () => {
    if (!topic.trim() || !keywords.trim()) {
      alert('Please enter topic and keywords')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/marketing/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords.split(',').map(k => k.trim())
        })
      })

      if (res.ok) {
        const data = await res.json()
        alert(`✅ Blog post generated: "${data.post.title}"`)
        setTopic('')
        setKeywords('')
        fetchData() // Refresh drafts
      } else {
        const error = await res.json()
        alert(`Failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating post:', error)
      alert('Error generating post')
    } finally {
      setGenerating(false)
    }
  }

  const handlePublishPost = async (postId: string) => {
    if (!confirm('Publish this post to the blog?')) return

    try {
      const res = await fetch(`/api/marketing/posts/${postId}/publish`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('✅ Post published successfully!')
        fetchData()
      } else {
        alert('Failed to publish post')
      }
    } catch (error) {
      console.error('Error publishing post:', error)
      alert('Error publishing post')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Header userName={session?.user?.name || ''} />
        <div className="flex items-center justify-center h-96">
          <div className="text-text-muted">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <Header userName={session?.user?.name || ''} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-text-soft mb-3">🧠 Marketing Intelligence</h1>
          <p className="text-text-muted text-lg">
            AI-powered content generation and trend analysis
          </p>
        </div>

        {/* Content Generator */}
        <div className="mb-12 bg-bg-elevated border border-border-subtle rounded-xl p-8">
          <h2 className="text-2xl font-light text-text-soft mb-6">✍️ AI Content Generator</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Blog Post Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to preserve family memories before it's too late"
                className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim placeholder:text-text-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Target Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., memory preservation, family history, sound wave art"
                className="w-full px-4 py-3 bg-bg-dark border border-border-subtle rounded-lg text-text-soft focus:outline-none focus:border-firefly-dim placeholder:text-text-muted"
              />
            </div>

            <button
              onClick={handleGeneratePost}
              disabled={generating}
              className="px-8 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? '✨ Generating with AI...' : '✨ Generate Blog Post'}
            </button>
          </div>
        </div>

        {/* Draft Posts */}
        {draftPosts.length > 0 && (
          <div className="mb-12 bg-bg-elevated border border-border-subtle rounded-xl p-8">
            <h2 className="text-2xl font-light text-text-soft mb-6">📝 Draft Posts</h2>

            <div className="space-y-4">
              {draftPosts.map(post => (
                <div key={post.id} className="bg-bg-dark border border-border-subtle rounded-lg p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl text-text-soft font-medium mb-2">{post.title}</h3>
                      <p className="text-text-muted text-sm mb-3">{post.excerpt}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-firefly-dim/10 text-firefly-glow rounded text-xs">
                          {post.generatedBy === 'ai' ? '🤖 AI Generated' : '✍️ Human Written'}
                        </span>
                        {post.keywords.map(keyword => (
                          <span key={keyword} className="px-2 py-1 bg-bg-elevated text-text-muted rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePublishPost(post.id)}
                      className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded font-medium transition-soft whitespace-nowrap"
                    >
                      Publish
                    </button>
                  </div>

                  <details className="mt-4">
                    <summary className="cursor-pointer text-firefly-glow text-sm">View full content</summary>
                    <pre className="mt-3 p-4 bg-bg-elevated rounded text-text-muted text-xs overflow-x-auto whitespace-pre-wrap">
                      {post.content}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Topics */}
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light text-text-soft">🔥 Trending Topics</h2>
            <button
              onClick={handleScanReddit}
              disabled={scanning}
              className="px-6 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow rounded font-medium transition-soft disabled:opacity-50"
            >
              {scanning ? '🔄 Scanning...' : '🔍 Scan Reddit Now'}
            </button>
          </div>

          {trends.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p className="mb-4">No trends detected yet.</p>
              <button
                onClick={handleScanReddit}
                className="px-6 py-3 bg-firefly-dim hover:bg-firefly-glow text-bg-dark rounded-lg font-medium transition-soft"
              >
                Scan Reddit for Trends
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {trends.map(trend => (
                <div key={trend.id} className="bg-bg-dark border border-border-subtle rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trend.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          trend.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {trend.priority === 'high' ? '🔥 High Priority' :
                           trend.priority === 'medium' ? '⚡ Medium Priority' :
                           '💡 Low Priority'}
                        </span>
                        <span className="px-2 py-1 bg-firefly-dim/10 text-firefly-glow rounded text-xs">
                          r/{trend.subreddit}
                        </span>
                      </div>

                      <h3 className="text-lg text-text-soft font-medium mb-2">{trend.title}</h3>

                      <p className="text-text-muted text-sm mb-3">{trend.contentIdea}</p>

                      <div className="flex items-center gap-3 text-text-muted text-sm">
                        <span>Score: {trend.score.toFixed(0)}</span>
                        <span>•</span>
                        <span>Engagement: {trend.engagement}</span>
                        <span>•</span>
                        <span>Keywords: {trend.keywords.join(', ')}</span>
                      </div>

                      {trend.url && (
                        <a
                          href={trend.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-firefly-glow hover:text-firefly-bright text-sm mt-2 inline-block"
                        >
                          View on Reddit →
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setTopic(trend.title)
                        setKeywords(trend.keywords.join(', '))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="px-4 py-2 bg-firefly-dim/20 hover:bg-firefly-dim/30 text-firefly-glow rounded text-sm font-medium transition-soft whitespace-nowrap"
                    >
                      Generate Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Sunday Build (4 hours)

### Part 5: ConvertKit Integration (2 hours)

**File: `lib/convertkit.ts`**

```typescript
// ConvertKit API integration

const CONVERT_KIT_API_KEY = process.env.CONVERTKIT_API_KEY
const CONVERT_KIT_API_SECRET = process.env.CONVERTKIT_API_SECRET

export async function subscribeToConvertKit(email: string, firstName?: string) {
  const FORM_ID = process.env.CONVERTKIT_FORM_ID // Your form ID

  try {
    const response = await fetch(`https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: CONVERT_KIT_API_KEY,
        email,
        first_name: firstName,
        tags: [process.env.CONVERTKIT_TAG_ID] // e.g., "grove_owner"
      })
    })

    return await response.json()
  } catch (error) {
    console.error('ConvertKit subscription error:', error)
    throw error
  }
}

export async function sendBroadcast(subject: string, content: string) {
  try {
    const response = await fetch('https://api.convertkit.com/v3/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_secret: CONVERT_KIT_API_SECRET,
        subject,
        content,
        email_template_id: process.env.CONVERTKIT_TEMPLATE_ID
      })
    })

    return await response.json()
  } catch (error) {
    console.error('ConvertKit broadcast error:', error)
    throw error
  }
}
```

Add ConvertKit subscription on signup (already have this, just ensure it works).

---

### Part 6: Performance Dashboard (2 hours)

**File: `app/api/marketing/performance/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get signups by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const signups = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // Get total stats
    const totalUsers = await prisma.user.count()
    const todaySignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    // Get blog post performance
    const topPosts = await prisma.marketingPost.findMany({
      where: { status: 'published' },
      orderBy: { signups: 'desc' },
      take: 5,
      select: {
        title: true,
        views: true,
        signups: true,
        publishedAt: true
      }
    })

    return NextResponse.json({
      totalUsers,
      todaySignups,
      signupsByDay: signups,
      topPosts
    })
  } catch (error) {
    console.error('Error fetching performance:', error)
    return NextResponse.json({ error: 'Failed to fetch performance' }, { status: 500 })
  }
}
```

Add simple charts to dashboard showing this data.

---

## Environment Variables

Add to `.env.local`:

```bash
# OpenAI (use your ChatGPT Plus API key)
OPENAI_API_KEY=sk-your-key-here

# ConvertKit
CONVERTKIT_API_KEY=your-key
CONVERTKIT_API_SECRET=your-secret
CONVERTKIT_FORM_ID=your-form-id
CONVERTKIT_TAG_ID=your-tag-id
CONVERTKIT_TEMPLATE_ID=your-template-id
```

---

## What You'll Have Monday Morning

✅ **AI Blog Post Generator** - Type topic, get 2000-word post in 2 minutes
✅ **Reddit Trend Scanner** - See what's trending in your niches
✅ **Draft Review System** - Review AI posts before publishing
✅ **ConvertKit Integration** - Auto-email new subscribers
✅ **Performance Dashboard** - Track signups and top content

**Time Investment This Weekend:** 10-12 hours
**Time Saved Every Week:** 20+ hours

---

## Monday Morning Workflow

1. Open `/marketing-genius` (30 seconds)
2. Click "Scan Reddit" (2 min scan)
3. See: "DNA testing trending - 500 upvotes"
4. Click "Generate Post" (2 min)
5. Review AI-written post (3-5 min)
6. Click "Publish" (instant)
7. System auto-sends to email list

**Total Time: 8 minutes** 🚀

**Manual Alternative: 2-3 hours** 😴

---

## Next Weekend: Add More Features

- Pinterest pin generator
- Google Trends integration
- Auto-scheduling
- Email sequence automation
- Performance alerts

But this MVP gives you 80% of the value in ONE WEEKEND.

---

## Ready to Build?

**Saturday Morning - Let's Start!** 🏗️
