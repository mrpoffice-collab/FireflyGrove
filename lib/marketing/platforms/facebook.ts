/**
 * Facebook Auto-Poster
 * Automatically publishes posts to Facebook Page using Graph API
 */

interface FacebookPost {
  message: string
  link?: string
}

interface FacebookResponse {
  success: boolean
  postId?: string
  error?: string
}

/**
 * Post to Facebook Page
 * Requires: FACEBOOK_PAGE_ACCESS_TOKEN in .env
 */
export async function publishToFacebook(post: FacebookPost): Promise<FacebookResponse> {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  const pageId = process.env.FACEBOOK_PAGE_ID

  if (!pageAccessToken || !pageId) {
    console.error('❌ Facebook credentials not configured')
    return {
      success: false,
      error: 'Facebook credentials not configured. Add FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID to .env',
    }
  }

  try {
    // Post to Facebook Graph API
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: post.message,
          link: post.link,
          access_token: pageAccessToken,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Facebook API error:', error)
      return {
        success: false,
        error: error.error?.message || 'Failed to post to Facebook',
      }
    }

    const data = await response.json()
    console.log(`✅ Posted to Facebook: ${data.id}`)

    return {
      success: true,
      postId: data.id,
    }
  } catch (error) {
    console.error('❌ Error posting to Facebook:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get long-lived page access token (user must run this once)
 * This is a helper - not used in production
 */
export async function exchangeTokenForLongLived(shortToken: string): Promise<string> {
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET

  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`
  )

  const data = await response.json()
  return data.access_token
}
