import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/sparks/[id] - Update spark
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

    const sparkId = params.id
    const body = await request.json()

    // Check if spark exists and user owns it
    const spark = await prisma.spark.findUnique({
      where: { id: sparkId },
    })

    if (!spark) {
      return NextResponse.json({ error: 'Spark not found' }, { status: 404 })
    }

    // Only owner or admin can update
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    if (spark.userId !== userId && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update spark
    const updateData: any = {}
    if (body.text !== undefined) updateData.text = body.text.trim()
    if (body.category !== undefined) updateData.category = body.category
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.isGlobal !== undefined && user?.isAdmin) {
      updateData.isGlobal = body.isGlobal
    }

    const updatedSpark = await prisma.spark.update({
      where: { id: sparkId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updatedSpark)
  } catch (error) {
    console.error('Error updating spark:', error)
    return NextResponse.json(
      { error: 'Failed to update spark' },
      { status: 500 }
    )
  }
}

// DELETE /api/sparks/[id] - Delete spark
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sparkId = params.id

    // Check if spark exists and user owns it
    const spark = await prisma.spark.findUnique({
      where: { id: sparkId },
    })

    if (!spark) {
      return NextResponse.json({ error: 'Spark not found' }, { status: 404 })
    }

    // Only owner or admin can delete
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    if (spark.userId !== userId && !user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.spark.delete({
      where: { id: sparkId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting spark:', error)
    return NextResponse.json(
      { error: 'Failed to delete spark' },
      { status: 500 }
    )
  }
}

// POST /api/sparks/[id]/use - Increment usage count
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sparkId = params.id

    // Increment usage count
    const spark = await prisma.spark.update({
      where: { id: sparkId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true, usageCount: spark.usageCount })
  } catch (error) {
    console.error('Error incrementing spark usage:', error)
    return NextResponse.json(
      { error: 'Failed to update usage count' },
      { status: 500 }
    )
  }
}
