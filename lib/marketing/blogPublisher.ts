/**
 * Blog Post Publisher
 * Writes approved blog posts as markdown files
 */

import fs from 'fs'
import path from 'path'

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  slug: string | null
  metaDescription: string | null
  keywords: string[]
  scheduledFor: Date | null
  topic: string | null
}

/**
 * Publish a blog post as a markdown file
 */
export async function publishBlogPost(post: BlogPost): Promise<string> {
  // Ensure blog directory exists (using content/blog to match blog reader)
  const blogDir = path.join(process.cwd(), 'content', 'blog')
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true })
  }

  // Generate filename from slug or title
  const slug = post.slug || generateSlug(post.title)
  const filename = `${slug}.md`
  const filepath = path.join(blogDir, filename)

  // Create markdown content with frontmatter
  const publishDate = post.scheduledFor ? new Date(post.scheduledFor) : new Date()
  const markdown = generateMarkdown(post, publishDate)

  // Write file
  fs.writeFileSync(filepath, markdown, 'utf-8')

  console.log(`📝 Published blog post: ${filepath}`)

  // Return the public URL
  return `/blog/${slug}`
}

/**
 * Generate markdown with YAML frontmatter
 */
function generateMarkdown(post: BlogPost, publishDate: Date): string {
  // Format date as YYYY-MM-DD
  const dateStr = publishDate.toISOString().split('T')[0]

  // Calculate read time (rough estimate: 200 words per minute)
  const wordCount = post.content.split(/\s+/).length
  const readTime = Math.ceil(wordCount / 200)

  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
date: "${dateStr}"
excerpt: "${(post.excerpt || post.metaDescription || '').replace(/"/g, '\\"')}"
author: "Firefly Grove Team"
category: "Memory Preservation"
readTime: "${readTime} min read"
---

${post.content}
`

  return frontmatter
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Check if blog post already published (file exists)
 */
export function isBlogPostPublished(slug: string): boolean {
  const blogDir = path.join(process.cwd(), 'content', 'blog')
  const filepath = path.join(blogDir, `${slug}.md`)
  return fs.existsSync(filepath)
}
