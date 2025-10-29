export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  author: string
  category: string
  readTime: string
  image?: string
}

export interface BlogVideoSection {
  id: string
  type: 'title' | 'section' | 'content' | 'quote' | 'cta'
  heading?: string
  text: string
  image?: string
  duration: number // seconds
  voiceoverText: string // cleaned for TTS
}

export interface BlogVideoScript {
  title: string
  excerpt: string
  featuredImage?: string
  sections: BlogVideoSection[]
  estimatedDuration: number
  wordCount: number
}

/**
 * Parse a blog post into video-ready sections
 */
export function parseBlogForVideo(post: BlogPost): BlogVideoScript {

  // Extract sections from the markdown content
  const sections = extractSectionsFromMarkdown(post.content, post.image)

  // Add title slide
  const titleSlide: BlogVideoSection = {
    id: 'title',
    type: 'title',
    heading: post.title,
    text: post.excerpt,
    image: post.image,
    duration: 5,
    voiceoverText: `${post.title}. ${post.excerpt}`,
  }

  // Add CTA slide at the end
  const ctaSlide: BlogVideoSection = {
    id: 'cta',
    type: 'cta',
    heading: 'Start Preserving Your Family\'s Memories',
    text: 'Create memorial tributes, sound wave art, and organize your family story beautifully with Firefly Grove.',
    image: post.image,
    duration: 5,
    voiceoverText: 'Start preserving your family\'s memories today with Firefly Grove. Create your first branch in under 2 minutes.',
  }

  const allSections = [titleSlide, ...sections, ctaSlide]

  const estimatedDuration = allSections.reduce((sum, section) => sum + section.duration, 0)
  const wordCount = allSections.reduce((sum, section) => sum + section.voiceoverText.split(/\s+/).length, 0)

  return {
    title: post.title,
    excerpt: post.excerpt,
    featuredImage: post.image,
    sections: allSections,
    estimatedDuration,
    wordCount,
  }
}

/**
 * Extract sections from markdown content
 */
function extractSectionsFromMarkdown(content: string, defaultImage?: string): BlogVideoSection[] {
  const sections: BlogVideoSection[] = []

  // Split by H2 headings (##)
  const parts = content.split(/^## /gm)

  parts.forEach((part, index) => {
    if (!part.trim()) return

    // First part before any H2 might be intro content
    if (index === 0 && !part.startsWith('#')) {
      const cleanText = cleanTextForTTS(part)
      if (cleanText.length > 50) {
        sections.push({
          id: `intro`,
          type: 'content',
          text: summarizeForVideo(part),
          image: defaultImage,
          duration: estimateDuration(cleanText),
          voiceoverText: cleanText,
        })
      }
      return
    }

    // Extract heading and content
    const lines = part.split('\n')
    const heading = lines[0].replace(/^#+ /, '').trim()
    const bodyText = lines.slice(1).join('\n').trim()

    if (!heading) return

    // Clean and summarize content
    const cleanText = cleanTextForTTS(bodyText)
    const summaryText = summarizeForVideo(bodyText)

    // Section header slide
    sections.push({
      id: `section-${index}-header`,
      type: 'section',
      heading: heading,
      text: heading,
      duration: 2,
      voiceoverText: heading,
    })

    // Break long sections into multiple content slides
    const contentChunks = splitIntoChunks(cleanText, 250) // ~250 words per slide

    contentChunks.forEach((chunk, chunkIndex) => {
      const summaryChunk = summarizeForVideo(chunk)

      // Check if this looks like a quote
      const isQuote = chunk.includes('"') && chunk.split('"').length > 2

      sections.push({
        id: `section-${index}-content-${chunkIndex}`,
        type: isQuote ? 'quote' : 'content',
        heading: heading,
        text: summaryChunk,
        image: defaultImage,
        duration: estimateDuration(chunk),
        voiceoverText: chunk,
      })
    })
  })

  return sections
}

/**
 * Clean text for text-to-speech
 */
function cleanTextForTTS(text: string): string {
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove markdown formatting
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/_([^_]+)_/g, '$1') // Underscore italic
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove code blocks
    .replace(/`([^`]+)`/g, '$1')
    // Remove image syntax
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Summarize text for on-screen display (shorter than voiceover)
 */
function summarizeForVideo(text: string): string {
  const clean = cleanTextForTTS(text)

  // Split into sentences
  const sentences = clean.split(/\.\s+/)

  // Take first 3-4 sentences or key points
  const keyPoints: string[] = []

  sentences.forEach(sentence => {
    if (keyPoints.length < 4 && sentence.length > 20) {
      // Simplify and shorten
      let simplified = sentence
        .replace(/^(However|Moreover|Furthermore|Additionally|Nevertheless),?\s+/i, '')
        .trim()

      // Limit to 80 characters per point
      if (simplified.length > 80) {
        simplified = simplified.slice(0, 77) + '...'
      }

      keyPoints.push(simplified)
    }
  })

  return keyPoints.join('\n')
}

/**
 * Split text into chunks of approximately maxWords
 */
function splitIntoChunks(text: string, maxWords: number): string[] {
  const sentences = text.split(/\.\s+/)
  const chunks: string[] = []
  let currentChunk: string[] = []
  let currentWordCount = 0

  sentences.forEach(sentence => {
    const words = sentence.split(/\s+/).length

    if (currentWordCount + words > maxWords && currentChunk.length > 0) {
      chunks.push(currentChunk.join('. ') + '.')
      currentChunk = [sentence]
      currentWordCount = words
    } else {
      currentChunk.push(sentence)
      currentWordCount += words
    }
  })

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('. ') + '.')
  }

  return chunks
}

/**
 * Estimate duration based on word count (average speaking rate: 150 words/min)
 */
function estimateDuration(text: string): number {
  const words = text.split(/\s+/).length
  const minutes = words / 150
  const seconds = Math.ceil(minutes * 60)

  // Add buffer time (10%)
  return Math.max(3, Math.ceil(seconds * 1.1))
}

/**
 * Extract image URLs from markdown content
 */
export function extractImagesFromContent(content: string): string[] {
  const imageRegex = /!\[([^\]]*)\]\(([^\)]+)\)/g
  const images: string[] = []
  let match

  while ((match = imageRegex.exec(content)) !== null) {
    images.push(match[2])
  }

  return images
}

/**
 * Format duration as MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
