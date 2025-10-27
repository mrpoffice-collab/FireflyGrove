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
- Write in 3rd person (they/their/families) - NEVER use "you/your"
- Warm, empathetic tone
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
- Write in 3rd person perspective (they/their/families) - NEVER use "you/your" or "I/me"
- Conversational tone (like sharing an observation or story)
- Start with a hook (story, question, or emotional statement)
- Short paragraphs, easy to read on mobile
- Include 1-2 emojis (natural, not overdone)
- End with soft CTA (not salesy): "Read more on the blog" or "Link in comments"
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
- Write in 3rd person (they/their/families) - NEVER use "you/your"
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

