import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/branches/:branchId/update
 *
 * Update branch details (title, description)
 * Only the branch owner can update
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { branchId } = await params
    const body = await req.json()

    const { title, description } = body

    // Find the branch
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    })

    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Check if user is the owner
    if (branch.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the branch owner can update the branch' },
        { status: 403 }
      )
    }

    // Validate title
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Branch title cannot be empty' },
        { status: 400 }
      )
    }

    // Update the branch
    const updatedBranch = await prisma.branch.update({
      where: { id: branchId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    })

    return NextResponse.json({
      success: true,
      branch: updatedBranch,
    })
  } catch (error: any) {
    console.error('Error updating branch:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update branch' },
      { status: 500 }
    )
  }
}
