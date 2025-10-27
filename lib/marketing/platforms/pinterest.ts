/**
 * Pinterest Auto-Poster
 * Automatically publishes pins to Pinterest using Pinterest API
 */

interface PinterestPin {
  title: string
  description: string
  link: string
  imageUrl?: string // Optional: URL to image for the pin
}

interface PinterestResponse {
  success: boolean
  pinId?: string
  error?: string
}

/**
 * Create a Pin on Pinterest
 * Requires: PINTEREST_ACCESS_TOKEN and PINTEREST_BOARD_ID in .env
 */
export async function publishToPinterest(pin: PinterestPin): Promise<PinterestResponse> {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN
  const boardId = process.env.PINTEREST_BOARD_ID

  if (!accessToken || !boardId) {
    console.error('❌ Pinterest credentials not configured')
    return {
      success: false,
      error: 'Pinterest credentials not configured. Add PINTEREST_ACCESS_TOKEN and PINTEREST_BOARD_ID to .env',
    }
  }

  try {
    // Create pin using Pinterest API v5
    const response = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board_id: boardId,
        title: pin.title,
        description: pin.description,
        link: pin.link,
        ...(pin.imageUrl && {
          media_source: {
            source_type: 'image_url',
            url: pin.imageUrl,
          },
        }),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Pinterest API error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create pin',
      }
    }

    const data = await response.json()
    console.log(`✅ Created Pinterest pin: ${data.id}`)

    return {
      success: true,
      pinId: data.id,
    }
  } catch (error) {
    console.error('❌ Error posting to Pinterest:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get Pinterest boards (helper to find board ID)
 */
export async function getPinterestBoards(): Promise<any[]> {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error('PINTEREST_ACCESS_TOKEN not configured')
  }

  const response = await fetch('https://api.pinterest.com/v5/boards', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()
  return data.items || []
}
