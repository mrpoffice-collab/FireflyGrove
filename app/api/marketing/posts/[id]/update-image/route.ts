import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { image } = await request.json()
    const postId = params.id

    // Update the post's image
    const updatedPost = await prisma.marketingPost.update({
      where: { id: postId },
      data: { image }
    })

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Image updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update image' },
      { status: 500 }
    )
  }
}
