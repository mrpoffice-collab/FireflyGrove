import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if collection exists
    const collection = await prisma.sparkCollection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    // Check if user already has this collection activated
    const existing = await prisma.userSparkCollection.findUnique({
      where: {
        userId_collectionId: {
          userId,
          collectionId,
        },
      },
    })

    if (existing) {
      // Toggle existing activation
      const updated = await prisma.userSparkCollection.update({
        where: {
          userId_collectionId: {
            userId,
            collectionId,
          },
        },
        data: {
          isActive: !existing.isActive,
        },
      })

      return NextResponse.json({
        isActive: updated.isActive,
        message: updated.isActive ? 'Collection activated' : 'Collection deactivated',
      })
    } else {
      // Create new activation (default to active)
      const created = await prisma.userSparkCollection.create({
        data: {
          userId,
          collectionId,
          isActive: true,
        },
      })

      return NextResponse.json({
        isActive: created.isActive,
        message: 'Collection activated',
      })
    }
  } catch (error) {
    console.error('Error toggling spark collection:', error)
    return NextResponse.json(
      { error: 'Failed to toggle collection' },
      { status: 500 }
    )
  }
}
