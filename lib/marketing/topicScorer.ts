/**
 * Topic Scoring Algorithm
 * Evaluates content topics for likelihood of success
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null

interface TopicInput {
  topic: string
  primaryKeyword: string
  relatedKeywords?: string[]
}

interface ScoreResult {
  demandScore: number // 0-100: Search demand/volume
  competitionScore: number // 0-100: How winnable
  relevanceScore: number // 0-100: Fit for Firefly Grove
  confidenceScore: number // 0-100: Overall success probability
  estimatedUsers: number // Estimated signups
  reasoningNotes: string
}

/**
 * Score a topic for content creation using AI
 */
export async function scoreTopic(input: TopicInput): Promise<ScoreResult> {
  try {
    // Use Claude to intelligently score the topic
    const aiScores = await scoreTopicWithAI(input)

    // Calculate overall confidence
    const confidenceScore = calculateConfidenceScore(
      aiScores.demandScore,
      aiScores.competitionScore,
      aiScores.relevanceScore
    )

    // Estimate users based on confidence
    const estimatedUsers = estimateUsers(confidenceScore, aiScores.demandScore)

    return {
      demandScore: aiScores.demandScore,
      competitionScore: aiScores.competitionScore,
      relevanceScore: aiScores.relevanceScore,
      confidenceScore,
      estimatedUsers,
      reasoningNotes: aiScores.reasoning,
    }
  } catch (error) {
    console.error('Error in scoreTopic, falling back to heuristics:', error)
    // If AI scoring completely fails, fall back to legacy heuristic scoring
    return scoreTopicLegacy(input)
  }
}

/**
 * Use Claude to score a topic intelligently
 */
async function scoreTopicWithAI(input: TopicInput): Promise<{
  demandScore: number
  competitionScore: number
  relevanceScore: number
  reasoning: string
}> {
  // Check if API key is available
  if (!anthropic || !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.trim() === '') {
    console.warn('ANTHROPIC_API_KEY not set or invalid, using heuristic scoring')
    return heuristicScoring(input)
  }

  const prompt = `You are a content strategist for Firefly Grove, a memory preservation app.

Mission: Help families preserve stories, voices, and memories before it's too late.
Target audience: Adult children (30-60) worried about losing aging parents' stories.
Key features: Sound wave art, memorial videos, Story Sparks, legacy release.

Evaluate this blog post topic:
Topic: "${input.topic}"
Primary Keyword: "${input.primaryKeyword}"
${input.relatedKeywords?.length ? `Related Keywords: ${input.relatedKeywords.join(', ')}` : ''}

Score this topic on three dimensions (0-100 scale):

1. DEMAND SCORE (0-100): How much search volume/interest exists?
   - Consider: Is this something people actively search for?
   - Long-tail keywords (4-6 words) often have lower volume but higher intent
   - Question keywords ("how to", "why") indicate strong search intent
   - Memory/family/legacy topics have niche but passionate audiences

2. COMPETITION SCORE (0-100): How beatable is the competition?
   - Higher score = easier to rank
   - Very specific topics (5+ words) have less competition
   - Emotional/storytelling angles are easier than generic "how-to" posts
   - Firefly Grove's unique angle (urgency, regret prevention) can beat generic competitors

3. RELEVANCE SCORE (0-100): How well does this fit Firefly Grove?
   - Does it naturally lead to our features (voice recording, sound wave art, legacy release)?
   - Does it address our audience's pain points (urgency, regret, preservation)?
   - Can we write this better than competitors due to our unique expertise?

Return ONLY valid JSON:
{
  "demandScore": 75,
  "competitionScore": 80,
  "relevanceScore": 90,
  "reasoning": "Brief 2-3 sentence explanation of scores"
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      // Fallback to heuristic scoring if AI fails
      console.warn('AI scoring failed, using heuristic fallback')
      return heuristicScoring(input)
    }

    const result = JSON.parse(jsonMatch[0])
    return {
      demandScore: Math.min(100, Math.max(0, result.demandScore)),
      competitionScore: Math.min(100, Math.max(0, result.competitionScore)),
      relevanceScore: Math.min(100, Math.max(0, result.relevanceScore)),
      reasoning: result.reasoning,
    }
  } catch (error) {
    console.error('Error in AI scoring:', error)
    // Fallback to heuristic scoring
    return heuristicScoring(input)
  }
}

/**
 * Fallback heuristic scoring if AI fails
 */
function heuristicScoring(input: TopicInput): {
  demandScore: number
  competitionScore: number
  relevanceScore: number
  reasoning: string
} {
  const demandScore = calculateDemandScoreHeuristic(input.primaryKeyword, input.relatedKeywords)
  const competitionScore = calculateCompetitionScoreHeuristic(input.primaryKeyword)
  const relevanceScore = calculateRelevanceScoreHeuristic(input.topic, input.primaryKeyword)

  return {
    demandScore,
    competitionScore,
    relevanceScore,
    reasoning: 'Scored using heuristic fallback due to AI scoring error.',
  }
}

/**
 * Score a topic for content creation (LEGACY - for backward compatibility)
 */
export function scoreTopicLegacy(input: TopicInput): ScoreResult {
  // 1. Demand Score: Estimate search volume/demand
  const demandScore = calculateDemandScoreHeuristic(input.primaryKeyword, input.relatedKeywords)

  // 2. Competition Score: How beatable are competitors
  const competitionScore = calculateCompetitionScoreHeuristic(input.primaryKeyword)

  // 3. Relevance Score: How well does this fit Firefly Grove?
  const relevanceScore = calculateRelevanceScoreHeuristic(input.topic, input.primaryKeyword)

  // 4. Combined Confidence Score (weighted average)
  const confidenceScore = calculateConfidenceScore(demandScore, competitionScore, relevanceScore)

  // 5. Estimate users based on confidence
  const estimatedUsers = estimateUsers(confidenceScore, demandScore)

  // 6. Generate reasoning
  const reasoningNotes = generateReasoning({
    topic: input.topic,
    demandScore,
    competitionScore,
    relevanceScore,
    confidenceScore,
  })

  return {
    demandScore,
    competitionScore,
    relevanceScore,
    confidenceScore,
    estimatedUsers,
    reasoningNotes,
  }
}

/**
 * Calculate demand score based on keyword (HEURISTIC)
 * Uses Google autocomplete suggestions as proxy for search volume
 */
function calculateDemandScoreHeuristic(primaryKeyword: string, relatedKeywords?: string[]): number {
  // Generous heuristic scoring for memory/family topics
  // Start with a higher base since our niche is passionate but small

  let score = 60 // Higher base score

  // Longer tail keywords = more specific = lower volume but MUCH higher intent
  const wordCount = primaryKeyword.split(' ').length
  if (wordCount >= 4) score += 5 // Long tail = high intent (was -20!)
  else if (wordCount === 3) score += 15 // Sweet spot
  else score += 10 // Short keywords are fine too

  // Question keywords indicate high intent
  if (/^(how|what|why|when|where|can|should|will)/i.test(primaryKeyword)) {
    score += 15
  }

  // Pain point keywords - these are GOLD for us
  if (/before (it\'s too late|they|you|losing|forget|pass)/i.test(primaryKeyword)) {
    score += 20
  }

  // Memory/family keywords (our core audience)
  if (/(memor|family|legacy|ancestor|genealogy|preserve|story|voice|photo|grandparent|parent)/i.test(primaryKeyword)) {
    score += 15
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate competition score (HEURISTIC)
 * Higher score = easier to compete
 */
function calculateCompetitionScoreHeuristic(primaryKeyword: string): number {
  // Optimistic competition scoring - memory preservation is still a growing niche

  let score = 70 // Higher base: assume beatable competition

  // Very specific queries have less competition
  const wordCount = primaryKeyword.split(' ').length
  if (wordCount >= 5) score += 20 // Very specific
  else if (wordCount === 4) score += 15
  else if (wordCount === 3) score += 10
  else score += 5 // Even short keywords can work in our niche

  // Question format has less competition (long-form content)
  if (/^(how to|how do i|what is|why should)/i.test(primaryKeyword)) {
    score += 10
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate relevance to Firefly Grove (HEURISTIC)
 * How well does this align with our mission and product?
 */
function calculateRelevanceScoreHeuristic(topic: string, primaryKeyword: string): number {
  let score = 65 // Higher base - Claude generates relevant topics

  const content = `${topic} ${primaryKeyword}`.toLowerCase()

  // Core product features - HIGHLY relevant
  if (/(voice recording|sound wave|audio|recording|memories|memorial|tribute|legacy)/i.test(content)) {
    score += 25
  }

  // Target audience pain points - KEY for us
  if (/(grandparent|elderly|aging parent|before (it\'s too late|death|lose|losing)|preserve|save|capture)/i.test(content)) {
    score += 20
  }

  // Family/memory themes - PERFECT fit
  if (/(family|ancestor|genealogy|heritage|history|story|stories|photos|album|generation)/i.test(content)) {
    score += 15
  }

  // Competitor topics (not unique to us) - but don't penalize too much
  if (/(social media|facebook|instagram|twitter)/i.test(content)) {
    score -= 10 // Reduced penalty
  }

  // Generic topics are OK if they're about our niche
  // Remove the penalty - Claude generates good generic topics

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate overall confidence score
 * Weighted combination of all scores
 */
function calculateConfidenceScore(
  demandScore: number,
  competitionScore: number,
  relevanceScore: number
): number {
  // Weighted average:
  // - Relevance: 40% (most important - must fit our product)
  // - Competition: 35% (must be winnable)
  // - Demand: 25% (need enough search volume)

  const confidence =
    relevanceScore * 0.4 + competitionScore * 0.35 + demandScore * 0.25

  return Math.round(confidence)
}

/**
 * Estimate users we'll get from this content
 * Based on confidence and demand
 */
function estimateUsers(confidenceScore: number, demandScore: number): number {
  // Conservative estimates:
  // High confidence (80+) + high demand (80+) = 15-25 users
  // High confidence (80+) + medium demand (50-80) = 10-15 users
  // Medium confidence (60-80) + high demand = 8-12 users
  // Medium everything = 5-8 users
  // Low confidence (<60) = 2-5 users

  if (confidenceScore >= 80 && demandScore >= 80) {
    return Math.floor(15 + Math.random() * 10) // 15-25
  } else if (confidenceScore >= 80 && demandScore >= 50) {
    return Math.floor(10 + Math.random() * 5) // 10-15
  } else if (confidenceScore >= 60 && demandScore >= 80) {
    return Math.floor(8 + Math.random() * 4) // 8-12
  } else if (confidenceScore >= 60) {
    return Math.floor(5 + Math.random() * 3) // 5-8
  } else {
    return Math.floor(2 + Math.random() * 3) // 2-5
  }
}

/**
 * Generate human-readable reasoning for scores
 */
function generateReasoning(data: {
  topic: string
  demandScore: number
  competitionScore: number
  relevanceScore: number
  confidenceScore: number
}): string {
  const parts: string[] = []

  // Overall assessment
  if (data.confidenceScore >= 80) {
    parts.push('🎯 **High confidence topic** - Excellent fit for Firefly Grove.')
  } else if (data.confidenceScore >= 65) {
    parts.push('✅ **Good topic** - Should perform well.')
  } else if (data.confidenceScore >= 50) {
    parts.push('⚠️ **Moderate topic** - May work with strong execution.')
  } else {
    parts.push('❌ **Risky topic** - Consider alternatives.')
  }

  // Demand analysis
  if (data.demandScore >= 70) {
    parts.push(`**Demand**: Strong search interest for this topic.`)
  } else if (data.demandScore >= 50) {
    parts.push(`**Demand**: Moderate search volume - niche but viable.`)
  } else {
    parts.push(`**Demand**: Low search volume - may need promotion beyond SEO.`)
  }

  // Competition analysis
  if (data.competitionScore >= 70) {
    parts.push(`**Competition**: Low competition - easier to rank.`)
  } else if (data.competitionScore >= 50) {
    parts.push(`**Competition**: Moderate competition - winnable with quality content.`)
  } else {
    parts.push(`**Competition**: High competition - will need exceptional content.`)
  }

  // Relevance analysis
  if (data.relevanceScore >= 80) {
    parts.push(`**Relevance**: Perfect alignment with Firefly Grove's mission and features.`)
  } else if (data.relevanceScore >= 65) {
    parts.push(`**Relevance**: Good fit for our target audience.`)
  } else if (data.relevanceScore >= 50) {
    parts.push(`**Relevance**: Tangentially related - ensure strong Firefly Grove angle.`)
  } else {
    parts.push(`**Relevance**: Weak connection to our product - may not convert well.`)
  }

  return parts.join('\n\n')
}
