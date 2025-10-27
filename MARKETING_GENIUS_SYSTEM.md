# Marketing Genius: AI Content Intelligence System

## Overview

A fully automated content intelligence and repurposing system that generates high-converting blog topics, scores them for success probability, and creates multi-platform content from a single long-form piece.

**Core Philosophy**: "Almost can't fail" content strategy through AI-powered topic scoring, quality filtering, and intelligent repurposing.

---

## System Architecture

### Components

1. **Topic Generator** - AI brainstorms content ideas
2. **Topic Scorer** - Evaluates topics across 3 dimensions
3. **Content Brief Generator** - Creates detailed writing briefs
4. **Content Writer** - Writes 2000+ word blog posts
5. **Content Repurposer** - Converts blog into platform-specific pieces
6. **Batch Processor** - Handles multiple topics in parallel

### Database Schema

```sql
TopicScore
- topic, primaryKeyword, relatedKeywords
- demandScore, competitionScore, relevanceScore
- confidenceScore (0-100) - overall success probability
- estimatedUsers - expected signups
- status (candidate → approved → drafted → published)
- reasoningNotes - AI explanation of scores

ContentBrief
- topicScoreId (links to TopicScore)
- title, targetKeywords, suggestedLength
- outlinePoints, suggestedH2s
- ctaRecommendation, toneNotes
- topCompetitors, contentGaps

ContentPattern
- patternType (structure, cta, tone, etc.)
- avgConversionRate, sampleSize
- definition, examples
- Learning system for continuous improvement

CompetitorAnalysis
- url, domain, title, primaryKeyword
- wordCount, h2Count, imageCount
- headings, keyPoints
- identifiedGaps, ourAdvantage
```

---

## The Complete Workflow

### Phase 1: Automated Topic Generation & Scoring

**Location**: `/marketing-genius/topics`

**Step 1: Generate Topics**
```
Click "Generate Topics"
→ Set parameters:
  • Count: 20 topics (AI will brainstorm)
  • Min Confidence: 65% (only keep winners)
  • Optional: Focus areas

→ AI Process:
  1. Claude generates 20 topic ideas based on:
     - Firefly Grove mission & features
     - Target audience pain points (regret prevention, urgency)
     - Real search queries people use
     - Natural keyword opportunities

  2. Each topic is scored across 3 dimensions:

     a) DEMAND SCORE (0-100)
        - Search volume proxy using keyword characteristics
        - Question format = higher demand (how to, what is, etc.)
        - Pain point keywords = higher demand
        - Memory/family keywords = niche relevance boost

     b) COMPETITION SCORE (0-100)
        - Longer keywords = less competition (easier to rank)
        - Question format = less competition (long-form content)
        - Very specific queries = higher score

     c) RELEVANCE SCORE (0-100)
        - Core product features = +30 (voice, sound wave, legacy)
        - Target pain points = +25 (before it's too late, preserve)
        - Family themes = +15
        - Generic topics = penalty

     d) CONFIDENCE SCORE (weighted average)
        Formula: (Relevance × 40%) + (Competition × 35%) + (Demand × 25%)

        Why this weighting?
        - Relevance most important (must fit our product)
        - Competition second (must be winnable)
        - Demand third (needs volume, but quality over quantity)

     e) ESTIMATED USERS
        Conservative estimates based on confidence + demand:
        - 80%+ confidence + 80%+ demand = 15-25 users
        - 80%+ confidence + 50-80% demand = 10-15 users
        - 60-80% confidence + 80%+ demand = 8-12 users
        - 60-80% confidence = 5-8 users
        - <60% confidence = 2-5 users

  3. Filter: Only topics above min confidence threshold are saved

  4. Result: ~8-12 winning topics (40-60% pass rate)

→ Output displayed:
  • Each topic with confidence score
  • Demand/Competition/Relevance breakdown
  • Estimated user acquisition
  • AI reasoning for the scores
```

**Example Output**:
```
Topic: "Recording Your Grandmother's Stories Before It's Too Late"
Primary Keyword: "how to record grandparents stories"
Confidence: 87%
  - Demand: 75 (good search volume, question format)
  - Competition: 85 (4-word keyword, specific)
  - Relevance: 95 (perfect fit - urgency, family, memory preservation)
Estimated Users: 18
Reasoning:
  🎯 High confidence topic - Excellent fit for Firefly Grove
  **Demand**: Strong search interest for this topic
  **Competition**: Low competition - easier to rank
  **Relevance**: Perfect alignment with mission and features
```

---

### Phase 2: Content Repurposing Strategy

**The Core Insight**: One long-form blog post can become 10+ platform-specific pieces.

**Step 1: Select Topics**
```
☑️ Use checkboxes to select topics
☑️ Or click "Select All" for batch processing
→ Shows total estimated users from selected topics
```

**Step 2: Configure Multi-Format Generation**
```
Click "Generate Content" to open settings panel

Per selected topic, configure:

📝 Blog Post: 1 (always - this is the source content)
   - 2000+ words, SEO-optimized
   - Uses BRAND.md voice + COMPASS.md mission
   - Natural Firefly Grove feature mentions
   - H2 structure from content brief
   - Meta description + slug generation

📧 Newsletter: 0 or 1
   - Email version of blog post
   - Personal, warm tone (friend to friend)
   - Subject line + 200-300 words
   - 2-3 key takeaways
   - CTA linking to full blog post
   - Plain text format (not HTML)

👤 Facebook: 0-5 posts
   - Personal account style (not business page)
   - First person, conversational
   - Each post highlights different angle/takeaway
   - 100-200 words, mobile-friendly
   - 1-2 emojis (natural, not overdone)
   - Soft CTA: "I wrote about this..." (not salesy)

📌 Pinterest: 0-5 pins
   - SEO-optimized titles (60-100 chars)
   - Detailed descriptions (100-500 chars)
   - 3-5 relevant hashtags per pin
   - Each pin focuses on different benefit
   - Keyword-rich for Pinterest search

💬 Reddit: 0-5 posts
   - Authentic, helpful tone (Redditors hate marketing)
   - Tailored for specific subreddits:
     * r/Genealogy (family history angle)
     * r/AskOldPeople (memory preservation)
     * r/family (family dynamics, legacy)
   - Discussion starter format (questions, scenarios)
   - Natural blog mention at end
   - 150-300 words

Scheduling:
- Start Date: When to begin posting blog posts
- Days Between Posts: Interval for main blog posts (e.g., 7 days)

  Note: All repurposed content created immediately as drafts
        Publish them manually when ready
```

**Step 3: Generate All**
```
Click "Generate All"

→ Backend Process (per topic):

1. Check if ContentBrief exists
   - If not, generate brief from TopicScore
   - Brief includes: title, keywords, outline, H2s, CTA, tone notes

2. Generate Main Blog Post
   - Load BRAND.md (voice guidelines)
   - Load COMPASS.md (mission/values)
   - Send to Claude API with brief + brand context
   - Claude writes 2000+ word blog post in markdown
   - Generate SEO meta description
   - Create URL slug
   - Save as draft MarketingPost (platform: blog)

3. Repurpose into Platform-Specific Content
   - Send blog post to Claude again with repurposing instructions
   - Claude creates all requested formats:
     * Newsletter: Email-friendly version
     * Facebook: Multiple posts, different angles
     * Pinterest: SEO-rich pin descriptions
     * Reddit: Subreddit-tailored posts
   - Each piece saved as separate MarketingPost draft
   - Linked to original topic for tracking

4. Update Topic Status
   - TopicScore.status: candidate → drafted
   - Link TopicScore.postId to main blog post

5. Add to Content Calendar
   - Create ContentCalendar entry
   - Set scheduledFor based on startDate + interval
   - Status: generated

→ Output: All content as drafts in MarketingPost table

→ Timing: ~5-10 minutes per topic (depending on formats selected)
```

**Example: 3 Topics Selected**
```
Settings:
- Blog: 1
- Newsletter: 1
- Facebook: 2
- Pinterest: 3
- Reddit: 2

Total Generated:
- 3 blog posts (2000+ words each)
- 3 newsletter emails
- 6 Facebook posts
- 9 Pinterest pins
- 6 Reddit posts

= 27 pieces of content from 3 clicks

Estimated Impact:
- If topics averaged 15 estimated users each
- 3 topics × 15 = 45 potential new users
```

---

### Phase 3: Review & Publish

**Location**: `/marketing-genius` (main dashboard)

**Step 1: Review Drafts**
```
→ Draft Posts section shows all generated content
→ Grouped by platform (blog, email, facebook, pinterest, reddit)
→ Preview content before publishing
```

**Step 2: Publish**
```
→ 1-click publish button per post
→ Blog posts:
  - Creates actual markdown file in public/blog/
  - Adds to site navigation
  - SEO meta tags applied
  - URL slug activated

→ Other platforms:
  - Copy content to clipboard
  - Paste into respective platforms manually
  - (Future: Direct API integration)
```

---

## Topic Scoring Logic Deep Dive

### Why These Scores Matter

**Demand Score** (25% weight)
- Measures: Is anyone searching for this?
- Higher = more potential traffic
- But quality matters more than quantity for niche apps like Firefly Grove

**Competition Score** (35% weight)
- Measures: Can we actually rank for this?
- Higher = easier to rank (less competition)
- Critical because new sites struggle against established domains

**Relevance Score** (40% weight - MOST IMPORTANT)
- Measures: Will this convert visitors to users?
- Higher = better fit for Firefly Grove's mission
- We don't want traffic that doesn't convert

### Scoring Heuristics

**Demand Indicators**:
```
Question keywords: +20
  "how to record grandparents stories"
  → People asking questions = high intent

Pain point phrases: +15
  "before it's too late"
  "before they forget"
  → Urgency = action-oriented audience

Memory/family keywords: +10
  memory, preserve, legacy, family, ancestor
  → Our niche = relevant traffic

Long-tail (4+ words): -20
  → Lower volume BUT higher intent
  → We accept this tradeoff
```

**Competition Indicators**:
```
Very specific (5+ words): +25
  "how to record grandmother's voice for sound wave art"
  → So specific, few competitors bother

Question format: +10
  → Long-form content = fewer competitors

3-4 words: Sweet spot
  → Balance of volume and competition
```

**Relevance Indicators**:
```
Core features: +30
  voice recording, sound wave, memorial video, legacy release
  → Directly showcases what we offer

Target pain points: +25
  "before it's too late", preserve, save, capture
  → Speaks to our audience's fears/motivations

Family themes: +15
  family, grandparent, ancestor, story, heritage
  → Our demographic

Social media topics: -20
  facebook, instagram, twitter
  → Not our differentiation, poor fit
```

---

## Content Quality Standards

### Blog Posts

**Structure**:
```markdown
# Title (includes primary keyword)

Introduction (200-300 words)
- Hook: Emotional story or scenario
- Problem: Why this matters NOW
- Promise: What reader will learn

## H2: Why [Topic] Matters
- Emotional weight
- Statistics/context
- Personal connection

## H2: The Problem
- Pain points
- What happens if you don't act
- Regret prevention angle

## H2: Step-by-Step / Deep Dive
- Actionable steps OR detailed exploration
- Break complex into simple
- Examples throughout

## H2: Tools & Resources
- What you need
- How Firefly Grove helps (natural mention)
- Alternative options (show we're not pushy)

## H2: Common Mistakes
- Learn from others
- Reduce friction
- Build credibility

## H2: Real Examples
- Success stories
- Before/after
- Relatable scenarios

## H2: Take Action Today
- Clear next steps
- Firefly Grove CTA
- Link to sign up

---

Total: 2000+ words
Keywords: Naturally integrated
Tone: Warm, empathetic, urgent
Voice: BRAND.md guidelines
Mission: COMPASS.md values
```

**Voice Guidelines** (from BRAND.md):
- Warm, empathetic, but urgent
- We care deeply, and time matters
- Balance nostalgia with urgency
- Make them FEEL the weight of losing memories
- Then offer hope/solution
- Never sell hard - present Firefly Grove as obvious solution

**Quality Checkers**:
- Primary keyword in title, first paragraph, 2-3 H2s
- Semantic variations throughout
- Short paragraphs (mobile-friendly)
- Bold for emphasis
- Bullet lists for scannability
- Specific examples (grandmother's voice, father's stories)
- No generic advice - everything tied to family memory preservation

### Repurposed Content

**Newsletter Email**:
```
Subject: [Compelling, under 50 chars]
Example: "Before it's too late: Record their voice"

[Personal opening - like talking to a friend]

[2-3 key takeaways from blog]

[Clear CTA: "Read the full guide here: [link]"]

[Warm signature]

Length: 200-300 words
Tone: Personal, warm, urgent
```

**Facebook Post**:
```
[Opening hook - story, question, or emotional statement]

[Short paragraphs - mobile-friendly]

[Key insight or takeaway]

[Soft CTA: "I wrote about this on my blog..." or "Link in comments"]

Length: 100-200 words
Emojis: 1-2 max, natural
Tone: First person, conversational
```

**Pinterest Pin**:
```
Title: [Keyword-rich, 60-100 chars]
Example: "How to Preserve Your Grandmother's Voice Forever"

Description:
[Detailed, helpful, 100-500 chars]
[Include primary keyword naturally]
[Focus on benefit/outcome]
[3-5 hashtags]

Example:
"Capture your grandmother's stories before they're lost forever. This complete guide shows you how to record, preserve, and turn her voice into beautiful wall art that your family will treasure for generations. #FamilyMemories #MemoryPreservation #FamilyHistory #LegacyPlanning #Genealogy"
```

**Reddit Post**:
```
Subreddit: [Suggested based on topic angle]
Example: r/Genealogy

Title: [Discussion starter, follows subreddit norms]
Example: "What's your system for recording family stories?"

Body:
[Authentic, helpful content - NOT promotional]
[Share insights from blog without being salesy]
[Personal experience or asking for community input]

[Natural blog mention at end]
"I wrote more about this here if you're interested: [link]"

Length: 150-300 words
Tone: Authentic, community-focused
```

---

## File Structure

```
/app
  /api/marketing
    /topics
      /generate           → Auto-generate topics
      /score              → Score individual topic
      /top                → Get top candidates
      /batch-generate     → Batch content generation
      /[id]               → Delete topic
    /briefs
      /generate           → Generate content brief
  /marketing-genius
    /page.tsx             → Main dashboard
    /topics
      /page.tsx           → Topic intelligence UI
    /kpis
      /page.tsx           → KPI tracking & financials
    /content-plan
      /page.tsx           → Content calendar

/lib/marketing
  /topicGenerator.ts      → AI topic brainstorming
  /topicScorer.ts         → Scoring algorithm
  /briefGenerator.ts      → Content brief creation
  /contentWriter.ts       → Blog post writer
  /contentRepurposer.ts   → Platform-specific repurposing

/prisma
  schema.prisma           → Database models
    - TopicScore
    - ContentBrief
    - ContentPattern
    - CompetitorAnalysis
    - MarketingPost
    - ContentCalendar
```

---

## Key Design Decisions

### 1. Why Not Use Keyword APIs?

**Decision**: Build our own scoring heuristics instead of paying for SEMrush/Ahrefs

**Reasoning**:
- Keyword APIs are expensive ($99-300/month)
- They're optimized for generic SEO, not niche apps
- We can build domain-specific heuristics
- Our scoring emphasizes relevance over volume (better for conversion)
- Heuristics can be improved based on actual performance data

**Trade-off**: Less precise volume data, but better fit for our needs

### 2. Why 40% Weight on Relevance?

**Decision**: Relevance is weighted highest in confidence score

**Reasoning**:
- We don't need massive traffic - we need the RIGHT traffic
- A post with 1000 views and 50 signups beats 10,000 views and 20 signups
- Firefly Grove is niche - relevance = conversion
- Better to rank #1 for "how to preserve grandma's voice" than #50 for "family photos"

### 3. Why Content Repurposing vs. Unique Content?

**Decision**: Create derivatives from one source rather than unique content per platform

**Reasoning**:
- Time efficiency: 1 blog → 9 pieces in same time as writing 9 unique pieces
- Consistency: Message stays aligned across platforms
- SEO boost: Blog post is deep, authoritative; social amplifies it
- Resource optimization: Better to write 3 great blogs → 27 pieces than 27 mediocre pieces

**Trade-off**: Slightly less platform-native feel, but massive time savings

### 4. Why Conservative User Estimates?

**Decision**: Estimate 2-25 users per topic (conservative)

**Reasoning**:
- Under-promise, over-deliver
- New site with low domain authority
- Better to be pleasantly surprised than disappointed
- Forces focus on quality over quantity

**Reality Check**: Even 5 users per post × 20 posts = 100 users (Phase 1 goal achieved)

---

## Success Metrics

### Phase 1: Prove the Model (First 100 Users)

**Content Goals**:
- Generate 20 winning topics (65%+ confidence)
- Write 10-15 blog posts
- Track actual users per post vs. estimates
- Identify which topic types convert best

**Quality Indicators**:
- Blog posts convert at 2-5% (views → signups)
- Estimated users within 50% of actual
- At least 3 posts rank top 10 for target keywords
- Newsletter open rate >25%

**Learning Loop**:
- Track which topics actually performed
- Update ContentPattern table with learnings
- Adjust scoring weights based on data
- Improve brief generator with proven structures

### Phase 2: Scale (100 → 1,000)

**Content Goals**:
- Generate 100+ topics
- Have 50+ published blog posts
- Repurpose into 500+ platform-specific pieces
- Establish content calendar cadence

**Quality Indicators**:
- Confidence scores correlate with actual performance
- Conversion rate improves over time (learning loop working)
- Organic search drives 60%+ of traffic
- Content brings 500+ users

---

## Troubleshooting

### Topics Not Generating

**Issue**: "Failed to generate topics"

**Checks**:
1. Is ANTHROPIC_API_KEY set in .env?
2. Check API quota/rate limits
3. Look at server logs for Claude API errors
4. Verify database connection (TopicScore table exists)

### Low Confidence Scores

**Issue**: All topics scoring below 65%

**Possible Causes**:
- AI generating too generic topics
- Scoring algorithm too strict
- Need to adjust focus areas

**Solutions**:
- Add focus areas: "memory preservation urgency", "voice recording"
- Lower min confidence to 60% temporarily
- Review reasoningNotes to understand why scores are low

### Content Quality Issues

**Issue**: Generated blog posts feel off-brand

**Checks**:
1. Is BRAND.md accurate and detailed?
2. Is COMPASS.md loaded correctly?
3. Review contentWriter.ts prompt
4. Check if Claude API using correct model (claude-3-5-sonnet)

**Solutions**:
- Update BRAND.md with more specific voice examples
- Add example blog posts Claude should emulate
- Adjust temperature in API calls (lower = more consistent)

### Repurposed Content Not Saving

**Issue**: Blog post created but no Facebook/Pinterest/etc.

**Checks**:
1. Are format counts > 0 in request?
2. Check server logs for repurposing errors
3. Verify MarketingPost table accepts all platforms

**Debug**:
- Test with just 1 format at a time
- Check if issue is specific to certain platforms
- Verify contentRepurposer.ts returning data

---

## Future Enhancements

### Learning Loop (ContentPattern)

**Goal**: System gets smarter over time

**Approach**:
1. Track performance: views, signups, conversion rate per post
2. Analyze patterns in high-performers:
   - Word count
   - H2 structure
   - CTA wording
   - Keyword density
   - Emotional hooks used
3. Store patterns in ContentPattern table
4. Brief generator uses learned patterns
5. Confidence scores weighted by historical performance

**Example**:
```
Pattern Discovered:
- Posts with "Before It's Too Late" in title convert 3× better
- H2s with questions outperform statements
- CTAs mentioning "14-day trial" beat "sign up"

→ Future briefs automatically use these patterns
→ Scoring algorithm boosts topics with urgency phrases
```

### Direct Platform Integration

**Goal**: Publish to social platforms automatically

**Approach**:
- Facebook Graph API for personal posts
- Pinterest API for pins
- Reddit API for posts (with caution - respect community)
- Mailchimp API for newsletter sending

**Why Not Now**: Manual posting allows quality control during beta

### Competitor Analysis Automation

**Goal**: Actually fetch and analyze competitor content

**Approach**:
1. For each high-scoring topic, search Google for primary keyword
2. Scrape top 3 results
3. Extract: word count, structure, key points, gaps
4. Store in CompetitorAnalysis table
5. Use insights in brief generation

**Why Not Now**: Adds complexity, heuristics work well enough for Phase 1

### A/B Testing

**Goal**: Test variations to optimize conversion

**Approach**:
- Generate 2 versions of each blog post
- Vary: title, CTA, opening hook
- Track which performs better
- Learn what works for Firefly Grove audience

---

## API Documentation

### POST /api/marketing/topics/generate

**Auto-generate and score topics**

Request:
```json
{
  "count": 20,
  "minConfidence": 65,
  "focusAreas": ["memory preservation", "voice recording"] // optional
}
```

Response:
```json
{
  "success": true,
  "topics": [/* TopicScore objects */],
  "stats": {
    "generated": 20,
    "passed": 8,
    "averageConfidence": 72,
    "totalEstimatedUsers": 120,
    "highConfidence": 5,
    "mediumConfidence": 3
  },
  "message": "Generated 8 winning topics (5 high confidence, 3 medium confidence)"
}
```

### POST /api/marketing/topics/batch-generate

**Generate content from multiple topics**

Request:
```json
{
  "topicIds": ["topic_1", "topic_2", "topic_3"],
  "formats": {
    "blog": 1,
    "newsletter": 1,
    "facebook": 2,
    "pinterest": 3,
    "reddit": 2
  },
  "startDate": "2025-02-01",
  "intervalDays": 7
}
```

Response:
```json
{
  "success": true,
  "summary": {
    "success": 3,
    "errors": 0,
    "totalPosts": 27
  },
  "results": [
    {
      "topicId": "topic_1",
      "topic": "Recording Your Grandmother's Stories",
      "postsGenerated": 9,
      "posts": [/* MarketingPost IDs */]
    }
  ],
  "message": "Generated 27 posts from 3 topics"
}
```

---

## Environment Variables Required

```env
# Claude API (required for all AI features)
ANTHROPIC_API_KEY=sk-ant-...

# Database (required)
DATABASE_URL=postgresql://...

# NextAuth (required for admin access)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://fireflygrove.app
```

---

## The Vision: Almost Can't Fail Content

**Traditional Content Strategy Problems**:
1. Don't know which topics will work → Write 10, hope 2 succeed
2. SEO guesswork → May never rank
3. Generic content → Doesn't convert
4. Time-intensive → Can't scale

**Marketing Genius Solution**:
1. AI scores topics BEFORE writing → Only write winners
2. Heuristic-based scoring → Optimized for niche conversion
3. Brand-aligned content → Every post fits mission perfectly
4. Repurposing → 1 blog = 9 pieces, massive scale

**Result**:
- Write less, get more impact
- 80% of topics should perform well (vs. 20% traditional)
- Content engine that runs itself
- Sustainable path to 100 users, then 1,000, then 10,000

---

## Quick Start Guide

**First Time Setup**:
1. Ensure ANTHROPIC_API_KEY in .env
2. Run `npx prisma db push` (if not done)
3. Set yourself as admin in User table
4. Navigate to /marketing-genius/topics

**Generate First Batch**:
1. Click "Generate Topics"
2. Set: 10 topics, 65% min confidence
3. Wait 2 minutes
4. Review 4-6 winning topics

**Create First Content**:
1. Check all topics
2. Click "Generate Content"
3. Settings: 1 blog, 1 newsletter, 1 FB, 2 Pinterest, 1 Reddit
4. Click "Generate All"
5. Wait 10-15 minutes
6. Review drafts in main dashboard

**Publish**:
1. Review blog post quality
2. Click "Publish" when satisfied
3. Copy social content to platforms
4. Track results

**Iterate**:
1. After 1 month, check which topics performed
2. Look for patterns (urgency? specific features? pain points?)
3. Adjust focus areas for next generation
4. Generate 20 more topics
5. Repeat

---

## Conclusion

This system transforms content creation from guesswork to science. By scoring topics BEFORE writing, we ensure effort goes into winners. By repurposing intelligently, we maximize impact per hour invested.

The goal: A content engine that runs itself, brings 100 users in 100 days, and scales to 1,000+ with minimal manual effort.

**Next Step**: Generate your first 10 topics and see the system in action.

---

*Last Updated: 2025-01-27*
*Version: 1.0 - Initial System*
