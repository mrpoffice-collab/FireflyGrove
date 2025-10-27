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
  image: string // Unsplash image URL
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

  // Generate image URL from Unsplash based on topic keywords
  const image = generateUnsplashImage(brief.targetKeywords)

  return {
    title: content.title,
    content: content.content,
    excerpt,
    metaDescription,
    slug,
    image,
  }
}

/**
 * Generate Unsplash image URL based on keywords
 * Maps keywords to curated high-quality Unsplash images
 */
function generateUnsplashImage(keywords: string[]): string {
  // Keyword to Unsplash photo ID mapping (curated for memory preservation topics)
  const keywordImageMap: Record<string, string> = {
    // Family & Photos
    'family': 'photo-1511895426328-dc8714191300', // Family gathering
    'photos': 'photo-1551269901-5c5e14c25df7', // Photo albums
    'memories': 'photo-1516733725897-1aa73b87c8e8', // Old photos
    'album': 'photo-1551269901-5c5e14c25df7', // Photo albums
    'scrapbook': 'photo-1452421822248-d4c2b47f0c81', // Scrapbooking

    // Digital & Technology
    'digital': 'photo-1488590528505-98d2b5aba04b', // Technology
    'cloud': 'photo-1544197150-b99a580bb7a8', // Cloud storage
    'backup': 'photo-1544197150-b99a580bb7a8', // Backup
    'storage': 'photo-1597852074816-d933c7d2b988', // Storage
    'scan': 'photo-1588600878108-578307a3cc9d', // Scanning

    // Heritage & Legacy
    'legacy': 'photo-1532187863486-abf9dbad1b69', // Generations
    'heritage': 'photo-1581579186913-45ac3e6efe93', // Old documents
    'ancestry': 'photo-1532187863486-abf9dbad1b69', // Family tree
    'genealogy': 'photo-1532187863486-abf9dbad1b69', // Genealogy
    'generations': 'photo-1532187863486-abf9dbad1b69', // Multi-generation

    // Video & Audio
    'video': 'photo-1574717024653-61fd2cf4d44d', // Video recording
    'audio': 'photo-1598488035139-bdbb2231ce04', // Recording
    'recording': 'photo-1598488035139-bdbb2231ce04', // Audio recording
    'voice': 'photo-1589903308904-1010c2294adc', // Microphone

    // Documents & Letters
    'documents': 'photo-1586281380349-632531db7ed4', // Documents
    'letters': 'photo-1455390582262-044cdead277a', // Handwritten letters
    'handwritten': 'photo-1455390582262-044cdead277a', // Handwriting
    'diary': 'photo-1517842645767-c639042777db', // Journal/diary

    // Organization & Preservation
    'organize': 'photo-1544816155-12df9643f363', // Organization
    'preserve': 'photo-1551269901-5c5e14c25df7', // Preservation
    'archive': 'photo-1507003211169-0a1dd7228f2d', // Archive
    'collection': 'photo-1551269901-5c5e14c25df7', // Collection
  }

  // Pool of general memory preservation images for fallback
  const fallbackImages = [
    'photo-1551269901-5c5e14c25df7', // Photo albums
    'photo-1511895426328-dc8714191300', // Family gathering
    'photo-1516733725897-1aa73b87c8e8', // Old photos
    'photo-1532187863486-abf9dbad1b69', // Generations
    'photo-1452421822248-d4c2b47f0c81', // Vintage photos
  ]

  // Try to find matching keyword
  let photoId: string | null = null

  for (const keyword of keywords) {
    const normalized = keyword.toLowerCase().trim()

    // Check direct match
    if (keywordImageMap[normalized]) {
      photoId = keywordImageMap[normalized]
      break
    }

    // Check partial matches
    for (const [key, value] of Object.entries(keywordImageMap)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        photoId = value
        break
      }
    }

    if (photoId) break
  }

  // If no match found, use hash of first keyword to consistently pick from fallback pool
  if (!photoId) {
    const keyword = keywords[0] || 'memory'
    const hash = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const index = hash % fallbackImages.length
    photoId = fallbackImages[index]
  }

  return `https://images.unsplash.com/${photoId}?w=1200&h=630&fit=crop`
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

1. **Third Person Perspective**: Write entirely in 3rd person (they/their/people/families) - NEVER use "you/your"
2. **Hook**: Start with an emotional story or scenario that makes them feel the urgency
3. **Emotional Connection**: Tap into regret prevention, "before it's too late," time running out
4. **Specific Examples**: Use vivid details (grandmother's voice, father's stories, specific memories)
5. **SEO Optimization**:
   - Use target keywords naturally throughout
   - Include primary keyword in title, first paragraph, and H2s where natural
   - Use semantic variations
6. **Firefly Grove Integration**:
   - Mention features naturally where relevant (sound wave art, Story Sparks, memorial videos)
   - Don't hard sell - present as the obvious solution
   - Link features to pain points
7. **Actionable**: Give real, practical steps families can take today
8. **Conversational**: Write like an empathetic observer, not a textbook
9. **Formatting**: Use short paragraphs, bullet points, bold for emphasis

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
      model: 'claude-sonnet-4-20250514',
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
    model: 'claude-sonnet-4-20250514',
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
