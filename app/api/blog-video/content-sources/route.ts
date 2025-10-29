import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAllPosts } from '@/lib/blog'

/**
 * GET /api/blog-video/content-sources
 * Get all available content sources for video generation
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get published blog posts (markdown files)
    const publishedBlogs = await getAllPosts()
    const blogSources = publishedBlogs.map(post => ({
      id: post.slug,
      type: 'published-blog',
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      source: 'Blog (Published)',
      image: post.image,
      createdAt: post.date,
    }))

    // Get MarketingPost content (both drafts and published)
    const marketingPosts = await prisma.marketingPost.findMany({
      where: {
        platform: {
          in: ['blog', 'facebook', 'email'],
        },
        postType: {
          in: ['blog_post', 'social_post'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        platform: true,
        postType: true,
        title: true,
        content: true,
        excerpt: true,
        status: true,
        slug: true,
        image: true,
        publishedAt: true,
        createdAt: true,
      },
    })

    const marketingSources = marketingPosts.map(post => ({
      id: post.slug || post.id,
      type: post.status === 'draft' ? 'draft-marketing' : 'published-marketing',
      title: post.title,
      excerpt: post.excerpt || post.content.slice(0, 150) + '...',
      slug: post.slug || post.id,
      source: `${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} (${post.status})`,
      image: post.image,
      createdAt: post.publishedAt || post.createdAt,
      marketingPostId: post.id,
    }))

    // Combine all sources
    const allSources = [...blogSources, ...marketingSources].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      sources: allSources,
      counts: {
        publishedBlogs: blogSources.length,
        drafts: marketingSources.filter(s => s.type === 'draft-marketing').length,
        publishedMarketing: marketingSources.filter(s => s.type === 'published-marketing').length,
        total: allSources.length,
      },
    })
  } catch (error) {
    console.error('Error fetching content sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content sources' },
      { status: 500 }
    )
  }
}
