import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Update post to published (no file write needed - blog.ts reads from database)
    const updatedPost = await prisma.marketingPost.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        slug: slug
      }
    })

    console.log(`✅ Published blog post: ${slug}`)

    return NextResponse.json({
      success: true,
      post: updatedPost,
      slug: slug,
      url: `/blog/${slug}`,
      message: 'Blog post published successfully! Post will be served from database.'
    })
  } catch (error: any) {
    console.error('Error publishing post:', error)
    return NextResponse.json({ error: error.message || 'Failed to publish post' }, { status: 500 })
  }
}
