import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const { entryId, text } = body

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 })
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Get the entry to verify ownership
    const entry = await prisma.treasureEntry.findUnique({
      where: { id: entryId },
      select: { userId: true },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Verify ownership
    if (entry.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update the entry
    const updatedEntry = await prisma.treasureEntry.update({
      where: { id: entryId },
      data: {
        text: text.trim(),
      },
      include: {
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      entry: updatedEntry,
    })
  } catch (error) {
    console.error('Edit treasure entry error:', error)
    return NextResponse.json(
      {
        error: 'Failed to edit entry',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
