/**
 * Pinterest API Integration Service
 * Handles all Pinterest API interactions for Firefly Grove
 */

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5'

interface PinterestConfig {
  appId: string
  appSecret: string
  accessToken: string
}

interface PinData {
  title: string
  description: string
  link: string
  imageUrl: string
  boardId: string
  altText?: string
}

interface BoardData {
  name: string
  description: string
  privacy: 'PUBLIC' | 'PROTECTED' | 'SECRET'
}

interface PinterestBoard {
  id: string
  name: string
  description: string
  privacy: string
  pin_count: number
  created_at: string
}

interface PinterestPin {
  id: string
  title: string
  description: string
  link: string
  board_id: string
  media: {
    images: {
      '1200x': {
        url: string
        width: number
        height: number
      }
    }
  }
  created_at: string
}

interface PinterestAnalytics {
  all_time: {
    impression: number
    save: number
    pin_click: number
    outbound_click: number
  }
  daily: Array<{
    date: string
    impression: number
    save: number
    pin_click: number
    outbound_click: number
  }>
}

export class PinterestService {
  private config: PinterestConfig

  constructor() {
    this.config = {
      appId: process.env.PINTEREST_APP_ID || '',
      appSecret: process.env.PINTEREST_APP_SECRET || '',
      accessToken: process.env.PINTEREST_ACCESS_TOKEN || '',
    }
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: any
  ): Promise<any> {
    const url = `${PINTEREST_API_BASE}${endpoint}`

    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Pinterest API Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get user's boards
   */
  async getBoards(): Promise<PinterestBoard[]> {
    const data = await this.makeRequest('/boards')
    return data.items || []
  }

  /**
   * Create a new board
   */
  async createBoard(boardData: BoardData): Promise<PinterestBoard> {
    const data = await this.makeRequest('/boards', 'POST', boardData)
    return data
  }

  /**
   * Get a specific board by ID
   */
  async getBoard(boardId: string): Promise<PinterestBoard> {
    const data = await this.makeRequest(`/boards/${boardId}`)
    return data
  }

  /**
   * Update a board
   */
  async updateBoard(boardId: string, updates: Partial<BoardData>): Promise<PinterestBoard> {
    const data = await this.makeRequest(`/boards/${boardId}`, 'PATCH', updates)
    return data
  }

  /**
   * Delete a board
   */
  async deleteBoard(boardId: string): Promise<void> {
    await this.makeRequest(`/boards/${boardId}`, 'DELETE')
  }

  /**
   * Create a pin
   */
  async createPin(pinData: PinData): Promise<PinterestPin> {
    const body = {
      board_id: pinData.boardId,
      title: pinData.title,
      description: pinData.description,
      link: pinData.link,
      media_source: {
        source_type: 'image_url',
        url: pinData.imageUrl,
      },
      alt_text: pinData.altText || pinData.title,
    }

    const data = await this.makeRequest('/pins', 'POST', body)
    return data
  }

  /**
   * Get a specific pin
   */
  async getPin(pinId: string): Promise<PinterestPin> {
    const data = await this.makeRequest(`/pins/${pinId}`)
    return data
  }

  /**
   * Delete a pin
   */
  async deletePin(pinId: string): Promise<void> {
    await this.makeRequest(`/pins/${pinId}`, 'DELETE')
  }

  /**
   * Get pins from a board
   */
  async getBoardPins(boardId: string, pageSize: number = 25): Promise<PinterestPin[]> {
    const data = await this.makeRequest(`/boards/${boardId}/pins?page_size=${pageSize}`)
    return data.items || []
  }

  /**
   * Get user profile info
   */
  async getUserProfile(): Promise<any> {
    const data = await this.makeRequest('/user_account')
    return data
  }

  /**
   * Get analytics for a pin
   */
  async getPinAnalytics(pinId: string, startDate: string, endDate: string): Promise<PinterestAnalytics> {
    const data = await this.makeRequest(
      `/pins/${pinId}/analytics?start_date=${startDate}&end_date=${endDate}&metric_types=IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK`
    )
    return data
  }

  /**
   * Get analytics for user account
   */
  async getUserAnalytics(startDate: string, endDate: string): Promise<any> {
    const data = await this.makeRequest(
      `/user_account/analytics?start_date=${startDate}&end_date=${endDate}&metric_types=IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK`
    )
    return data
  }

  /**
   * Search for boards by name
   */
  async searchBoards(query: string): Promise<PinterestBoard[]> {
    const boards = await this.getBoards()
    return boards.filter(board =>
      board.name.toLowerCase().includes(query.toLowerCase()) ||
      board.description?.toLowerCase().includes(query.toLowerCase())
    )
  }

  /**
   * Helper: Find or create a board by name
   */
  async findOrCreateBoard(name: string, description: string, privacy: BoardData['privacy'] = 'PUBLIC'): Promise<PinterestBoard> {
    // Try to find existing board
    const boards = await this.searchBoards(name)
    const existingBoard = boards.find(b => b.name.toLowerCase() === name.toLowerCase())

    if (existingBoard) {
      return existingBoard
    }

    // Create new board
    return this.createBoard({ name, description, privacy })
  }

  /**
   * Helper: Check if service is configured
   */
  isConfigured(): boolean {
    return !!(this.config.accessToken && this.config.appId && this.config.appSecret)
  }
}

// Export singleton instance
export const pinterest = new PinterestService()

/**
 * Helper function to generate Pinterest-optimized image URLs
 */
export function getPinterestImageUrl(width: number = 1000, height: number = 1500): string {
  // Pinterest recommends 2:3 aspect ratio (1000x1500 is ideal)
  return `https://via.placeholder.com/${width}x${height}/FFD700/1a1a1a?text=Firefly+Grove`
}

/**
 * Helper function to format dates for Pinterest API
 */
export function formatPinterestDate(date: Date): string {
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}

/**
 * Helper function to get date range for analytics
 */
export function getAnalyticsDateRange(days: number = 30): { startDate: string; endDate: string } {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return {
    startDate: formatPinterestDate(startDate),
    endDate: formatPinterestDate(endDate),
  }
}
