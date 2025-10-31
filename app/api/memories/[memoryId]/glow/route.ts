import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/memories/[memoryId]/glow
 * Add a glow to a memory (toggle on)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { memoryId: string } }
) {
  try {
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

    const { memoryId } = params

    // Check if memory exists
    const memory = await prisma.entry.findUnique({
      where: { id: memoryId },
      select: { id: true, status: true },
    })

    if (!memory || memory.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    // Check if user already glowed this memory
    const existingGlow = await prisma.memoryGlow.findUnique({
      where: {
        entryId_userId: {
          entryId: memoryId,
          userId: user.id,
        },
      },
    })

    if (existingGlow) {
      return NextResponse.json(
        { error: 'You already glowed this memory' },
        { status: 400 }
      )
    }

    // Create the glow and increment the count
    const [glow] = await prisma.$transaction([
      prisma.memoryGlow.create({
        data: {
          entryId: memoryId,
          userId: user.id,
        },
      }),
      prisma.entry.update({
        where: { id: memoryId },
        data: {
          glowCount: { increment: 1 },
        },
      }),
    ])

    // Get updated count
    const updatedMemory = await prisma.entry.findUnique({
      where: { id: memoryId },
      select: { glowCount: true },
    })

    return NextResponse.json({
      success: true,
      glowCount: updatedMemory?.glowCount || 0,
      isGlowing: true,
    })
  } catch (error) {
    console.error('Error adding glow:', error)
    return NextResponse.json(
      { error: 'Failed to add glow' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/memories/[memoryId]/glow
 * Remove a glow from a memory (toggle off)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { memoryId: string } }
) {
  try {
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

    const { memoryId } = params

    // Check if glow exists
    const existingGlow = await prisma.memoryGlow.findUnique({
      where: {
        entryId_userId: {
          entryId: memoryId,
          userId: user.id,
        },
      },
    })

    if (!existingGlow) {
      return NextResponse.json(
        { error: 'You have not glowed this memory' },
        { status: 400 }
      )
    }

    // Delete the glow and decrement the count
    await prisma.$transaction([
      prisma.memoryGlow.delete({
        where: {
          entryId_userId: {
            entryId: memoryId,
            userId: user.id,
          },
        },
      }),
      prisma.entry.update({
        where: { id: memoryId },
        data: {
          glowCount: { decrement: 1 },
        },
      }),
    ])

    // Get updated count
    const updatedMemory = await prisma.entry.findUnique({
      where: { id: memoryId },
      select: { glowCount: true },
    })

    return NextResponse.json({
      success: true,
      glowCount: updatedMemory?.glowCount || 0,
      isGlowing: false,
    })
  } catch (error) {
    console.error('Error removing glow:', error)
    return NextResponse.json(
      { error: 'Failed to remove glow' },
      { status: 500 }
    )
  }
}
