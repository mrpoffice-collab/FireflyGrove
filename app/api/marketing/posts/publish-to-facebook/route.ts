import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/marketing/posts/publish-to-facebook
 * Publish a blog post to Facebook Page
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    })

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    // Get the post from database
    const post = await prisma.marketingPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check for Facebook credentials
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    const pageId = process.env.FACEBOOK_PAGE_ID

    if (!pageAccessToken || !pageId) {
      return NextResponse.json(
        { error: 'Facebook credentials not configured' },
        { status: 500 }
      )
    }

    console.log(`📘 Publishing to Facebook: ${post.title}`)

    // Auto-publish blog post if it's not published yet
    if (post.platform === 'blog' && post.status === 'draft') {
      console.log('  → Auto-publishing blog post first...')
      await prisma.marketingPost.update({
        where: { id: postId },
        data: {
          status: 'published',
          publishedAt: new Date(),
        },
      })
      console.log('  ✅ Blog post published')
    }

    // Prepare Facebook post content
    const message = post.excerpt || post.content.substring(0, 500)

    // Determine the correct URL
    let postUrl = 'https://fireflygrove.app'
    if (post.platform === 'blog' && post.slug) {
      postUrl = `https://fireflygrove.app/blog/${post.slug}`
    }

    // Post to Facebook
    let facebookPostId: string | null = null

    if (post.image) {
      // Post with image (photo post)
      console.log('  → Posting with image...')

      const photoResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/photos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: post.image,
            caption: `${post.title}\n\n${message}\n\nRead more: ${postUrl}`,
            access_token: pageAccessToken,
          }),
        }
      )

      if (!photoResponse.ok) {
        const error = await photoResponse.json()
        console.error('Facebook photo post error:', error)
        return NextResponse.json(
          { error: 'Failed to post to Facebook', details: error },
          { status: 500 }
        )
      }

      const photoData = await photoResponse.json()
      facebookPostId = photoData.id
      console.log('  ✅ Photo posted:', facebookPostId)
    } else {
      // Post text only
      console.log('  → Posting text only...')

      const feedResponse = await fetch(
        `https://graph.facebook.com/v19.0/${pageId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `${post.title}\n\n${message}\n\nRead more: ${postUrl}`,
            access_token: pageAccessToken,
          }),
        }
      )

      if (!feedResponse.ok) {
        const error = await feedResponse.json()
        console.error('Facebook feed post error:', error)
        return NextResponse.json(
          { error: 'Failed to post to Facebook', details: error },
          { status: 500 }
        )
      }

      const feedData = await feedResponse.json()
      facebookPostId = feedData.id
      console.log('  ✅ Text post published:', facebookPostId)
    }

    // Update post record to track Facebook publication
    await prisma.marketingPost.update({
      where: { id: postId },
      data: {
        // You might want to add a facebookPostId field to track this
        // For now, we'll just log it
      },
    })

    console.log('✅ Successfully published to Facebook')

    return NextResponse.json({
      success: true,
      facebookPostId,
      message: 'Successfully posted to Facebook!',
      postUrl: `https://www.facebook.com/${facebookPostId}`,
    })
  } catch (error) {
    console.error('Error publishing to Facebook:', error)
    return NextResponse.json(
      {
        error: 'Failed to publish to Facebook',
        details: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
