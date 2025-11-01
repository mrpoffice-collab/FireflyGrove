/**
 * Image Selector Service
 * Intelligently matches marketing content to appropriate images
 * from the screenshot repository or falls back to external sources
 */

import fs from 'fs'
import path from 'path'

interface ImageMetadata {
  filename: string
  url: string
  title: string
  description: string
  tags: string[]
  platform: string[]
  topics: string[]
  aspectRatio: string
  pinterestOptimized: boolean
  uploadedAt: string
}

interface ImageRepository {
  images: ImageMetadata[]
  metadata: {
    version: string
    lastUpdated: string
    totalImages: number
    platforms: string[]
  }
}

/**
 * Load image metadata from repository
 */
function loadImageRepository(): ImageRepository {
  try {
    const metadataPath = path.join(process.cwd(), 'public/marketing/screenshots/metadata.json')
    const data = fs.readFileSync(metadataPath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.warn('Could not load image repository:', error)
    return {
      images: [],
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalImages: 0,
        platforms: [],
      },
    }
  }
}

/**
 * Calculate relevance score between content and image
 */
function calculateRelevanceScore(
  image: ImageMetadata,
  keywords: string[],
  topic: string | null,
  platform: string
): number {
  let score = 0

  // Platform match (high priority)
  if (image.platform.includes(platform)) {
    score += 30
  }

  // Pinterest optimization bonus for Pinterest platform
  if (platform === 'pinterest' && image.pinterestOptimized) {
    score += 20
  }

  // Topic match (high priority)
  if (topic) {
    const topicLower = topic.toLowerCase()
    const matchingTopics = image.topics.filter((t) =>
      t.toLowerCase().includes(topicLower) || topicLower.includes(t.toLowerCase())
    )
    score += matchingTopics.length * 15
  }

  // Keyword matches in tags
  const keywordsLower = keywords.map((k) => k.toLowerCase())
  const matchingTags = image.tags.filter((tag) =>
    keywordsLower.some((kw) => tag.toLowerCase().includes(kw) || kw.includes(tag.toLowerCase()))
  )
  score += matchingTags.length * 10

  // Keyword matches in title/description
  const titleDescLower = `${image.title} ${image.description}`.toLowerCase()
  const titleDescMatches = keywordsLower.filter((kw) => titleDescLower.includes(kw))
  score += titleDescMatches.length * 8

  // Keyword matches in topics
  const topicsLower = image.topics.join(' ').toLowerCase()
  const topicMatches = keywordsLower.filter((kw) => topicsLower.includes(kw))
  score += topicMatches.length * 12

  return score
}

/**
 * Select best image for content
 */
export function selectImageForContent(params: {
  keywords: string[]
  topic: string | null
  platform: string
  title: string
  content: string
}): string | null {
  const { keywords, topic, platform } = params

  // Load repository
  const repository = loadImageRepository()

  if (repository.images.length === 0) {
    console.warn('No images in repository, falling back to external source')
    return null
  }

  // Filter images by platform
  const platformImages = repository.images.filter((img) => img.platform.includes(platform))

  if (platformImages.length === 0) {
    console.warn(`No images found for platform: ${platform}`)
    return null
  }

  // Score and rank images
  const scoredImages = platformImages.map((image) => ({
    image,
    score: calculateRelevanceScore(image, keywords, topic, platform),
  }))

  // Sort by score (highest first)
  scoredImages.sort((a, b) => b.score - a.score)

  // Return best match if score is above threshold
  const bestMatch = scoredImages[0]
  if (bestMatch.score >= 20) {
    console.log(`✅ Selected image: ${bestMatch.image.filename} (score: ${bestMatch.score})`)
    return bestMatch.image.url
  }

  console.warn(`No good image match found (best score: ${bestMatch.score})`)
  return null
}

/**
 * Get fallback image from Unsplash
 */
export function getFallbackImage(keywords: string[]): string {
  // Use first keyword or default
  const query = keywords[0] || 'family memories'
  const encodedQuery = encodeURIComponent(query)

  // Unsplash Source API for random image
  return `https://source.unsplash.com/1000x1500/?${encodedQuery},legacy,family`
}

/**
 * Get platform-specific image dimensions
 */
export function getPlatformImageDimensions(platform: string): { width: number; height: number } {
  switch (platform) {
    case 'pinterest':
      return { width: 1000, height: 1500 } // 2:3 vertical
    case 'facebook':
      return { width: 1200, height: 630 } // 1.91:1 landscape
    case 'instagram':
      return { width: 1080, height: 1080 } // 1:1 square
    case 'twitter':
      return { width: 1200, height: 675 } // 16:9 landscape
    default:
      return { width: 1200, height: 630 }
  }
}

/**
 * Get best image for marketing post (main function)
 */
export function getBestImageForPost(params: {
  keywords: string[]
  topic: string | null
  platform: string
  title: string
  content: string
}): string {
  // Try repository first
  const repositoryImage = selectImageForContent(params)
  if (repositoryImage) {
    return repositoryImage
  }

  // Fall back to Unsplash
  console.log('⚠️ Using Unsplash fallback image')
  return getFallbackImage(params.keywords)
}

/**
 * Add new image to repository (helper for future use)
 */
export function addImageToRepository(image: Omit<ImageMetadata, 'uploadedAt'>): boolean {
  try {
    const metadataPath = path.join(process.cwd(), 'public/marketing/screenshots/metadata.json')
    const repository = loadImageRepository()

    // Add upload timestamp
    const newImage: ImageMetadata = {
      ...image,
      uploadedAt: new Date().toISOString().split('T')[0],
    }

    // Check for duplicates
    const exists = repository.images.some((img) => img.filename === newImage.filename)
    if (exists) {
      console.warn(`Image already exists: ${newImage.filename}`)
      return false
    }

    // Add to repository
    repository.images.push(newImage)
    repository.metadata.totalImages = repository.images.length
    repository.metadata.lastUpdated = new Date().toISOString().split('T')[0]

    // Save
    fs.writeFileSync(metadataPath, JSON.stringify(repository, null, 2))
    console.log(`✅ Added image to repository: ${newImage.filename}`)
    return true
  } catch (error) {
    console.error('Failed to add image to repository:', error)
    return false
  }
}

/**
 * Get repository stats
 */
export function getRepositoryStats() {
  const repository = loadImageRepository()
  return {
    totalImages: repository.metadata.totalImages,
    platforms: repository.metadata.platforms,
    lastUpdated: repository.metadata.lastUpdated,
    imagesByPlatform: repository.metadata.platforms.map((platform) => ({
      platform,
      count: repository.images.filter((img) => img.platform.includes(platform)).length,
    })),
    pinterestOptimized: repository.images.filter((img) => img.pinterestOptimized).length,
  }
}
