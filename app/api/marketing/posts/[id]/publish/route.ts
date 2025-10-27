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

    // Update post to published
    const post = await prisma.marketingPost.update({
      where: { id: postId },
      data: {
        status: 'published',
        publishedAt: new Date()
      }
    })

    // TODO: Trigger email newsletter, social sharing, etc.

    return NextResponse.json({
      success: true,
      post,
      message: 'Blog post published successfully!'
    })
  } catch (error) {
    console.error('Error publishing post:', error)
    return NextResponse.json({ error: 'Failed to publish post' }, { status: 500 })
  }
}
