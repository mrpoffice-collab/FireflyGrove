import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackEventServer, AnalyticsEvents, AnalyticsCategories, AnalyticsActions } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

/**
 * POST /api/memories/:memoryId/share
 *
 * Share a memory to additional branches
 * Creates MemoryBranchLink records for each target branch
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { memoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const memoryId = params.memoryId
    const body = await req.json()
    const { branchIds } = body // Array of branch IDs to share to

    if (!branchIds || !Array.isArray(branchIds) || branchIds.length === 0) {
      return NextResponse.json(
        { error: 'Branch IDs array is required' },
        { status: 400 }
      )
    }

    // Get the memory and verify ownership
    const memory = await prisma.entry.findUnique({
      where: { id: memoryId },
      include: {
        branch: true,
        author: true,
      },
    })

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
    }

    // Only the author can share their memory
    if (memory.authorId !== userId) {
      return NextResponse.json(
        { error: 'Only the memory creator can share it' },
        { status: 403 }
      )
    }

    // Check if origin link exists, create if not
    const originLink = await prisma.memoryBranchLink.findUnique({
      where: {
        memoryId_branchId: {
          memoryId,
          branchId: memory.branchId,
        },
      },
    })

    if (!originLink) {
      await prisma.memoryBranchLink.create({
        data: {
          memoryId,
          branchId: memory.branchId,
          role: 'origin',
          visibilityStatus: 'active',
        },
      })
    }

    // Process each target branch
    const results = []
    for (const targetBranchId of branchIds) {
      // Skip if trying to share to origin branch
      if (targetBranchId === memory.branchId) {
        continue
      }

      // Get target branch with preferences and verify user has access
      const targetBranch = await prisma.branch.findFirst({
        where: {
          id: targetBranchId,
          OR: [
            { ownerId: userId }, // User owns the branch
            { members: { some: { userId, approved: true } } }, // User is an approved member
            {
              person: {
                isLegacy: true,
                discoveryEnabled: true, // Public legacy tree in Open Grove
              },
            },
          ],
        },
        include: {
          preferences: true,
        },
      })

      if (!targetBranch) {
        results.push({
          branchId: targetBranchId,
          success: false,
          error: 'Branch not found or access denied',
        })
        continue
      }

      // Check tagging preferences
      const prefs = targetBranch.preferences

      if (prefs && !prefs.canBeTagged) {
        results.push({
          branchId: targetBranchId,
          success: false,
          error: 'This branch does not accept shared tags',
        })
        continue
      }

      // Determine visibility status based on preferences
      const visibilityStatus =
        prefs && prefs.requiresTagApproval ? 'pending_approval' : 'active'

      // Check if link already exists
      const existingLink = await prisma.memoryBranchLink.findUnique({
        where: {
          memoryId_branchId: {
            memoryId,
            branchId: targetBranchId,
          },
        },
      })

      if (existingLink) {
        // Update if was previously removed
        if (
          existingLink.visibilityStatus === 'removed_by_branch' ||
          existingLink.visibilityStatus === 'removed_by_user'
        ) {
          await prisma.memoryBranchLink.update({
            where: { id: existingLink.id },
            data: { visibilityStatus },
          })

          results.push({
            branchId: targetBranchId,
            success: true,
            status: visibilityStatus,
            action: 'restored',
          })
        } else {
          results.push({
            branchId: targetBranchId,
            success: false,
            error: 'Already shared to this branch',
          })
        }
        continue
      }

      // Create new link
      await prisma.memoryBranchLink.create({
        data: {
          memoryId,
          branchId: targetBranchId,
          role: 'shared',
          visibilityStatus,
        },
      })

      // Create local metadata
      await prisma.memoryLocalMeta.create({
        data: {
          memoryId,
          branchId: targetBranchId,
        },
      })

      // Create audit log
      await prisma.audit.create({
        data: {
          actorId: userId,
          action: 'MEMORY_SHARED',
          targetType: 'ENTRY',
          targetId: memoryId,
          metadata: JSON.stringify({
            targetBranchId,
            visibilityStatus,
          }),
        },
      })

      results.push({
        branchId: targetBranchId,
        success: true,
        status: visibilityStatus,
        action: 'created',
      })
    }

    // Track memory sharing
    const successfulShares = results.filter((r) => r.success).length
    if (successfulShares > 0) {
      await trackEventServer(prisma, userId, {
        eventType: AnalyticsEvents.MEMORY_SHARED,
        category: AnalyticsCategories.MEMORIES,
        action: AnalyticsActions.SHARED,
        metadata: {
          memoryId,
          branchesSharedTo: successfulShares,
          totalAttempts: branchIds.length,
        },
      })
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Memory shared to ${results.filter((r) => r.success).length} branches`,
    })
  } catch (error: any) {
    console.error('Error sharing memory:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to share memory' },
      { status: 500 }
    )
  }
}
