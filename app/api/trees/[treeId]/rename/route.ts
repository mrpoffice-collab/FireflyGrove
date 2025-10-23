import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/trees/[treeId]/rename
 *
 * Rename a Tree (only owner can rename)
 * Body: { name: string, description?: string }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { treeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const treeId = params.treeId
    const { name, description } = await req.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tree name is required' },
        { status: 400 }
      )
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Tree name must be 100 characters or less' },
        { status: 400 }
      )
    }

    // Find tree and verify ownership via Grove
    const tree = await prisma.tree.findUnique({
      where: { id: treeId },
      include: {
        grove: true,
      },
    })

    if (!tree) {
      return NextResponse.json({ error: 'Tree not found' }, { status: 404 })
    }

    if (tree.grove.userId !== userId) {
      return NextResponse.json(
        { error: 'Only the grove owner can rename trees' },
        { status: 403 }
      )
    }

    // Update Tree name and description
    const updatedTree = await prisma.tree.update({
      where: { id: treeId },
      data: {
        name: name.trim(),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    })

    return NextResponse.json({
      success: true,
      tree: updatedTree,
    })
  } catch (error: any) {
    console.error('Error renaming tree:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to rename tree' },
      { status: 500 }
    )
  }
}
