/**
 * Content Repurposer
 * Takes a long-form blog post and creates platform-specific content
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface BlogPost {
  title: string
  content: string
  excerpt: string
  keywords: string[]
}

interface RepurposedContent {
  newsletter?: string
  facebook?: string[]
  pinterest?: Array<{ title: string; description: string }>
  reddit?: Array<{ subreddit: string; title: string; body: string }>
}

/**
 * Repurpose a blog post into multiple platform-specific pieces
 */
export async function repurposeContent(
  blog: BlogPost,
  formats: {
    newsletter?: number
    facebook?: number
    pinterest?: number
    reddit?: number
  }
): Promise<RepurposedContent> {
  const result: RepurposedContent = {}

  // Newsletter email
  if (formats.newsletter && formats.newsletter > 0) {
    result.newsletter = await generateNewsletter(blog)
  }

  // Facebook posts (personal account style)
  if (formats.facebook && formats.facebook > 0) {
    result.facebook = await generateFacebookPosts(blog, formats.facebook)
  }

  // Pinterest pins
  if (formats.pinterest && formats.pinterest > 0) {
    result.pinterest = await generatePinterestPins(blog, formats.pinterest)
  }

  // Reddit posts (multiple subreddits)
  if (formats.reddit && formats.reddit > 0) {
    result.reddit = await generateRedditPosts(blog, formats.reddit)
  }

  return result
}

/**
 * Generate newsletter email version
 */
async function generateNewsletter(blog: BlogPost): Promise<string> {
  const prompt = `Convert this blog post into a newsletter email for Firefly Grove subscribers.

Blog Title: ${blog.title}
Blog Content: ${blog.content}

Newsletter Requirements:
- Subject line (compelling, under 50 chars)
- Personal, warm tone (like an email from a friend)
- Lead with an emotional story or scenario
- Include 2-3 key takeaways from the blog
- Add a clear CTA: "Read the full post" linking to blog
- End with warm signature
- Format: Plain text email style (not HTML)
- Length: 200-300 words

Write the complete newsletter email now:`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}

/**
 * Generate Facebook posts (personal account style)
 */
async function generateFacebookPosts(blog: BlogPost, count: number): Promise<string[]> {
  const prompt = `Create ${count} Facebook posts based on this blog post. These will be posted from a personal account (not a business page).

Blog Title: ${blog.title}
Blog Excerpt: ${blog.excerpt}
Keywords: ${blog.keywords.join(', ')}

Facebook Post Requirements:
- Personal, conversational tone (first person)
- Start with a hook (story, question, or emotional statement)
- Short paragraphs, easy to read on mobile
- Include 1-2 emojis (natural, not overdone)
- End with soft CTA (not salesy): "I wrote about this on the blog" or "Link in comments"
- Length: 100-200 words
- Each post should focus on a different angle/takeaway from the blog

Return as JSON array:
[
  "Facebook post text 1",
  "Facebook post text 2"
]`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : []
}

/**
 * Generate Pinterest pins
 */
async function generatePinterestPins(
  blog: BlogPost,
  count: number
): Promise<Array<{ title: string; description: string }>> {
  const prompt = `Create ${count} Pinterest pin ideas based on this blog post.

Blog Title: ${blog.title}
Blog Excerpt: ${blog.excerpt}
Keywords: ${blog.keywords.join(', ')}

Pinterest Pin Requirements:
- Title: Compelling, keyword-rich (60-100 chars)
- Description: Detailed, SEO-friendly, helpful (100-500 chars)
- Include keywords naturally
- Focus on value/benefit, not features
- Add relevant hashtags (3-5)
- Each pin should highlight a different aspect of the blog

Return as JSON array:
[
  {
    "title": "Pin title here",
    "description": "Pin description with hashtags"
  }
]`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : []
}

/**
 * Generate Reddit posts for relevant subreddits
 */
async function generateRedditPosts(
  blog: BlogPost,
  count: number
): Promise<Array<{ subreddit: string; title: string; body: string }>> {
  const prompt = `Create ${count} Reddit post ideas for this blog content. Target relevant subreddits where families discuss memory preservation, genealogy, or legacy planning.

Blog Title: ${blog.title}
Blog Excerpt: ${blog.excerpt}
Keywords: ${blog.keywords.join(', ')}

Reddit Post Requirements:
- Subreddit: Suggest relevant subreddit (e.g., r/Genealogy, r/AskOldPeople, r/family)
- Title: Compelling question or discussion starter (follow subreddit rules)
- Body: Helpful, not promotional. Share insights from blog without being salesy
- Natural mention of blog at end: "I wrote more about this here: [link]"
- Conversational, authentic tone (Redditors hate marketing)
- Length: 150-300 words
- Each post should be tailored to a different subreddit's audience

Return as JSON array:
[
  {
    "subreddit": "r/SubredditName",
    "title": "Post title as question or discussion",
    "body": "Post body text"
  }
]`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  return jsonMatch ? JSON.parse(jsonMatch[0]) : []
}
