import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/spark-collections/[id]/share - Toggle Grove sharing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isSharedWithGrove } = body

    // Verify the collection belongs to the user
    const collection = await prisma.sparkCollection.findUnique({
      where: { id },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    if (collection.userId !== userId) {
      return NextResponse.json({ error: 'You can only share your own collections' }, { status: 403 })
    }

    // Update the sharing status
    const updated = await prisma.sparkCollection.update({
      where: { id },
      data: { isSharedWithGrove },
    })

    return NextResponse.json({
      success: true,
      isSharedWithGrove: updated.isSharedWithGrove,
    })
  } catch (error) {
    console.error('Error toggling collection sharing:', error)
    return NextResponse.json(
      { error: 'Failed to toggle collection sharing' },
      { status: 500 }
    )
  }
}
