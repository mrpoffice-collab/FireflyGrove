const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const SUBREDDITS = [
  'Genealogy',
  'GriefSupport',
  'Journaling',
  'FamilyHistory',
  'DigitalNomad',
  'Productivity'
]

function extractKeywords(title) {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'how', 'what', 'when', 'where', 'why', 'who']

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))

  return Array.from(new Set(words)).slice(0, 5)
}

function generateContentIdea(title, subreddit) {
  return `Blog post inspired by r/${subreddit} discussion: "${title}". Connect this topic to memory preservation or family legacy planning.`
}

async function scanReddit() {
  console.log('🔍 Scanning Reddit for trending topics...\n')

  const allTrends = []

  for (const subreddit of SUBREDDITS) {
    try {
      console.log(`Fetching r/${subreddit}...`)

      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=25`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      )

      if (!response.ok) {
        console.log(`  ❌ Failed: ${response.status}`)
        continue
      }

      const data = await response.json()
      const posts = data.data.children.map(child => child.data)

      console.log(`  Found ${posts.length} posts`)

      // Filter high-engagement posts
      const highEngagement = posts.filter(
        post => post.score > 10 || post.num_comments > 5
      )

      console.log(`  ${highEngagement.length} posts meet engagement criteria`)

      for (const post of highEngagement) {
        const keywords = extractKeywords(post.title)
        const score = post.score + (post.num_comments * 2)
        const priority = score > 100 ? 'high' : score > 30 ? 'medium' : 'low'
        const contentIdea = generateContentIdea(post.title, subreddit)

        try {
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
          console.log(`  ✅ Saved: "${post.title.substring(0, 50)}..."`)
        } catch (dbError) {
          console.error(`  ❌ Failed to save: ${dbError.message}`)
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))

    } catch (error) {
      console.error(`Error with r/${subreddit}:`, error.message)
    }
  }

  console.log(`\n🎉 Done! Saved ${allTrends.length} trending topics to database.`)
  console.log('✨ Go to /marketing-genius on your site to see them!\n')

  await prisma.$disconnect()
}

scanReddit()
