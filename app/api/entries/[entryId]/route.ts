import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const body = await request.json()
    const { text, mediaUrl, videoUrl, audioUrl } = body

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Find the entry
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { authorId: true },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    // Only the author can edit
    if (entry.authorId !== user.id) {
      return NextResponse.json({ error: 'Only the author can edit this memory' }, { status: 403 })
    }

    // Update the entry
    const updatedEntry = await prisma.entry.update({
      where: { id: entryId },
      data: {
        text: text.trim(),
        mediaUrl: mediaUrl !== undefined ? mediaUrl : undefined,
        videoUrl: videoUrl !== undefined ? videoUrl : undefined,
        audioUrl: audioUrl !== undefined ? audioUrl : undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, entry: updatedEntry })
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json(
      { error: 'Failed to update memory' },
      { status: 500 }
    )
  }
}
