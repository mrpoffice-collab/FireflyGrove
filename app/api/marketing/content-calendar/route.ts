import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch approved MarketingPost entries with scheduled dates
    const approvedPosts = await prisma.marketingPost.findMany({
      where: {
        isApproved: true,
        scheduledFor: { not: null }
      },
      orderBy: { scheduledFor: 'asc' },
      select: {
        id: true,
        platform: true,
        title: true,
        excerpt: true,
        keywords: true,
        scheduledFor: true,
        status: true,
        publishedAt: true,
        views: true,
        signups: true,
        estimatedUsers: true,
        topic: true,
        slug: true,
        createdAt: true,
      }
    })

    // Transform to calendar format
    const calendar = approvedPosts.map(post => ({
      id: post.id,
      topic: post.topic || post.title,
      keywords: post.keywords,
      excerpt: post.excerpt,
      scheduledFor: post.scheduledFor!,
      status: post.status === 'published' ? 'published' : post.status === 'scheduled' ? 'scheduled' : 'approved',
      postId: post.id,
      post: {
        id: post.id,
        title: post.title,
        status: post.status,
        publishedAt: post.publishedAt,
        views: post.views,
        signups: post.signups,
        estimatedUsers: post.estimatedUsers,
        platform: post.platform,
        slug: post.slug,
      },
      createdAt: post.createdAt,
    }))

    return NextResponse.json({ calendar })
  } catch (error) {
    console.error('Error fetching content calendar:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content calendar' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    await prisma.contentCalendar.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting calendar item:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar item' },
      { status: 500 }
    )
  }
}
