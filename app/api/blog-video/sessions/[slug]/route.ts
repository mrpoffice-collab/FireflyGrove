import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/blog-video/sessions/[slug]
 * Get a specific blog video session by slug
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: blogSlug } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const blogVideoSession = await prisma.blogVideoSession.findUnique({
      where: {
        userId_blogSlug: {
          userId,
          blogSlug,
        },
      },
    })

    if (!blogVideoSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: blogVideoSession,
    })
  } catch (error) {
    console.error('Error fetching blog video session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}
