import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/blog-video/sessions
 * List all blog video sessions for current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const sessions = await prisma.blogVideoSession.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        blogSlug: true,
        blogTitle: true,
        selectedVoice: true,
        voiceSpeed: true,
        sectionCount: true,
        estimatedDuration: true,
        wordCount: true,
        generationCost: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        renderedAt: true,
      },
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching blog video sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/blog-video/sessions
 * Save a new blog video session or update existing one
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const {
      blogSlug,
      blogTitle,
      videoScript,
      audioResults,
      sectionMedia,
      selectedVoice,
      voiceSpeed,
      generationCost,
    } = body

    if (!blogSlug || !blogTitle || !videoScript || !audioResults) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate metadata
    const sectionCount = videoScript.sections?.length || 0
    const estimatedDuration = videoScript.estimatedDuration || 0
    const wordCount = videoScript.wordCount || 0

    // Upsert session (create or update if exists for this user + slug)
    const blogVideoSession = await prisma.blogVideoSession.upsert({
      where: {
        userId_blogSlug: {
          userId,
          blogSlug,
        },
      },
      create: {
        userId,
        blogSlug,
        blogTitle,
        videoScript,
        audioResults,
        sectionMedia: sectionMedia || {},
        selectedVoice: selectedVoice || 'nova',
        voiceSpeed: voiceSpeed || 0.95,
        sectionCount,
        estimatedDuration,
        wordCount,
        generationCost,
        status: 'voiceover_complete',
      },
      update: {
        blogTitle,
        videoScript,
        audioResults,
        sectionMedia: sectionMedia || {},
        selectedVoice: selectedVoice || 'nova',
        voiceSpeed: voiceSpeed || 0.95,
        sectionCount,
        estimatedDuration,
        wordCount,
        generationCost,
        status: 'voiceover_complete',
      },
    })

    console.log(`Saved blog video session: ${blogVideoSession.id} (${blogSlug})`)

    return NextResponse.json({
      success: true,
      session: blogVideoSession,
    })
  } catch (error) {
    console.error('Error saving blog video session:', error)
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/blog-video/sessions?id=xxx
 * Delete a blog video session
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existing = await prisma.blogVideoSession.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.blogVideoSession.delete({
      where: { id },
    })

    console.log(`Deleted blog video session: ${id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog video session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
