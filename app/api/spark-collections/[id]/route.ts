import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/spark-collections/[id] - Delete a collection
export async function DELETE(
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

    // Check if collection exists and belongs to user
    const collection = await prisma.sparkCollection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    if (collection.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own collections' },
        { status: 403 }
      )
    }

    // Delete the collection (cascades to sparks and user activations)
    await prisma.sparkCollection.delete({
      where: { id: collectionId },
    })

    return NextResponse.json({ message: 'Collection deleted successfully' })
  } catch (error) {
    console.error('Error deleting spark collection:', error)
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    )
  }
}

// PATCH /api/spark-collections/[id] - Update collection details
export async function PATCH(
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
    const body = await request.json()
    const { name, description, icon } = body

    // Check if collection exists and belongs to user
    const collection = await prisma.sparkCollection.findUnique({
      where: { id: collectionId },
    })

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    if (collection.userId !== userId) {
      return NextResponse.json(
        { error: 'You can only edit your own collections' },
        { status: 403 }
      )
    }

    // Update the collection
    const updated = await prisma.sparkCollection.update({
      where: { id: collectionId },
      data: {
        name: name?.trim() || collection.name,
        description: description?.trim() || collection.description,
        icon: icon !== undefined ? icon : collection.icon,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating spark collection:', error)
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    )
  }
}
