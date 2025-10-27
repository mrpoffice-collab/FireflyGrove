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
  // Ensure blog directory exists
  const blogDir = path.join(process.cwd(), 'public', 'blog')
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
  return `/blog/${filename}`
}

/**
 * Generate markdown with YAML frontmatter
 */
function generateMarkdown(post: BlogPost, publishDate: Date): string {
  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
date: ${publishDate.toISOString()}
excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"
keywords:
${post.keywords.map((k) => `  - ${k}`).join('\n')}
slug: ${post.slug || generateSlug(post.title)}
metaDescription: "${(post.metaDescription || '').replace(/"/g, '\\"')}"
${post.topic ? `topic: "${post.topic.replace(/"/g, '\\"')}"` : ''}
published: true
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
  const blogDir = path.join(process.cwd(), 'public', 'blog')
  const filepath = path.join(blogDir, `${slug}.md`)
  return fs.existsSync(filepath)
}
