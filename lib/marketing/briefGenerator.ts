/**
 * Content Brief Generator
 * Creates detailed briefs for writing high-converting content
 */

import { prisma } from '@/lib/prisma'

interface BriefInput {
  topicScoreId: string
  includeCompetitorAnalysis?: boolean
}

interface ContentBriefData {
  title: string
  targetKeywords: string[]
  suggestedLength: number
  outlinePoints: string[]
  suggestedH2s: string[]
  ctaRecommendation: string
  toneNotes: string
  topCompetitors?: { url: string; analysis: string }[]
  contentGaps?: string
}

/**
 * Generate a comprehensive content brief from a scored topic
 */
export async function generateContentBrief(
  input: BriefInput
): Promise<ContentBriefData> {
  // Get the topic score
  const topicScore = await prisma.topicScore.findUnique({
    where: { id: input.topicScoreId },
  })

  if (!topicScore) {
    throw new Error('Topic score not found')
  }

  // Get learned patterns from successful posts
  const patterns = await getLearnedPatterns()

  // Generate brief components
  const title = generateTitle(topicScore.topic, topicScore.primaryKeyword)
  const targetKeywords = [
    topicScore.primaryKeyword,
    ...topicScore.relatedKeywords,
  ]
  const suggestedLength = calculateOptimalLength(topicScore.primaryKeyword)
  const outlinePoints = generateOutline(topicScore.topic, topicScore.primaryKeyword)
  const suggestedH2s = generateH2Headings(
    topicScore.topic,
    topicScore.primaryKeyword,
    outlinePoints
  )
  const ctaRecommendation = generateCTA(patterns)
  const toneNotes = generateToneNotes(topicScore.topic)

  return {
    title,
    targetKeywords,
    suggestedLength,
    outlinePoints,
    suggestedH2s,
    ctaRecommendation,
    toneNotes,
  }
}

/**
 * Get learned patterns from database
 */
async function getLearnedPatterns() {
  const patterns = await prisma.contentPattern.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
    take: 10,
  })

  return patterns
}

/**
 * Generate an SEO-optimized title
 */
function generateTitle(topic: string, primaryKeyword: string): string {
  // Check if keyword is already a question
  if (/^(how|what|why|when|where|can|should|will)/i.test(primaryKeyword)) {
    return capitalizeTitle(primaryKeyword)
  }

  // Generate question-based title (performs well for SEO)
  const templates = [
    `How to ${primaryKeyword}`,
    `${capitalizeTitle(primaryKeyword)}: A Complete Guide`,
    `The Ultimate Guide to ${capitalizeTitle(primaryKeyword)}`,
    `${capitalizeTitle(primaryKeyword)} Before It's Too Late`,
  ]

  // Choose template based on keyword characteristics
  if (/preserve|save|capture|record/i.test(primaryKeyword)) {
    return templates[3] // Urgency template
  } else if (/guide|how to|tips/i.test(primaryKeyword)) {
    return templates[2] // Complete guide
  } else if (/^[a-z\s]+ing\s/i.test(primaryKeyword)) {
    return `How to ${capitalizeTitle(primaryKeyword)}: Step-by-Step Guide`
  }

  return templates[0] // Default "how to"
}

/**
 * Calculate optimal word count based on keyword
 */
function calculateOptimalLength(primaryKeyword: string): number {
  // Longer form content generally ranks better
  // But balance with topic complexity

  const wordCount = primaryKeyword.split(' ').length

  if (wordCount >= 5) return 1500 // Specific long-tail: detailed guide
  if (wordCount === 4) return 1800 // Medium specificity
  if (wordCount === 3) return 2200 // Broader topic needs more depth
  return 2500 // Very broad: comprehensive coverage needed
}

/**
 * Generate content outline
 */
function generateOutline(topic: string, primaryKeyword: string): string[] {
  const outline: string[] = []

  // Introduction (always first)
  outline.push(
    'Introduction: Connect with reader\'s pain point - time is running out, memories fade, family stories disappear'
  )

  // Problem section
  outline.push(
    'The Problem: Explain why this matters RIGHT NOW (urgency, emotional weight, regret prevention)'
  )

  // Solution overview
  outline.push(
    `The Solution: How ${primaryKeyword} solves this problem`
  )

  // Step-by-step or detailed breakdown
  if (/how to|how do i/i.test(primaryKeyword)) {
    outline.push('Step-by-Step Process: Break down into actionable steps (5-7 steps ideal)')
  } else {
    outline.push('Deep Dive: Detailed exploration of key aspects')
  }

  // Tools/resources
  outline.push(
    'Tools & Resources: What you need to get started (mention Firefly Grove naturally)'
  )

  // Common mistakes/tips
  outline.push(
    'Common Mistakes to Avoid: Learn from others, reduce friction'
  )

  // Examples/stories
  outline.push(
    'Real Examples: Success stories, before/after scenarios (build trust)'
  )

  // CTA section
  outline.push(
    'Take Action Today: Clear next steps, Firefly Grove as the solution'
  )

  return outline
}

/**
 * Generate H2 headings based on outline
 */
function generateH2Headings(
  topic: string,
  primaryKeyword: string,
  outlinePoints: string[]
): string[] {
  // Convert outline into specific H2s
  const h2s: string[] = []

  if (/how to/i.test(primaryKeyword)) {
    h2s.push(`Why ${capitalizeTitle(primaryKeyword)} Matters`)
    h2s.push(`When to Start ${capitalizeTitle(primaryKeyword)}`)
    h2s.push(`Step-by-Step: ${capitalizeTitle(primaryKeyword)}`)
    h2s.push(`Tools You'll Need`)
    h2s.push(`Common Mistakes When ${capitalizeTitle(primaryKeyword)}`)
    h2s.push(`Real-Life Success Stories`)
    h2s.push(`Start Preserving Memories Today`)
  } else {
    h2s.push(`Understanding ${capitalizeTitle(primaryKeyword)}`)
    h2s.push(`Why This Matters for Your Family`)
    h2s.push(`The Best Way to ${capitalizeTitle(primaryKeyword)}`)
    h2s.push(`What You'll Need to Get Started`)
    h2s.push(`Avoiding Common Pitfalls`)
    h2s.push(`How Firefly Grove Makes This Easy`)
    h2s.push(`Take the First Step`)
  }

  return h2s
}

/**
 * Generate CTA recommendation based on patterns
 */
function generateCTA(patterns: any[]): string {
  // Default high-converting CTAs for Firefly Grove
  const defaultCTAs = [
    'Start preserving your family\'s memories today with Firefly Grove. Create your first branch in under 2 minutes.',
    'Don\'t wait until it\'s too late. Sign up for Firefly Grove and start capturing the stories that matter most.',
    'Your family\'s stories deserve to be preserved. Try Firefly Grove free for 14 days.',
  ]

  // Check if we have learned patterns
  const ctaPattern = patterns.find((p) => p.patternType === 'cta')
  if (ctaPattern && ctaPattern.avgConversionRate > 3.0) {
    const definition = JSON.parse(ctaPattern.definition)
    return definition.text || defaultCTAs[0]
  }

  return defaultCTAs[0]
}

/**
 * Generate tone and voice notes
 */
function generateToneNotes(topic: string): string {
  const notes: string[] = []

  notes.push('**Voice**: Warm, empathetic, but urgent. We care deeply, and time matters.')

  notes.push(
    '**Emotion**: Balance nostalgia with urgency. Make them FEEL the weight of losing memories, then offer hope/solution.'
  )

  notes.push(
    '**Perspective**: Second person ("you") - make it personal. Address the reader directly.'
  )

  notes.push(
    '**Storytelling**: Use specific examples (grandmother\'s voice, father\'s stories). Make it visceral and real.'
  )

  notes.push(
    '**CTA Integration**: Don\'t sell hard - present Firefly Grove as the natural, obvious solution to their problem.'
  )

  notes.push(
    '**Pain Points**: Tap into regret prevention - "before it\'s too late," "questions never asked," "voices fading"'
  )

  return notes.join('\n\n')
}

/**
 * Capitalize title properly
 */
function capitalizeTitle(text: string): string {
  return text
    .split(' ')
    .map((word) => {
      // Don't capitalize small words unless they're first
      const small = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'to', 'of', 'in', 'on', 'at']
      if (small.includes(word.toLowerCase())) return word.toLowerCase()
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
    .replace(/^[a-z]/, (char) => char.toUpperCase()) // Always capitalize first word
}
