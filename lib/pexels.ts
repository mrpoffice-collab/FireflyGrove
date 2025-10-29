/**
 * Pexels API Integration
 * Docs: https://www.pexels.com/api/documentation/
 */

export interface PexelsPhoto {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  avg_color: string
  src: {
    original: string
    large2x: string
    large: string
    medium: string
    small: string
    portrait: string
    landscape: string
    tiny: string
  }
  alt: string
}

export interface PexelsVideo {
  id: number
  width: number
  height: number
  duration: number
  url: string
  user: {
    id: number
    name: string
    url: string
  }
  video_files: Array<{
    id: number
    quality: string
    file_type: string
    width: number
    height: number
    link: string
  }>
  video_pictures: Array<{
    id: number
    picture: string
    nr: number
  }>
}

export interface PexelsSearchResponse<T> {
  total_results: number
  page: number
  per_page: number
  photos?: T[]
  videos?: T[]
  next_page?: string
}

/**
 * Search for photos on Pexels
 */
export async function searchPhotos(
  query: string,
  page: number = 1,
  perPage: number = 15
): Promise<PexelsSearchResponse<PexelsPhoto>> {
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not configured')
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query
  )}&page=${page}&per_page=${perPage}`

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Search for videos on Pexels
 */
export async function searchVideos(
  query: string,
  page: number = 1,
  perPage: number = 15
): Promise<PexelsSearchResponse<PexelsVideo>> {
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not configured')
  }

  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(
    query
  )}&page=${page}&per_page=${perPage}`

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get curated (popular) photos
 */
export async function getCuratedPhotos(
  page: number = 1,
  perPage: number = 15
): Promise<PexelsSearchResponse<PexelsPhoto>> {
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not configured')
  }

  const url = `https://api.pexels.com/v1/curated?page=${page}&per_page=${perPage}`

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get a specific photo by ID
 */
export async function getPhoto(id: number): Promise<PexelsPhoto> {
  const apiKey = process.env.PEXELS_API_KEY

  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not configured')
  }

  const url = `https://api.pexels.com/v1/photos/${id}`

  const response = await fetch(url, {
    headers: {
      Authorization: apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Generate smart search queries based on content
 * This helps get better Pexels results for video sections
 */
export function generateSearchQuery(
  heading: string,
  content?: string
): string {
  // Extract key nouns and concepts
  const text = heading + (content ? ' ' + content : '')

  // Remove common words and focus on key terms
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during']

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))

  // Take first 2-3 most meaningful words
  const keyWords = words.slice(0, 3)

  return keyWords.join(' ') || heading
}
