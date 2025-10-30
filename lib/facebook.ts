/**
 * Facebook Graph API Client
 * Handles OAuth and photo/post fetching for Facebook import feature
 */

const FACEBOOK_GRAPH_API = 'https://graph.facebook.com/v21.0'

export interface FacebookConfig {
  appId: string
  appSecret: string
  redirectUri: string
}

export interface FacebookPhoto {
  id: string
  images: Array<{
    source: string
    width: number
    height: number
  }>
  created_time: string
  name?: string // Caption
  place?: {
    name: string
    location?: {
      city?: string
      country?: string
      latitude?: number
      longitude?: number
    }
  }
  from?: {
    id: string
    name: string
  }
  likes?: {
    data: Array<{ id: string; name: string }>
  }
  comments?: {
    data: Array<{
      id: string
      from: { id: string; name: string }
      message: string
      created_time: string
    }>
  }
  tags?: {
    data: Array<{ id: string; name: string }>
  }
}

export interface FacebookAlbum {
  id: string
  name: string
  description?: string
  photo_count: number
  created_time: string
  updated_time: string
  cover_photo?: {
    id: string
  }
}

export interface FacebookPost {
  id: string
  message?: string
  created_time: string
  full_picture?: string
  attachments?: {
    data: Array<{
      type: string
      media?: {
        image?: {
          src: string
        }
      }
      subattachments?: {
        data: Array<{
          media?: {
            image?: {
              src: string
            }
          }
        }>
      }
    }>
  }
  place?: {
    name: string
    location?: any
  }
  comments?: {
    data: Array<{
      id: string
      from: { id: string; name: string }
      message: string
      created_time: string
    }>
  }
  reactions?: {
    data: Array<{
      id: string
      name: string
      type: string
    }>
  }
}

class FacebookAPI {
  private config: FacebookConfig

  constructor(config: FacebookConfig) {
    this.config = config
  }

  /**
   * Check if Facebook API is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.appId &&
      this.config.appSecret &&
      this.config.redirectUri
    )
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      scope: 'public_profile', // Most basic permission only
      response_type: 'code',
      state: state || Math.random().toString(36).substring(7),
    })

    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<{
    access_token: string
    token_type: string
    expires_in?: number
  }> {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      redirect_uri: this.config.redirectUri,
      code,
    })

    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/oauth/access_token?${params.toString()}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to get access token')
    }

    return response.json()
  }

  /**
   * Exchange short-lived token for long-lived token (60 days)
   */
  async getLongLivedToken(shortLivedToken: string): Promise<{
    access_token: string
    token_type: string
    expires_in: number
  }> {
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.config.appId,
      client_secret: this.config.appSecret,
      fb_exchange_token: shortLivedToken,
    })

    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/oauth/access_token?${params.toString()}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to get long-lived token')
    }

    return response.json()
  }

  /**
   * Get user's basic profile info
   */
  async getUserProfile(accessToken: string): Promise<{
    id: string
    name: string
    email?: string
  }> {
    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/me?fields=id,name,email&access_token=${accessToken}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to get user profile')
    }

    return response.json()
  }

  /**
   * Get user's photo albums
   */
  async getUserAlbums(
    accessToken: string,
    options?: { limit?: number; after?: string }
  ): Promise<{
    data: FacebookAlbum[]
    paging?: {
      cursors: { before: string; after: string }
      next?: string
    }
  }> {
    const params = new URLSearchParams({
      fields: 'id,name,description,photo_count,created_time,updated_time,cover_photo',
      access_token: accessToken,
      limit: String(options?.limit || 25),
    })

    if (options?.after) {
      params.append('after', options.after)
    }

    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/me/albums?${params.toString()}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to fetch albums')
    }

    return response.json()
  }

  /**
   * Get photos from a specific album
   */
  async getAlbumPhotos(
    albumId: string,
    accessToken: string,
    options?: { limit?: number; after?: string }
  ): Promise<{
    data: FacebookPhoto[]
    paging?: {
      cursors: { before: string; after: string }
      next?: string
    }
  }> {
    const params = new URLSearchParams({
      fields: 'id,images,created_time,name,place,from,likes.summary(true),comments.summary(true),tags',
      access_token: accessToken,
      limit: String(options?.limit || 50),
    })

    if (options?.after) {
      params.append('after', options.after)
    }

    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/${albumId}/photos?${params.toString()}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to fetch album photos')
    }

    return response.json()
  }

  /**
   * Get user's timeline photos (uploaded photos, not shared)
   */
  async getUserPhotos(
    accessToken: string,
    options?: { limit?: number; after?: string }
  ): Promise<{
    data: FacebookPhoto[]
    paging?: {
      cursors: { before: string; after: string }
      next?: string
    }
  }> {
    const params = new URLSearchParams({
      fields: 'id,images,created_time,name,place,from,likes.summary(true),comments.summary(true),tags',
      type: 'uploaded', // Only photos user uploaded, not shared
      access_token: accessToken,
      limit: String(options?.limit || 50),
    })

    if (options?.after) {
      params.append('after', options.after)
    }

    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/me/photos?${params.toString()}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to fetch user photos')
    }

    return response.json()
  }

  /**
   * Get user's timeline posts with photos
   */
  async getUserPosts(
    accessToken: string,
    options?: { limit?: number; after?: string; since?: string; until?: string }
  ): Promise<{
    data: FacebookPost[]
    paging?: {
      cursors: { before: string; after: string }
      next?: string
    }
  }> {
    const params = new URLSearchParams({
      fields: 'id,message,created_time,full_picture,attachments,place,comments.summary(true),reactions.summary(true)',
      access_token: accessToken,
      limit: String(options?.limit || 25),
    })

    if (options?.after) {
      params.append('after', options.after)
    }
    if (options?.since) {
      params.append('since', options.since)
    }
    if (options?.until) {
      params.append('until', options.until)
    }

    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/me/posts?${params.toString()}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to fetch user posts')
    }

    return response.json()
  }

  /**
   * Get specific photo details
   */
  async getPhoto(
    photoId: string,
    accessToken: string
  ): Promise<FacebookPhoto> {
    const params = new URLSearchParams({
      fields: 'id,images,created_time,name,place,from,likes.summary(true),comments.summary(true),tags',
      access_token: accessToken,
    })

    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/${photoId}?${params.toString()}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to fetch photo')
    }

    return response.json()
  }

  /**
   * Debug/validate an access token
   */
  async debugToken(accessToken: string): Promise<{
    data: {
      app_id: string
      type: string
      is_valid: boolean
      expires_at: number
      scopes: string[]
      user_id: string
    }
  }> {
    const params = new URLSearchParams({
      input_token: accessToken,
      access_token: `${this.config.appId}|${this.config.appSecret}`,
    })

    const response = await fetch(
      `${FACEBOOK_GRAPH_API}/debug_token?${params.toString()}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to debug token')
    }

    return response.json()
  }
}

// Singleton instance
export const facebook = new FacebookAPI({
  appId: process.env.FACEBOOK_APP_ID || '',
  appSecret: process.env.FACEBOOK_APP_SECRET || '',
  redirectUri: process.env.FACEBOOK_REDIRECT_URI || '',
})
