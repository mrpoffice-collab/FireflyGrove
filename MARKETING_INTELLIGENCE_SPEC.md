# 🧠 Marketing Intelligence System - Technical Specification

## Overview
An AI-powered marketing automation system that scrapes trends, identifies opportunities, generates content, and pivots strategy in real-time to maximize growth.

---

## Architecture

### Database Schema (Add to Prisma)

```prisma
// Marketing Intelligence Tables

model MarketingCampaign {
  id          String   @id @default(cuid())
  name        String
  status      String   // active, paused, completed
  startDate   DateTime
  endDate     DateTime?
  goal        Int      // target signups
  actual      Int      @default(0)
  budget      Float    @default(0)

  posts       MarketingPost[]
  insights    MarketingInsight[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model MarketingPost {
  id            String   @id @default(cuid())
  campaignId    String?

  platform      String   // reddit, pinterest, facebook, blog, email
  postType      String   // blog_post, social_post, email, pin
  title         String
  content       String   @db.Text
  url           String?
  scheduledFor  DateTime?
  publishedAt   DateTime?

  status        String   // draft, scheduled, published, failed

  // Performance metrics
  views         Int      @default(0)
  clicks        Int      @default(0)
  signups       Int      @default(0)
  engagement    Float    @default(0) // likes, comments, shares

  // AI metadata
  generatedBy   String?  // ai, human, hybrid
  topic         String?
  keywords      String[] // Array of keywords

  campaign      MarketingCampaign? @relation(fields: [campaignId], references: [id])

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([platform, status])
  @@index([publishedAt])
}

model TrendingTopic {
  id            String   @id @default(cuid())

  source        String   // reddit, google_trends, pinterest, competitor
  platform      String   // where detected
  topic         String
  keywords      String[]

  score         Float    // trending score (0-100)
  volume        Int      // search volume or engagement count
  competition   String   // low, medium, high

  // Opportunity metrics
  estimatedReach      Int?
  estimatedSignups    Int?
  difficulty          String? // easy, medium, hard

  // Actions
  status        String   // new, analyzing, actioned, dismissed
  actionTaken   String?  // blog_post, social_post, email
  postId        String?  // Link to created post

  detectedAt    DateTime @default(now())
  expiresAt     DateTime? // Some trends expire

  @@index([source, score])
  @@index([detectedAt])
}

model MarketingInsight {
  id            String   @id @default(cuid())
  campaignId    String?

  type          String   // opportunity, performance, pivot, alert
  priority      String   // low, medium, high, urgent

  title         String
  description   String   @db.Text
  recommendation String  @db.Text

  // Data backing this insight
  dataPoints    Json     // Flexible JSON for metrics

  // Action tracking
  status        String   // new, reviewed, actioned, dismissed
  actionedAt    DateTime?

  campaign      MarketingCampaign? @relation(fields: [campaignId], references: [id])

  createdAt     DateTime @default(now())

  @@index([type, priority, status])
}

model ChannelPerformance {
  id            String   @id @default(cuid())

  channel       String   // reddit, pinterest, facebook, blog, email
  date          DateTime

  // Traffic metrics
  visitors      Int      @default(0)
  sessions      Int      @default(0)
  pageviews     Int      @default(0)

  // Conversion metrics
  signups       Int      @default(0)
  conversionRate Float   @default(0)

  // Engagement metrics
  engagementRate Float   @default(0)
  avgTimeOnSite  Int     @default(0)
  bounceRate     Float   @default(0)

  // Cost (if applicable)
  cost          Float    @default(0)

  @@unique([channel, date])
  @@index([date])
}

model CompetitorAnalysis {
  id            String   @id @default(cuid())

  competitor    String   // competitor name/url
  platform      String   // where analyzed

  // Content analysis
  postTitle     String
  postUrl       String
  engagement    Int      // likes, comments, shares
  publishedAt   DateTime

  // Insights
  topic         String
  keywords      String[]
  whatWorked    String?  @db.Text

  analyzedAt    DateTime @default(now())

  @@index([competitor, platform])
}
```

---

## Features Breakdown

### 1. Trend Scanner

**Purpose:** Automatically discover hot topics and content opportunities

#### Reddit Trend Scanner
```typescript
// app/api/marketing/scan-reddit/route.ts

interface RedditTrend {
  subreddit: string
  postTitle: string
  score: number
  numComments: number
  url: string
  topic: string
  keywords: string[]
  estimatedReach: number
}

async function scanRedditTrends(): Promise<RedditTrend[]> {
  const subreddits = [
    'Genealogy',
    'GriefSupport',
    'Journaling',
    'DigitalNomad',
    'MemoryPreservation'
  ]

  const trends: RedditTrend[] = []

  for (const subreddit of subreddits) {
    // Fetch top posts from last 24 hours
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=25`,
      { headers: { 'User-Agent': 'Firefly Grove Bot' } }
    )

    const data = await response.json()

    for (const post of data.data.children) {
      const { title, score, num_comments, permalink, subreddit } = post.data

      // Only track high-engagement posts
      if (score > 100 || num_comments > 50) {
        trends.push({
          subreddit,
          postTitle: title,
          score,
          numComments: num_comments,
          url: `https://reddit.com${permalink}`,
          topic: extractTopic(title),
          keywords: extractKeywords(title),
          estimatedReach: calculateReach(score, num_comments)
        })
      }
    }
  }

  // Save to database
  await saveTrendingTopics(trends, 'reddit')

  return trends
}
```

#### Google Trends Scanner
```typescript
// app/api/marketing/scan-google-trends/route.ts

import googleTrends from 'google-trends-api'

async function scanGoogleTrends(): Promise<TrendData[]> {
  const keywords = [
    'memory preservation',
    'sound wave art',
    'memorial video',
    'digital legacy',
    'family history'
  ]

  const trends = []

  for (const keyword of keywords) {
    const interest = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    })

    const data = JSON.parse(interest)
    const current = data.default.timelineData[data.default.timelineData.length - 1]
    const previous = data.default.timelineData[data.default.timelineData.length - 8]

    const percentChange = ((current.value[0] - previous.value[0]) / previous.value[0]) * 100

    if (percentChange > 20) { // 20%+ increase
      trends.push({
        keyword,
        currentInterest: current.value[0],
        percentChange,
        recommendation: `Create content about "${keyword}" - trending up ${percentChange.toFixed(0)}%`
      })
    }
  }

  return trends
}
```

#### Pinterest Trend Scanner
```typescript
// Uses Pinterest API to find rising searches

async function scanPinterestTrends() {
  const response = await fetch('https://api.pinterest.com/v5/search/boards', {
    headers: {
      'Authorization': `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`
    },
    params: {
      query: 'memory preservation',
      // Get trending pins
    }
  })

  // Analyze which pins are getting saves/clicks
  // Identify content gaps
}
```

### 2. Opportunity Detector

**Purpose:** AI analyzes trends and suggests specific actions

```typescript
// app/api/marketing/detect-opportunities/route.ts

interface Opportunity {
  type: 'blog_post' | 'social_post' | 'email' | 'campaign'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  estimatedReach: number
  estimatedSignups: number
  effort: 'low' | 'medium' | 'high'
  deadline?: Date
  actionSteps: string[]
}

async function detectOpportunities(): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = []

  // Get all recent trends
  const trends = await prisma.trendingTopic.findMany({
    where: {
      status: 'new',
      detectedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    },
    orderBy: { score: 'desc' }
  })

  for (const trend of trends) {
    // Analyze if this trend is relevant to our products
    const relevance = await analyzeRelevance(trend)

    if (relevance.score > 0.7) {
      opportunities.push({
        type: 'blog_post',
        priority: calculatePriority(trend.score, relevance.score),
        title: `Write blog post about: ${trend.topic}`,
        description: `Reddit post in r/${trend.source} got ${trend.volume} upvotes. High engagement topic.`,
        estimatedReach: trend.estimatedReach || 0,
        estimatedSignups: Math.floor((trend.estimatedReach || 0) * 0.02), // 2% conversion
        effort: 'medium',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        actionSteps: [
          `Research: Read top 5 posts about "${trend.topic}"`,
          `Write: 2000-word blog post targeting keywords: ${trend.keywords.join(', ')}`,
          `Create: 5 Pinterest pins`,
          `Share: Post to Reddit r/${trend.source}`,
          `Email: Send to subscribers`
        ]
      })
    }
  }

  // Check for time-sensitive opportunities (holidays, events)
  const seasonalOpps = await detectSeasonalOpportunities()
  opportunities.push(...seasonalOpps)

  // Check for underperforming channels that need pivoting
  const pivotOpps = await detectPivotOpportunities()
  opportunities.push(...pivotOpps)

  return opportunities.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

async function analyzeRelevance(trend: TrendingTopic): Promise<{ score: number; reasoning: string }> {
  // Use AI to determine if trend is relevant to Firefly Grove
  const prompt = `
    Our products: Memory preservation app, sound wave art, memorial videos, greeting cards

    Trending topic: ${trend.topic}
    Keywords: ${trend.keywords.join(', ')}

    Is this relevant to our products? Score 0-1.
    Can we create valuable content about this?
  `

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    })
  })

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}
```

### 3. AI Content Generator

**Purpose:** Auto-generate blog posts, social posts, emails based on opportunities

```typescript
// app/api/marketing/generate-content/route.ts

interface ContentRequest {
  opportunityId: string
  type: 'blog_post' | 'social_post' | 'email' | 'pinterest_pin'
  topic: string
  keywords: string[]
  targetAudience: string
}

async function generateBlogPost(request: ContentRequest): Promise<string> {
  const prompt = `
    Write a comprehensive blog post for Firefly Grove (family memory preservation app).

    Topic: ${request.topic}
    Keywords to include naturally: ${request.keywords.join(', ')}
    Target audience: ${request.targetAudience}

    Structure:
    1. Emotional hook (story about memory loss or regret)
    2. Why this matters (statistics, research)
    3. Main content (comprehensive, actionable)
    4. How Firefly Grove helps (natural product mention)
    5. Call to action

    Word count: 2000-2500 words
    Tone: Empathetic, helpful, not salesy

    Include:
    - H2 and H3 headings
    - Bullet points where appropriate
    - Personal anecdotes
    - Actionable tips
    - Internal link opportunities [LINK: related post]
    - CTA to relevant feature

    Write the complete blog post in markdown format.
  `

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    })
  })

  const data = await response.json()
  const content = data.choices[0].message.content

  // Save as draft
  await prisma.marketingPost.create({
    data: {
      platform: 'blog',
      postType: 'blog_post',
      title: extractTitle(content),
      content,
      status: 'draft',
      generatedBy: 'ai',
      topic: request.topic,
      keywords: request.keywords
    }
  })

  return content
}

async function generateSocialPost(request: ContentRequest): Promise<string[]> {
  // Generate multiple variations for A/B testing
  const variations = []

  for (let i = 0; i < 3; i++) {
    const prompt = `
      Write a ${request.type} post for Firefly Grove.

      Topic: ${request.topic}
      Platform: ${request.type === 'social_post' ? 'Reddit or Facebook' : 'Pinterest'}

      Requirements:
      - Authentic, not promotional
      - Provides value first
      - Subtle mention of Firefly Grove if relevant
      - ${request.type === 'pinterest_pin' ? 'Eye-catching title under 100 chars' : 'Conversational tone'}

      Write variation #${i + 1}
    `

    const response = await callOpenAI(prompt)
    variations.push(response)
  }

  return variations
}
```

### 4. Smart Scheduler

**Purpose:** Determine optimal posting times based on audience activity

```typescript
// app/api/marketing/optimal-schedule/route.ts

interface OptimalTime {
  platform: string
  dayOfWeek: string
  hour: number
  score: number // 0-100, higher = better
  reasoning: string
}

async function calculateOptimalPostingTimes(): Promise<OptimalTime[]> {
  // Analyze historical performance
  const posts = await prisma.marketingPost.findMany({
    where: {
      publishedAt: { not: null },
      views: { gt: 0 }
    }
  })

  // Group by platform, day, hour
  const performance = new Map<string, { views: number; signups: number; count: number }>()

  for (const post of posts) {
    const date = new Date(post.publishedAt!)
    const key = `${post.platform}-${date.getDay()}-${date.getHours()}`

    const existing = performance.get(key) || { views: 0, signups: 0, count: 0 }
    existing.views += post.views
    existing.signups += post.signups
    existing.count += 1
    performance.set(key, existing)
  }

  // Calculate scores
  const optimalTimes: OptimalTime[] = []

  for (const [key, data] of performance) {
    const [platform, day, hour] = key.split('-')
    const avgViews = data.views / data.count
    const avgSignups = data.signups / data.count
    const score = (avgViews * 0.3 + avgSignups * 70) // Weight signups heavily

    optimalTimes.push({
      platform,
      dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parseInt(day)],
      hour: parseInt(hour),
      score,
      reasoning: `Avg ${avgViews.toFixed(0)} views, ${avgSignups.toFixed(1)} signups per post`
    })
  }

  return optimalTimes.sort((a, b) => b.score - a.score)
}
```

### 5. Performance Tracker

**Purpose:** Real-time monitoring and attribution

```typescript
// app/api/marketing/track-performance/route.ts

async function trackPerformance() {
  // Google Analytics API integration
  const gaData = await fetchGoogleAnalytics()

  // Attribute signups to channels
  const signups = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    },
    select: {
      id: true,
      createdAt: true,
      // UTM parameters stored during signup
    }
  })

  // Update channel performance
  await updateChannelMetrics(gaData, signups)

  // Calculate ROI per channel
  const roi = await calculateChannelROI()

  return roi
}
```

### 6. Strategic Pivot Engine

**Purpose:** Auto-detect when to change strategy

```typescript
// app/api/marketing/analyze-strategy/route.ts

interface StrategyAnalysis {
  status: 'on-track' | 'behind' | 'ahead' | 'pivot-needed'
  currentSignups: number
  targetSignups: number
  daysRemaining: number
  projectedTotal: number
  recommendations: string[]
  pivotActions: PivotAction[]
}

interface PivotAction {
  action: string
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  deadline: Date
}

async function analyzeStrategy(): Promise<StrategyAnalysis> {
  const campaign = await prisma.marketingCampaign.findFirst({
    where: { status: 'active' },
    orderBy: { startDate: 'desc' }
  })

  if (!campaign) throw new Error('No active campaign')

  const daysElapsed = Math.floor((Date.now() - campaign.startDate.getTime()) / (24 * 60 * 60 * 1000))
  const totalDays = Math.floor((campaign.endDate!.getTime() - campaign.startDate.getTime()) / (24 * 60 * 60 * 1000))
  const daysRemaining = totalDays - daysElapsed

  const expectedSignups = (campaign.goal / totalDays) * daysElapsed
  const projected = (campaign.actual / daysElapsed) * totalDays

  // Analyze channel performance
  const channels = await prisma.channelPerformance.groupBy({
    by: ['channel'],
    _sum: { signups: true, cost: true },
    where: {
      date: {
        gte: campaign.startDate
      }
    }
  })

  const topChannel = channels.sort((a, b) =>
    (b._sum.signups || 0) - (a._sum.signups || 0)
  )[0]

  const worstChannel = channels.sort((a, b) =>
    (a._sum.signups || 0) - (b._sum.signups || 0)
  )[0]

  // Generate recommendations
  const recommendations: string[] = []
  const pivotActions: PivotAction[] = []

  if (campaign.actual < expectedSignups * 0.8) {
    recommendations.push(`⚠️ Behind schedule: ${campaign.actual} signups vs ${expectedSignups.toFixed(0)} expected`)

    pivotActions.push({
      action: `Double down on ${topChannel.channel} (currently ${topChannel._sum.signups} signups)`,
      impact: 'high',
      effort: 'low',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    })

    pivotActions.push({
      action: `Pause ${worstChannel.channel} (only ${worstChannel._sum.signups} signups) and reallocate time`,
      impact: 'medium',
      effort: 'low',
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    })
  }

  if (projected < campaign.goal * 0.9) {
    recommendations.push(`🚨 Unlikely to hit goal: Projected ${projected.toFixed(0)} of ${campaign.goal} signups`)

    pivotActions.push({
      action: 'Launch emergency Reddit campaign - share success story',
      impact: 'high',
      effort: 'medium',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    })
  }

  return {
    status: campaign.actual >= expectedSignups ? 'on-track' : 'behind',
    currentSignups: campaign.actual,
    targetSignups: campaign.goal,
    daysRemaining,
    projectedTotal: Math.round(projected),
    recommendations,
    pivotActions
  }
}
```

---

## UI/Dashboard

### Marketing Intelligence Dashboard (`/marketing-genius`)

```typescript
// app/marketing-genius/page.tsx

export default function MarketingGeniusPage() {
  return (
    <div className="p-8">
      <h1>🧠 Marketing Intelligence</h1>

      {/* Daily Briefing */}
      <section>
        <h2>Today's Briefing</h2>
        <DailyBriefing />
      </section>

      {/* Hot Opportunities */}
      <section>
        <h2>🔥 Hot Opportunities (Last 24h)</h2>
        <OpportunitiesList />
      </section>

      {/* Performance Dashboard */}
      <section>
        <h2>📊 Performance</h2>
        <PerformanceCharts />
      </section>

      {/* Content Generator */}
      <section>
        <h2>✍️ Content Generator</h2>
        <ContentGenerator />
      </section>

      {/* Strategic Analysis */}
      <section>
        <h2>🎯 Strategy Analysis</h2>
        <StrategyAnalysis />
      </section>
    </div>
  )
}
```

---

## Cron Jobs (Automation)

```typescript
// Run these automatically via Vercel Cron or separate service

// Every 6 hours: Scan for trends
// /api/cron/scan-trends
export async function GET() {
  await scanRedditTrends()
  await scanGoogleTrends()
  await scanPinterestTrends()
  return NextResponse.json({ success: true })
}

// Every 12 hours: Detect opportunities
// /api/cron/detect-opportunities
export async function GET() {
  const opportunities = await detectOpportunities()

  // Create insights
  for (const opp of opportunities) {
    await prisma.marketingInsight.create({
      data: {
        type: 'opportunity',
        priority: opp.priority,
        title: opp.title,
        description: opp.description,
        recommendation: opp.actionSteps.join('\n'),
        dataPoints: opp,
        status: 'new'
      }
    })
  }

  return NextResponse.json({ opportunities: opportunities.length })
}

// Daily: Analyze strategy
// /api/cron/analyze-strategy
export async function GET() {
  const analysis = await analyzeStrategy()

  // Send email if pivot needed
  if (analysis.pivotActions.length > 0) {
    await sendPivotAlert(analysis)
  }

  return NextResponse.json(analysis)
}

// Daily: Generate daily briefing
// /api/cron/daily-briefing
export async function GET() {
  const briefing = await generateDailyBriefing()
  await sendEmailBriefing(briefing)
  return NextResponse.json({ success: true })
}
```

---

## Cost Analysis

### API Costs (Monthly)
- OpenAI GPT-4 (content generation): $30-50
- Reddit API: Free
- Google Trends API: Free
- Pinterest API: Free
- Google Analytics API: Free

**Total: ~$30-50/month**

### Time Savings
- Manual content creation: 20 hours/week
- Manual trend research: 5 hours/week
- Manual performance tracking: 3 hours/week
- Manual distribution: 7 hours/week

**Total saved: ~35 hours/week = $1000-1500/week of your time**

**ROI: ~3000% 🚀**

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Database schema (Prisma models)
- [ ] Reddit trend scanner
- [ ] Google Trends integration
- [ ] Basic dashboard UI

### Week 2: Intelligence
- [ ] Opportunity detector (AI)
- [ ] Content generator (AI)
- [ ] Pinterest trend scanner
- [ ] Performance tracking

### Week 3: Automation
- [ ] Smart scheduler
- [ ] Cron jobs setup
- [ ] Email notifications
- [ ] Strategy analyzer

### Week 4: Polish
- [ ] Dashboard visualizations
- [ ] A/B testing framework
- [ ] Competitor analysis
- [ ] Daily briefing system

---

## Success Metrics

After 30 days, the system should:
- ✅ Generate 12-20 blog posts (automated)
- ✅ Identify 50+ opportunities
- ✅ Auto-schedule 100+ Pinterest pins
- ✅ Track performance across all channels
- ✅ Provide daily strategic briefings
- ✅ Alert when pivots needed

**Goal: 3x faster growth than manual marketing**

---

## Next Steps

1. Add Prisma schema to database
2. Create `/marketing-genius` admin page
3. Build Reddit trend scanner
4. Integrate OpenAI for content generation
5. Set up cron jobs for automation
6. Launch and monitor

This is the future of growth hacking. 🚀
