/**
 * Topic Scoring Algorithm
 * Evaluates content topics for likelihood of success
 */

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
 * Score a topic for content creation
 */
export async function scoreTopic(input: TopicInput): Promise<ScoreResult> {
  // 1. Demand Score: Estimate search volume/demand
  const demandScore = await calculateDemandScore(input.primaryKeyword, input.relatedKeywords)

  // 2. Competition Score: How beatable are competitors
  const competitionScore = await calculateCompetitionScore(input.primaryKeyword)

  // 3. Relevance Score: How well does this fit Firefly Grove?
  const relevanceScore = calculateRelevanceScore(input.topic, input.primaryKeyword)

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
 * Calculate demand score based on keyword
 * Uses Google autocomplete suggestions as proxy for search volume
 */
async function calculateDemandScore(primaryKeyword: string, relatedKeywords?: string[]): Promise<number> {
  // For now, use a heuristic based on keyword characteristics
  // In production, this would hit Google Autocomplete API

  let score = 50 // Base score

  // Longer tail keywords = more specific = lower volume but higher intent
  const wordCount = primaryKeyword.split(' ').length
  if (wordCount >= 4) score -= 20 // Long tail, lower volume
  else if (wordCount === 3) score += 10 // Sweet spot
  else score += 5 // Short, might be too generic

  // Question keywords indicate high intent
  if (/^(how|what|why|when|where|can|should|will)/i.test(primaryKeyword)) {
    score += 20
  }

  // Pain point keywords
  if (/before (it\'s too late|they|you|losing|forget)/i.test(primaryKeyword)) {
    score += 15
  }

  // Memory/family keywords (our niche)
  if (/(memor|family|legacy|ancestor|genealogy|preserve|story|voice|photo)/i.test(primaryKeyword)) {
    score += 10
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate competition score
 * Higher score = easier to compete
 */
async function calculateCompetitionScore(primaryKeyword: string): Promise<number> {
  // For now, use heuristics
  // In production, this would analyze actual search results

  let score = 60 // Base: assume moderate competition

  // Very specific queries have less competition
  const wordCount = primaryKeyword.split(' ').length
  if (wordCount >= 5) score += 25 // Very specific
  else if (wordCount === 4) score += 15
  else if (wordCount === 3) score += 5
  else score -= 10 // Too broad

  // Question format has less competition (long-form content)
  if (/^(how to|how do i|what is|why should)/i.test(primaryKeyword)) {
    score += 10
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate relevance to Firefly Grove
 * How well does this align with our mission and product?
 */
function calculateRelevanceScore(topic: string, primaryKeyword: string): number {
  let score = 50 // Base

  const content = `${topic} ${primaryKeyword}`.toLowerCase()

  // Core product features
  if (/(voice recording|sound wave|audio|recording|memories|memorial|tribute|legacy)/i.test(content)) {
    score += 30
  }

  // Target audience pain points
  if (/(grandparent|elderly|aging parent|before (it\'s too late|death|lose|losing)|preserve|save|capture)/i.test(content)) {
    score += 25
  }

  // Family/memory themes
  if (/(family|ancestor|genealogy|heritage|history|story|photos|album)/i.test(content)) {
    score += 15
  }

  // Competitor topics (not unique to us)
  if (/(social media|facebook|instagram|twitter)/i.test(content)) {
    score -= 20
  }

  // Generic topics
  if (/(tips|ideas|ways to|best)/i.test(content) && !/firefly grove/i.test(content)) {
    score -= 5
  }

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
