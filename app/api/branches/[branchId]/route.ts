import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndExpireTrustee } from '@/lib/trustee'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user ? (session.user as any).id : null
    const { branchId } = await params

    // First, try to find the branch (either user has access OR it's public)
    let branch = null
    let isPublicView = false

    if (userId) {
      // Authenticated user - check if they have access (owner, member, OR public Open Grove tree)
      branch = await prisma.branch.findFirst({
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
            {
              // Allow any authenticated user to view Open Grove trees
              person: {
                isLegacy: true,
                discoveryEnabled: true,
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
        },
      })

      // If found via Open Grove discoveryEnabled, mark as public view
      if (branch?.person?.isLegacy && branch?.person?.discoveryEnabled && branch.ownerId !== userId) {
        isPublicView = true
      }
    }

    // If not found and user is not authenticated, check if it's a public Open Grove tree
    if (!branch) {
      const publicBranch = await prisma.branch.findUnique({
        where: { id: branchId },
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
        },
      })

      // Check if it's a public Open Grove tree
      if (publicBranch?.person?.isLegacy && publicBranch?.person?.discoveryEnabled) {
        branch = publicBranch
        isPublicView = true
      } else if (!userId) {
        // Not authenticated and not a public tree
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    // Check if this is an Open Grove memorial
    let isOpenGrove = false
    if (branch.personId) {
      const membership = await prisma.groveTreeMembership.findFirst({
        where: { personId: branch.personId },
        include: { grove: { select: { isOpenGrove: true } } },
      })
      isOpenGrove = membership?.grove?.isOpenGrove || false
    }

    // Check if user is owner to determine what entries to show
    const isOwner = userId && branch.ownerId === userId

    // Get user's admin status
    let isAdmin = false
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true }
      })
      isAdmin = user?.isAdmin || false
    }

    // Pagination params from query string
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Check if user is an approved member
    const isMember = userId && branch.members.some(m => m.userId === userId && m.approved)

    // Fetch entries with appropriate filters and pagination
    const [entries, totalCount] = await Promise.all([
      prisma.entry.findMany({
        where: {
          branchId: branchId,
          status: 'ACTIVE',
          ...(isPublicView
            ? isOpenGrove
              ? { visibility: 'SHARED' } // Open Grove public view shows SHARED entries
              : { visibility: 'LEGACY' } // Other public views only see LEGACY entries
            : isOwner || isMember
            ? {} // Owner and approved members see all active entries
            : { // Non-members only see approved shared entries
                visibility: 'SHARED',
                approved: true,
              }
          ),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          glows: {
            where: userId ? { userId } : undefined,
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              childMemories: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: skip,
      }),
      prisma.entry.count({
        where: {
          branchId: branchId,
          status: 'ACTIVE',
          ...(isPublicView
            ? isOpenGrove
              ? { visibility: 'SHARED' }
              : { visibility: 'LEGACY' }
            : isOwner || isMember
            ? {}
            : {
                visibility: 'SHARED',
                approved: true,
              }
          ),
        },
      }),
    ])

    // Add entries and pagination to branch object
    const branchWithEntries = {
      ...branch,
      entries,
      isPublicView, // Let frontend know if this is public view
      isOpenGrove, // Let frontend know if this is an Open Grove memorial
      isAdmin, // Let frontend know if user is admin (for video feature)
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    }

    // Check and expire trustee if needed (for Person-based legacy trees)
    if (branch.personId) {
      await checkAndExpireTrustee(branch.personId)
    }

    return NextResponse.json(branchWithEntries)
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
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { branchId } = await params

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
