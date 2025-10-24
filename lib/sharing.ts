// Cross-Branch Sharing Helper Functions

import { prisma } from './prisma'

export interface MemoryBranchLink {
  id: string
  memoryId: string
  branchId: string
  role: 'origin' | 'shared'
  visibilityStatus: 'active' | 'removed_by_branch' | 'removed_by_user' | 'pending_approval'
  createdAt: Date
  updatedAt: Date
}

export interface Branch {
  id: string
  title: string
  ownerId: string
}

/**
 * Get all branch links for a memory
 */
export async function getMemoryLinks(memoryId: string): Promise<MemoryBranchLink[]> {
  return await prisma.memoryBranchLink.findMany({
    where: { memoryId },
    orderBy: { createdAt: 'asc' },
  }) as any
}

/**
 * Check if a branch allows shared memories (not opted out)
 */
export async function canShareToBranch(branchId: string): Promise<boolean> {
  const preferences = await prisma.branchPreferences.findUnique({
    where: { branchId },
  })

  // If no preferences exist, default to true (can be tagged)
  if (!preferences) return true

  return preferences.canBeTagged
}

/**
 * Get all branches where a memory is shared (active or pending)
 */
export async function getSharedBranches(memoryId: string): Promise<Branch[]> {
  const links = await prisma.memoryBranchLink.findMany({
    where: {
      memoryId,
      visibilityStatus: {
        in: ['active', 'pending_approval'],
      },
    },
    include: {
      branch: {
        select: {
          id: true,
          title: true,
          ownerId: true,
        },
      },
    },
  })

  return links.map((link) => link.branch)
}

/**
 * Get the most restrictive visibility from multiple branches
 * PRIVATE > SHARED > LEGACY
 */
export async function getMostRestrictiveVisibility(branchIds: string[]): Promise<string> {
  if (branchIds.length === 0) return 'PRIVATE'

  const branches = await prisma.branch.findMany({
    where: { id: { in: branchIds } },
    select: { id: true },
  })

  // For now, we'll check entries linked to these branches
  // In the future, you might want to add a visibility field to branches themselves
  const entries = await prisma.entry.findMany({
    where: { branchId: { in: branchIds } },
    select: { visibility: true },
  })

  const visibilities = entries.map((e) => e.visibility)

  if (visibilities.includes('PRIVATE')) return 'PRIVATE'
  if (visibilities.includes('SHARED')) return 'SHARED'
  if (visibilities.includes('LEGACY')) return 'LEGACY'

  return 'PRIVATE' // Default to most restrictive
}

/**
 * Propagate memory updates to all linked branches
 */
export async function propagateMemoryUpdate(
  memoryId: string,
  updates: {
    text?: string
    mediaUrl?: string
    audioUrl?: string
    visibility?: string
  }
): Promise<void> {
  // Update the core entry
  await prisma.entry.update({
    where: { id: memoryId },
    data: updates,
  })

  // Note: Since we're using a single Entry record with multiple links,
  // the update automatically propagates to all branches viewing it
  // No additional work needed here
}

/**
 * Get the origin branch for a memory
 */
export async function getOriginBranch(memoryId: string): Promise<Branch | null> {
  const originLink = await prisma.memoryBranchLink.findFirst({
    where: {
      memoryId,
      role: 'origin',
    },
    include: {
      branch: {
        select: {
          id: true,
          title: true,
          ownerId: true,
        },
      },
    },
  })

  return originLink?.branch || null
}

/**
 * Check if a branch requires approval for shared memories
 */
export async function requiresApproval(branchId: string): Promise<boolean> {
  const preferences = await prisma.branchPreferences.findUnique({
    where: { branchId },
  })

  return preferences?.requiresTagApproval || false
}

/**
 * Create branch links when sharing a memory
 */
export async function createMemoryLinks(
  memoryId: string,
  originBranchId: string,
  targetBranchIds: string[]
): Promise<void> {
  // Create origin link
  await prisma.memoryBranchLink.create({
    data: {
      memoryId,
      branchId: originBranchId,
      role: 'origin',
      visibilityStatus: 'active',
    },
  })

  // Create shared links for target branches
  for (const branchId of targetBranchIds) {
    const needsApproval = await requiresApproval(branchId)

    await prisma.memoryBranchLink.create({
      data: {
        memoryId,
        branchId,
        role: 'shared',
        visibilityStatus: needsApproval ? 'pending_approval' : 'active',
      },
    })
  }
}

/**
 * Remove a memory from a branch (non-destructive)
 */
export async function removeMemoryFromBranch(
  memoryId: string,
  branchId: string,
  removedByUser: boolean = false
): Promise<void> {
  const status = removedByUser ? 'removed_by_user' : 'removed_by_branch'

  await prisma.memoryBranchLink.updateMany({
    where: {
      memoryId,
      branchId,
    },
    data: {
      visibilityStatus: status,
    },
  })
}

/**
 * Check if a memory is shared (has more than origin link)
 */
export async function isSharedMemory(memoryId: string): Promise<boolean> {
  const linkCount = await prisma.memoryBranchLink.count({
    where: {
      memoryId,
      visibilityStatus: {
        in: ['active', 'pending_approval'],
      },
    },
  })

  return linkCount > 1
}
