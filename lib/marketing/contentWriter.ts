/**
 * AI Content Writer
 * Uses Claude to write full blog posts from content briefs
 */

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ContentBriefData {
  title: string
  targetKeywords: string[]
  suggestedLength: number
  outlinePoints: string
  suggestedH2s: string[]
  ctaRecommendation: string
  toneNotes: string
  topic: string
  primaryKeyword: string
}

interface GeneratedContent {
  title: string
  content: string // Full markdown content
  excerpt: string // SEO excerpt
  metaDescription: string
  slug: string
}

/**
 * Write a full blog post from a content brief
 */
export async function writeContentFromBrief(
  briefId: string
): Promise<GeneratedContent> {
  // Get the brief
  const brief = await prisma.contentBrief.findUnique({
    where: { id: briefId },
    include: {
      topicScore: true,
    },
  })

  if (!brief) {
    throw new Error('Brief not found')
  }

  const topicScore = await prisma.topicScore.findUnique({
    where: { id: brief.topicScoreId },
  })

  if (!topicScore) {
    throw new Error('Topic score not found')
  }

  // Load brand voice and compass
  const brandVoice = await loadBrandVoice()
  const compass = await loadCompass()

  // Generate content using Claude
  const content = await generateBlogPost({
    title: brief.title,
    targetKeywords: brief.targetKeywords,
    suggestedLength: brief.suggestedLength,
    outlinePoints: brief.outlinePoints,
    suggestedH2s: brief.suggestedH2s,
    ctaRecommendation: brief.ctaRecommendation || '',
    toneNotes: brief.toneNotes || '',
    topic: topicScore.topic,
    primaryKeyword: topicScore.primaryKeyword,
  }, brandVoice, compass)

  // Generate slug
  const slug = generateSlug(brief.title)

  // Generate excerpt
  const excerpt = content.content.substring(0, 200) + '...'

  // Generate meta description
  const metaDescription = await generateMetaDescription(brief.title, topicScore.primaryKeyword)

  return {
    title: content.title,
    content: content.content,
    excerpt,
    metaDescription,
    slug,
  }
}

/**
 * Generate blog post using Claude
 */
async function generateBlogPost(
  brief: ContentBriefData,
  brandVoice: string,
  compass: string
): Promise<{ title: string; content: string }> {
  const outline = JSON.parse(brief.outlinePoints)

  const prompt = `You are a content writer for Firefly Grove, writing a blog post that will help families preserve their memories before it's too late.

# BRAND VOICE & MISSION
${brandVoice}

# OUR COMPASS (Why We Exist)
${compass}

# YOUR TASK
Write a complete, SEO-optimized blog post with the following specifications:

**Topic**: ${brief.topic}
**Title**: ${brief.title}
**Primary Keyword**: ${brief.primaryKeyword}
**Target Length**: ~${brief.suggestedLength} words
**Target Keywords**: ${brief.targetKeywords.join(', ')}

# STRUCTURE
Use these H2 headings (in this order):
${brief.suggestedH2s.map((h2, i) => `${i + 1}. ${h2}`).join('\n')}

# OUTLINE TO COVER
${outline.map((point: string, i: number) => `${i + 1}. ${point}`).join('\n')}

# TONE GUIDELINES
${brief.toneNotes}

# CTA
End with this CTA (integrate naturally):
${brief.ctaRecommendation}

# WRITING REQUIREMENTS

1. **Hook**: Start with an emotional story or scenario that makes them feel the urgency
2. **Emotional Connection**: Tap into regret prevention, "before it's too late," time running out
3. **Specific Examples**: Use vivid details (grandmother's voice, father's stories, specific memories)
4. **SEO Optimization**:
   - Use target keywords naturally throughout
   - Include primary keyword in title, first paragraph, and H2s where natural
   - Use semantic variations
5. **Firefly Grove Integration**:
   - Mention features naturally where relevant (sound wave art, Story Sparks, memorial videos)
   - Don't hard sell - present as the obvious solution
   - Link features to pain points
6. **Actionable**: Give real, practical steps they can take today
7. **Conversational**: Write like talking to a friend, not a textbook
8. **Formatting**: Use short paragraphs, bullet points, bold for emphasis

# MARKDOWN FORMAT
Return the post in clean markdown format with:
- H1 title (# Title)
- H2 sections (## Heading)
- Bold for emphasis (**text**)
- Bullet lists where appropriate
- No front matter, just the content

Write the complete blog post now:`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 8000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    return {
      title: brief.title,
      content: content.trim(),
    }
  } catch (error) {
    console.error('Error generating blog post:', error)
    throw error
  }
}

/**
 * Generate SEO meta description
 */
async function generateMetaDescription(title: string, keyword: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: `Write a compelling 150-character SEO meta description for this blog post:

Title: ${title}
Primary Keyword: ${keyword}

The description should:
- Be under 155 characters
- Include the primary keyword naturally
- Create urgency or curiosity
- Be action-oriented

Just return the meta description, nothing else.`,
      },
    ],
  })

  return message.content[0].type === 'text' ? message.content[0].text.trim() : ''
}

/**
 * Load brand voice from BRAND.md
 */
async function loadBrandVoice(): Promise<string> {
  try {
    const brandPath = path.join(process.cwd(), 'BRAND.md')
    return fs.readFileSync(brandPath, 'utf-8')
  } catch (error) {
    console.warn('Could not load BRAND.md, using default voice')
    return 'Warm, empathetic, urgent. We help families preserve memories before it\'s too late.'
  }
}

/**
 * Load compass from COMPASS.md
 */
async function loadCompass(): Promise<string> {
  try {
    const compassPath = path.join(process.cwd(), 'COMPASS.md')
    return fs.readFileSync(compassPath, 'utf-8')
  } catch (error) {
    console.warn('Could not load COMPASS.md')
    return 'We preserve family memories and stories before they\'re lost forever.'
  }
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
