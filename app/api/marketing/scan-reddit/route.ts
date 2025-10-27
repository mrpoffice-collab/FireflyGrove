import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SUBREDDITS = [
  'Genealogy',
  'GriefSupport',
  'Journaling',
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

        if (!response.ok) {
          console.log(`Failed to fetch r/${subreddit}`)
          continue
        }

        const data = await response.json()
        const posts: RedditPost[] = data.data.children.map((child: any) => child.data)

        // Filter high-engagement posts (lowered threshold for more results)
        const highEngagement = posts.filter(
          post => post.score > 10 || post.num_comments > 5
        )

        for (const post of highEngagement) {
          // Extract keywords from title
          const keywords = extractKeywords(post.title)

          // Calculate score (weighted: upvotes + comments)
          const score = post.score + (post.num_comments * 2)

          // Generate content idea
          const contentIdea = generateContentIdea(post.title, subreddit)

          // Determine priority (adjusted thresholds)
          const priority = score > 100 ? 'high' : score > 30 ? 'medium' : 'low'

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
  // Simple keyword extraction
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'how', 'what', 'when', 'where', 'why', 'who']

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))

  // Return top 5 unique words
  return Array.from(new Set(words)).slice(0, 5)
}

function generateContentIdea(title: string, subreddit: string): string {
  return `Blog post inspired by r/${subreddit} discussion: "${title}". Connect this topic to memory preservation or family legacy planning.`
}
