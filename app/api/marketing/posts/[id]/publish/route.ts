import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const postId = params.id

    // Get the post first
    const post = await prisma.marketingPost.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Generate slug from title if not exists
    const slug = post.slug || post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Calculate read time (roughly 200 words per minute)
    const wordCount = post.content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    // Create frontmatter
    const today = new Date().toISOString().split('T')[0]
    const imageUrl = post.image || 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=1200&h=630&fit=crop'
    const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
date: "${today}"
excerpt: "${(post.excerpt || post.metaDescription || post.title).replace(/"/g, '\\"')}"
author: "Firefly Grove Team"
category: "Memory Preservation"
readTime: "${readTime} min read"
image: "${imageUrl}"
---

${post.content}
`

    // Write to content/blog directory
    const blogDir = path.join(process.cwd(), 'content', 'blog')
    const filePath = path.join(blogDir, `${slug}.md`)

    fs.writeFileSync(filePath, frontmatter, 'utf-8')

    // Update post to published
    const updatedPost = await prisma.marketingPost.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        slug: slug
      }
    })

    return NextResponse.json({
      success: true,
      post: updatedPost,
      slug: slug,
      url: `/blog/${slug}`,
      message: 'Blog post published successfully!'
    })
  } catch (error: any) {
    console.error('Error publishing post:', error)
    return NextResponse.json({ error: error.message || 'Failed to publish post' }, { status: 500 })
  }
}
