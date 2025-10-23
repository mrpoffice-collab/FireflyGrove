import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndExpireTrustee } from '@/lib/trustee'

export async function GET(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const branchId = params.branchId

    const branch = await prisma.branch.findFirst({
      where: {
        id: branchId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
                approved: true,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        person: {
          select: {
            id: true,
            name: true,
            isLegacy: true,
            birthDate: true,
            deathDate: true,
            discoveryEnabled: true,
            memoryLimit: true,
            memoryCount: true,
            trusteeId: true,
            ownerId: true,
            moderatorId: true,
            trusteeExpiresAt: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        entries: {
          where: {
            status: 'ACTIVE', // Only show active entries
            OR: [
              { authorId: userId },
              { visibility: 'SHARED', approved: true },
            ],
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Check and expire trustee if needed (for Person-based legacy trees)
    if (branch.personId) {
      await checkAndExpireTrustee(branch.personId)
    }

    return NextResponse.json(branch)
  } catch (error) {
    console.error('Error fetching branch:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branch' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/branches/[branchId]
 *
 * Delete a branch (only if owner and no memories exist)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { branchId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const branchId = params.branchId

    // Find branch and verify ownership
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    })

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    if (branch.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the branch owner can delete this branch' },
        { status: 403 }
      )
    }

    // Check if branch has any memories
    if (branch._count.entries > 0) {
      return NextResponse.json(
        { error: 'Cannot delete branch with memories. Please remove all memories first.' },
        { status: 400 }
      )
    }

    // Delete the branch
    await prisma.branch.delete({
      where: { id: branchId },
    })

    return NextResponse.json({
      success: true,
      message: 'Branch deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting branch:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete branch' },
      { status: 500 }
    )
  }
}
