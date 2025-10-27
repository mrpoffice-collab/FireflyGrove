/**
 * Reddit Auto-Poster
 * Automatically submits posts to Reddit subreddits
 */

interface RedditPost {
  subreddit: string // Without 'r/' prefix
  title: string
  body: string // Self-post text
  url?: string // Optional: link post instead of self-post
}

interface RedditResponse {
  success: boolean
  postUrl?: string
  error?: string
}

/**
 * Submit a post to Reddit
 * Requires: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD in .env
 */
export async function publishToReddit(post: RedditPost): Promise<RedditResponse> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  const username = process.env.REDDIT_USERNAME
  const password = process.env.REDDIT_PASSWORD

  if (!clientId || !clientSecret || !username || !password) {
    console.error('❌ Reddit credentials not configured')
    return {
      success: false,
      error: 'Reddit credentials not configured. Add REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD to .env',
    }
  }

  try {
    // Step 1: Get access token
    const accessToken = await getRedditAccessToken(clientId, clientSecret, username, password)

    if (!accessToken) {
      return {
        success: false,
        error: 'Failed to authenticate with Reddit',
      }
    }

    // Step 2: Submit post
    const kind = post.url ? 'link' : 'self'
    const formData = new URLSearchParams({
      sr: post.subreddit,
      kind: kind,
      title: post.title,
      ...(kind === 'self' ? { text: post.body } : { url: post.url! }),
    })

    const response = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'FireflyGrove/1.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    const data = await response.json()

    if (data.json?.errors && data.json.errors.length > 0) {
      console.error('❌ Reddit API error:', data.json.errors)
      return {
        success: false,
        error: data.json.errors[0][1] || 'Failed to post to Reddit',
      }
    }

    const postUrl = data.json?.data?.url
    console.log(`✅ Posted to Reddit: ${postUrl}`)

    return {
      success: true,
      postUrl: postUrl,
    }
  } catch (error) {
    console.error('❌ Error posting to Reddit:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get Reddit OAuth access token
 */
async function getRedditAccessToken(
  clientId: string,
  clientSecret: string,
  username: string,
  password: string
): Promise<string | null> {
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'FireflyGrove/1.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: username,
        password: password,
      }).toString(),
    })

    const data = await response.json()

    if (data.error) {
      console.error('Reddit auth error:', data.error)
      return null
    }

    return data.access_token
  } catch (error) {
    console.error('Error getting Reddit access token:', error)
    return null
  }
}
