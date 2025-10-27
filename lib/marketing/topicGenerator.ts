/**
 * Automated Topic Generation
 * Uses AI to generate and score content topics
 */

import Anthropic from '@anthropic-ai/sdk'
import { scoreTopic } from './topicScorer'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface TopicGenerationConfig {
  count: number // How many topics to generate
  minConfidence: number // Minimum confidence score to keep (0-100)
  focusAreas?: string[] // Optional: specific areas to focus on
}

interface GeneratedTopic {
  topic: string
  primaryKeyword: string
  description: string
  relatedKeywords: string[]
}

interface ScoredTopic extends GeneratedTopic {
  scores: {
    demandScore: number
    competitionScore: number
    relevanceScore: number
    confidenceScore: number
    estimatedUsers: number
    reasoningNotes: string
  }
}

/**
 * Generate and score topics automatically
 * Returns only topics that meet the minimum confidence threshold
 */
export async function generateTopics(
  config: TopicGenerationConfig
): Promise<ScoredTopic[]> {
  console.log(`🎯 Generating ${config.count} topic ideas...`)

  // Step 1: Generate raw topic ideas using AI
  const rawTopics = await generateTopicIdeas(config.count, config.focusAreas)
  console.log(`✅ Generated ${rawTopics.length} raw topics`)

  // Step 2: Score each topic
  const scoredTopics: ScoredTopic[] = []

  for (const topic of rawTopics) {
    try {
      const scores = await scoreTopic({
        topic: topic.topic,
        primaryKeyword: topic.primaryKeyword,
        relatedKeywords: topic.relatedKeywords,
      })

      console.log(
        `📊 "${topic.topic}" | Keyword: "${topic.primaryKeyword}" | Score: ${scores.confidenceScore}% (D:${scores.demandScore} C:${scores.competitionScore} R:${scores.relevanceScore})`
      )

      // Only keep if meets minimum confidence
      if (scores.confidenceScore >= config.minConfidence) {
        scoredTopics.push({ ...topic, scores })
        console.log(`   ✅ PASSED - Added to results`)
      } else {
        console.log(`   ❌ REJECTED - Below ${config.minConfidence}% threshold`)
      }
    } catch (error) {
      console.error(`Error scoring topic "${topic.topic}":`, error)
    }
  }

  // Step 3: Sort by confidence score (highest first)
  scoredTopics.sort((a, b) => b.scores.confidenceScore - a.scores.confidenceScore)

  console.log(
    `🎯 ${scoredTopics.length} topics passed threshold of ${config.minConfidence}%`
  )

  return scoredTopics
}

/**
 * Use Claude to generate topic ideas
 */
async function generateTopicIdeas(
  count: number,
  focusAreas?: string[]
): Promise<GeneratedTopic[]> {
  const focusInstruction = focusAreas?.length
    ? `Focus especially on these areas: ${focusAreas.join(', ')}`
    : ''

  const prompt = `You are a content strategist for Firefly Grove, a memory preservation app that helps families capture and preserve stories, voices, and memories before it's too late.

Our mission: Help families preserve what matters most - grandparents' stories, family memories, audio recordings, photos - before they're lost forever.

Our target audience:
- Adult children (30-60) worried about losing their aging parents' stories
- People who regret not recording their loved ones before they passed
- Families wanting to preserve heritage and memories
- Anyone feeling urgency: "I should record Grandma's stories before it's too late"

Our unique features:
- Sound wave art (turn "I love you" into wall art)
- Memorial tribute videos
- Story Sparks (guided memory prompts)
- Legacy release (deliver memories after death)

Generate ${count} blog post topic ideas that will:
1. Rank well in Google (target real search queries)
2. Connect with our audience's pain points (urgency, regret prevention, family preservation)
3. Lead naturally to Firefly Grove as the solution
4. Focus on actionable, specific topics (not generic)

${focusInstruction}

For each topic, provide:
- Topic title (what the blog post is about)
- Primary keyword (the main search term to target - format as a search query)
- Description (1 sentence about what the post covers)
- Related keywords (2-3 additional search terms)

Return as JSON array with this structure:
[
  {
    "topic": "Recording Your Grandmother's Life Stories",
    "primaryKeyword": "how to record grandparents stories",
    "description": "Step-by-step guide for capturing and preserving elderly family members' memories before it's too late",
    "relatedKeywords": ["recording elderly memories", "preserve grandparent stories", "family history interview questions"]
  }
]

Important:
- Primary keywords should be real search queries (how people actually search)
- Focus on long-tail keywords (3-6 words) for better ranking chances
- Balance urgency with helpfulness (not just fear-mongering)
- Topics should naturally lead to Firefly Grove features
- Avoid generic topics like "10 tips for..." - be specific and emotional

Generate ${count} unique, high-quality topic ideas now:`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in Claude response')
    }

    const topics: GeneratedTopic[] = JSON.parse(jsonMatch[0])
    return topics
  } catch (error) {
    console.error('Error generating topics with Claude:', error)
    throw error
  }
}
