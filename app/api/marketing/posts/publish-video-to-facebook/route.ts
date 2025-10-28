import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FormData from 'form-data'

/**
 * POST /api/marketing/posts/publish-video-to-facebook
 * Upload and publish a marketing video to Facebook Page
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
    const { videoUrl, title, description } = body

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL required' }, { status: 400 })
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

    console.log(`📹 Uploading video to Facebook: ${title}`)

    // Facebook Video Upload using URL (simpler than file upload)
    // Note: For production, you might want to upload the actual file
    // For now, we'll use a file_url approach

    const uploadResponse = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/videos`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_url: videoUrl,
          title: title || 'Marketing Video',
          description: description || '',
          access_token: pageAccessToken,
        }),
      }
    )

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json()
      console.error('Facebook video upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload video to Facebook', details: error },
        { status: 500 }
      )
    }

    const videoData = await uploadResponse.json()
    const videoId = videoData.id

    console.log(`✅ Video uploaded to Facebook: ${videoId}`)

    return NextResponse.json({
      success: true,
      videoId,
      message: 'Video successfully posted to Facebook!',
      postUrl: `https://www.facebook.com/${pageId}/videos/${videoId}`,
    })
  } catch (error: any) {
    console.error('Error publishing video to Facebook:', error)
    return NextResponse.json(
      {
        error: 'Failed to publish video to Facebook',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
