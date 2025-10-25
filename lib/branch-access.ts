/**
 * Branch Access Control Utilities
 *
 * Handles filtering branches based on user access permissions,
 * especially important for rooted trees where privacy must be maintained
 */

import { prisma } from './prisma'

/**
 * Check if a user has access to a specific branch
 *
 * Access is granted if user:
 * 1. Owns the branch (ownerId = userId)
 * 2. Is a member of the branch (BranchMember exists)
 */
export async function hasBranchAccess(
  userId: string,
  branchId: string
): Promise<boolean> {
  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
      OR: [
        // User owns the branch
        { ownerId: userId },
        // User is a member of the branch
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  })

  return !!branch
}

/**
 * Get all accessible branch IDs for a user on a specific tree
 *
 * Returns branch IDs where user has access through ownership or membership
 */
export async function getAccessibleBranchIds(
  userId: string,
  treeId: string
): Promise<string[]> {
  const branches = await prisma.branch.findMany({
    where: {
      treeId,
      status: {
        not: 'DELETED',
      },
      archived: false,
      OR: [
        // User owns the branch
        { ownerId: userId },
        // User is a member of the branch
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
    },
  })

  return branches.map((b) => b.id)
}

/**
 * Get accessible branch IDs for a Person entity (new model)
 */
export async function getAccessiblePersonBranchIds(
  userId: string,
  personId: string
): Promise<string[]> {
  const branches = await prisma.branch.findMany({
    where: {
      personId,
      status: {
        not: 'DELETED',
      },
      archived: false,
      OR: [
        // User owns the branch
        { ownerId: userId },
        // User is a member of the branch
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
    },
  })

  return branches.map((b) => b.id)
}

/**
 * Get all accessible branches for rooted trees
 *
 * When trees are rooted, we need to show branches from both trees,
 * but only those the user has access to
 */
export async function getAccessibleRootedBranchIds(
  userId: string,
  personId: string
): Promise<string[]> {
  // Find all persons rooted with this person
  const roots = await prisma.personRoot.findMany({
    where: {
      status: 'active',
      OR: [
        { personId1: personId },
        { personId2: personId },
      ],
    },
    select: {
      personId1: true,
      personId2: true,
    },
  })

  // Get all unique person IDs (including the original)
  const personIds = new Set<string>([personId])
  roots.forEach((root) => {
    personIds.add(root.personId1)
    personIds.add(root.personId2)
  })

  // Get accessible branches from all rooted persons
  const branches = await prisma.branch.findMany({
    where: {
      personId: {
        in: Array.from(personIds),
      },
      status: {
        not: 'DELETED',
      },
      archived: false,
      OR: [
        // User owns the branch
        { ownerId: userId },
        // User is a member of the branch
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      personId: true,
    },
  })

  return branches.map((b) => b.id)
}

/**
 * Prisma WHERE clause for accessible branches
 *
 * Use this in Prisma queries to filter branches by access
 */
export function getAccessibleBranchesWhere(userId: string) {
  return {
    OR: [
      // User owns the branch
      { ownerId: userId },
      // User is a member of the branch
      {
        members: {
          some: {
            userId,
          },
        },
      },
    ],
  }
}
