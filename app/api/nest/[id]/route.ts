import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { del } from '@vercel/blob'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/nest/[id]
 * Remove a photo from the nest
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Find the nest item
    const nestItem = await prisma.nestItem.findUnique({
      where: { id: itemId },
    })

    if (!nestItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Verify ownership
    if (nestItem.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete from Vercel Blob
    try {
      const blobUrl = nestItem.photoUrl || nestItem.videoUrl
      if (blobUrl) {
        await del(blobUrl)
      }
    } catch (blobError) {
      console.error('Error deleting from blob:', blobError)
      // Continue even if blob deletion fails
    }

    // Delete from database
    await prisma.nestItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting nest item:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete item' },
      { status: 500 }
    )
  }
}
