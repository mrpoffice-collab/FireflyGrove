import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parseBlogForVideo, BlogPost } from '@/lib/blogVideoParser'
import { getPostBySlug } from '@/lib/blog'
import { prisma } from '@/lib/prisma'

interface ParseRequest {
  slug?: string
  marketingPostId?: string
  manualContent?: {
    title: string
    content: string
    excerpt?: string
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: ParseRequest = await req.json()
    const { slug, marketingPostId, manualContent } = body

    if (!slug && !marketingPostId && !manualContent) {
      return NextResponse.json(
        { error: 'Content source required (slug, marketingPostId, or manualContent)' },
        { status: 400 }
      )
    }

    let post: BlogPost

    // Handle different content sources
    if (manualContent) {
      // Manual content pasted by user
      console.log(`Parsing manual content: ${manualContent.title}`)
      post = {
        slug: manualContent.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
        title: manualContent.title,
        date: new Date().toISOString(),
        excerpt: manualContent.excerpt || manualContent.content.slice(0, 150) + '...',
        content: manualContent.content,
        author: session.user.name || 'User',
        category: 'Manual Content',
        readTime: `${Math.ceil(manualContent.content.split(/\s+/).length / 200)} min read`,
      }
    } else if (marketingPostId) {
      // MarketingPost (FB post, draft blog, etc.)
      console.log(`Parsing MarketingPost: ${marketingPostId}`)

      const marketingPost = await prisma.marketingPost.findUnique({
        where: { id: marketingPostId },
      })

      if (!marketingPost) {
        return NextResponse.json(
          { error: 'Marketing post not found' },
          { status: 404 }
        )
      }

      post = {
        slug: marketingPost.slug || marketingPostId,
        title: marketingPost.title,
        date: (marketingPost.publishedAt || marketingPost.createdAt).toISOString(),
        excerpt: marketingPost.excerpt || marketingPost.content.slice(0, 150) + '...',
        content: marketingPost.content,
        author: session.user.name || 'User',
        category: `${marketingPost.platform} (${marketingPost.status})`,
        readTime: `${Math.ceil(marketingPost.content.split(/\s+/).length / 200)} min read`,
        image: marketingPost.image || undefined,
      }
    } else if (slug) {
      // Published blog post (markdown file)
      console.log(`Parsing published blog: ${slug}`)

      const blogPost = await getPostBySlug(slug)

      if (!blogPost) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        )
      }

      post = blogPost
    } else {
      return NextResponse.json(
        { error: 'Invalid content source' },
        { status: 400 }
      )
    }

    // Parse the post for video
    const script = parseBlogForVideo(post)

    console.log(`✓ Parsed blog post: ${script.sections.length} sections, ${script.estimatedDuration}s duration`)

    return NextResponse.json({
      success: true,
      script,
    })
  } catch (error) {
    console.error('Error parsing blog for video:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to parse blog post' },
      { status: 500 }
    )
  }
}
