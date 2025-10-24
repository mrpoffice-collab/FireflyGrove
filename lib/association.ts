// Memory Association Control Helper Functions

import { prisma } from './prisma'

export interface BranchPreferences {
  id: string
  branchId: string
  canBeTagged: boolean
  requiresTagApproval: boolean
  visibleInCrossShares: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PendingMemory {
  id: string
  memoryId: string
  branchId: string
  memory: {
    id: string
    text: string
    mediaUrl: string | null
    audioUrl: string | null
    createdAt: Date
    author: {
      name: string
    }
    branch: {
      title: string
    }
  }
}

/**
 * Get branch preferences (with default values if not set)
 */
export async function getBranchPreferences(branchId: string): Promise<BranchPreferences> {
  let preferences = await prisma.branchPreferences.findUnique({
    where: { branchId },
  })

  // Create default preferences if they don't exist
  if (!preferences) {
    preferences = await prisma.branchPreferences.create({
      data: {
        branchId,
        canBeTagged: true,
        requiresTagApproval: false,
        visibleInCrossShares: true,
      },
    })
  }

  return preferences as any
}

/**
 * Update branch preferences
 */
export async function updateBranchPreferences(
  branchId: string,
  updates: {
    canBeTagged?: boolean
    requiresTagApproval?: boolean
    visibleInCrossShares?: boolean
  }
): Promise<BranchPreferences> {
  // Ensure preferences exist first
  await getBranchPreferences(branchId)

  const updated = await prisma.branchPreferences.update({
    where: { branchId },
    data: updates,
  })

  return updated as any
}

/**
 * Check if a branch can be tagged in shared memories
 */
export async function canTagBranch(branchId: string): Promise<boolean> {
  const preferences = await getBranchPreferences(branchId)
  return preferences.canBeTagged
}

/**
 * Check if a branch requires approval for shared memories
 */
export async function requiresApproval(branchId: string): Promise<boolean> {
  const preferences = await getBranchPreferences(branchId)
  return preferences.requiresTagApproval
}

/**
 * Get all pending memories for a branch (awaiting approval)
 */
export async function getPendingApprovals(branchId: string): Promise<PendingMemory[]> {
  const links = await prisma.memoryBranchLink.findMany({
    where: {
      branchId,
      visibilityStatus: 'pending_approval',
    },
    include: {
      memory: {
        include: {
          author: {
            select: {
              name: true,
            },
          },
          branch: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return links.map((link) => ({
    id: link.id,
    memoryId: link.memoryId,
    branchId: link.branchId,
    memory: link.memory as any,
  }))
}

/**
 * Approve a pending shared memory
 */
export async function approveSharedMemory(linkId: string): Promise<void> {
  await prisma.memoryBranchLink.update({
    where: { id: linkId },
    data: {
      visibilityStatus: 'active',
    },
  })
}

/**
 * Decline a pending shared memory
 */
export async function declineSharedMemory(linkId: string): Promise<void> {
  await prisma.memoryBranchLink.update({
    where: { id: linkId },
    data: {
      visibilityStatus: 'removed_by_branch',
    },
  })
}

/**
 * Batch approve multiple pending memories
 */
export async function batchApproveMemories(linkIds: string[]): Promise<void> {
  await prisma.memoryBranchLink.updateMany({
    where: {
      id: { in: linkIds },
    },
    data: {
      visibilityStatus: 'active',
    },
  })
}

/**
 * Batch decline multiple pending memories
 */
export async function batchDeclineMemories(linkIds: string[]): Promise<void> {
  await prisma.memoryBranchLink.updateMany({
    where: {
      id: { in: linkIds },
    },
    data: {
      visibilityStatus: 'removed_by_branch',
    },
  })
}

/**
 * Get pending approval count for a branch
 */
export async function getPendingApprovalCount(branchId: string): Promise<number> {
  return await prisma.memoryBranchLink.count({
    where: {
      branchId,
      visibilityStatus: 'pending_approval',
    },
  })
}

/**
 * Check if a user has permission to manage branch preferences
 */
export async function canManageBranchPreferences(userId: string, branchId: string): Promise<boolean> {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { ownerId: true },
  })

  return branch?.ownerId === userId
}
