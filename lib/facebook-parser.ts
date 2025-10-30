/**
 * Facebook Data Export Parser
 * Parses JSON data from Facebook's "Download Your Information" export
 */

export interface FacebookPhotoData {
  uri: string // File path in the ZIP
  creation_timestamp: number
  title?: string
  description?: string
  media_metadata?: {
    photo_metadata?: {
      taken_timestamp?: number
      upload_ip?: string
      exif_data?: any[]
    }
  }
  place?: {
    name: string
    coordinate?: {
      latitude: number
      longitude: number
    }
  }
  tags?: string[]
}

export interface FacebookPostData {
  timestamp: number
  title?: string
  post?: string
  attachments?: Array<{
    data?: Array<{
      media?: {
        uri: string
        creation_timestamp: number
        title?: string
        description?: string
      }
    }>
  }>
  place?: {
    name: string
    coordinate?: {
      latitude: number
      longitude: number
    }
  }
  tags?: string[]
}

export interface ParsedFacebookData {
  photos: FacebookPhotoData[]
  posts: FacebookPostData[]
  totalItems: number
}

/**
 * Parse Facebook photos JSON file
 */
export function parseFacebookPhotos(data: any): FacebookPhotoData[] {
  if (!data || !Array.isArray(data.photos)) {
    return []
  }

  return data.photos.filter((photo: any) => {
    // Filter out photos without URIs
    return photo && photo.uri
  })
}

/**
 * Parse Facebook posts JSON file
 */
export function parseFacebookPosts(data: any): FacebookPostData[] {
  if (!data || !Array.isArray(data)) {
    return []
  }

  return data.filter((post: any) => {
    // Only include posts with photos/media
    return post && post.attachments && post.attachments.length > 0
  })
}

/**
 * Extract photo URI from post attachment
 */
export function extractPhotoFromPost(post: FacebookPostData): string | null {
  if (!post.attachments || post.attachments.length === 0) {
    return null
  }

  for (const attachment of post.attachments) {
    if (attachment.data && attachment.data.length > 0) {
      for (const item of attachment.data) {
        if (item.media && item.media.uri) {
          return item.media.uri
        }
      }
    }
  }

  return null
}

/**
 * Parse Facebook data export structure
 * Handles both individual JSON files and full ZIP structure
 */
export async function parseFacebookExport(files: { name: string; content: string }[]): Promise<ParsedFacebookData> {
  const photos: FacebookPhotoData[] = []
  const posts: FacebookPostData[] = []

  for (const file of files) {
    try {
      const data = JSON.parse(file.content)

      // Detect file type based on structure
      if (file.name.includes('photos') || (data.photos && Array.isArray(data.photos))) {
        // Photos JSON file
        photos.push(...parseFacebookPhotos(data))
      } else if (file.name.includes('posts') || (Array.isArray(data) && data[0]?.timestamp)) {
        // Posts JSON file
        posts.push(...parseFacebookPosts(data))
      } else if (data.photos) {
        // Top-level photos object
        photos.push(...parseFacebookPhotos(data))
      } else if (Array.isArray(data)) {
        // Array of posts
        posts.push(...parseFacebookPosts(data))
      }
    } catch (error) {
      console.error(`Error parsing file ${file.name}:`, error)
      // Continue with other files
    }
  }

  return {
    photos,
    posts,
    totalItems: photos.length + posts.length,
  }
}

/**
 * Convert Facebook timestamp to Date
 */
export function facebookTimestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000)
}

/**
 * Extract caption/description from photo or post
 */
export function extractCaption(item: FacebookPhotoData | FacebookPostData): string | null {
  if ('description' in item && item.description) {
    return item.description
  }
  if ('post' in item && item.post) {
    return item.post
  }
  if ('title' in item && item.title) {
    return item.title
  }
  return null
}
