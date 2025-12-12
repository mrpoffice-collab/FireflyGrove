import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/memories/[memoryId]/thread
 * Fetch threaded child memories for a parent memory
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memoryId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : null
    const { memoryId } = await params

    // Fetch child memories (threaded replies)
    const childMemories = await prisma.entry.findMany({
      where: {
        parentMemoryId: memoryId,
        status: 'ACTIVE',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        glows: userId ? {
          where: { userId },
          select: {
            userId: true,
          },
        } : false,
        _count: {
          select: {
            childMemories: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Chronological order for threads
      },
    })

    return NextResponse.json({ childMemories })
  } catch (error) {
    console.error('Error fetching thread:', error)
    return NextResponse.json(
      { error: 'Failed to fetch thread' },
      { status: 500 }
    )
  }
}
