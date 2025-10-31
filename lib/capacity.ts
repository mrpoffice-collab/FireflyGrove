/**
 * Grove Tree Capacity Management
 *
 * Handles tree counting and capacity limits for Groves.
 * Only "original" trees (isOriginal: true in GroveTreeMembership) count toward limits.
 * Linked trees (isOriginal: false) do not count.
 */

import { prisma } from './prisma'
import { getPlanById } from './plans'

/**
 * Check if a Grove can add a new original tree
 * @param groveId - Grove ID
 * @returns true if the Grove has capacity, false otherwise
 */
export async function canAddOriginalTree(groveId: string): Promise<boolean> {
  const grove = await prisma.grove.findUnique({
    where: { id: groveId },
    select: {
      treeLimit: true,
      treeCount: true,
    },
  })

  if (!grove) {
    throw new Error('Grove not found')
  }

  return grove.treeCount < grove.treeLimit
}

/**
 * Get the current tree count for a Grove (original trees only)
 * @param groveId - Grove ID
 * @returns Number of original trees in the Grove
 */
export async function getTreeCount(groveId: string): Promise<number> {
  const grove = await prisma.grove.findUnique({
    where: { id: groveId },
    select: { treeCount: true },
  })

  if (!grove) {
    throw new Error('Grove not found')
  }

  return grove.treeCount
}

/**
 * Get the actual count from GroveTreeMembership (for validation)
 * @param groveId - Grove ID
 * @returns Actual count of original trees
 */
export async function getActualTreeCount(groveId: string): Promise<number> {
  const count = await prisma.groveTreeMembership.count({
    where: {
      groveId,
      isOriginal: true,
    },
  })

  return count
}

/**
 * Increment the tree count for a Grove
 * @param groveId - Grove ID
 */
export async function incrementTreeCount(groveId: string): Promise<void> {
  await prisma.grove.update({
    where: { id: groveId },
    data: {
      treeCount: {
        increment: 1,
      },
    },
  })
}

/**
 * Decrement the tree count for a Grove
 * @param groveId - Grove ID
 */
export async function decrementTreeCount(groveId: string): Promise<void> {
  await prisma.grove.update({
    where: { id: groveId },
    data: {
      treeCount: {
        decrement: 1,
      },
    },
  })
}

/**
 * Sync the tree count from actual memberships (use for data integrity)
 * @param groveId - Grove ID
 * @returns The new tree count
 */
export async function syncTreeCount(groveId: string): Promise<number> {
  const actualCount = await getActualTreeCount(groveId)

  await prisma.grove.update({
    where: { id: groveId },
    data: {
      treeCount: actualCount,
    },
  })

  return actualCount
}

/**
 * Get Grove capacity info
 * @param groveId - Grove ID
 * @returns Capacity information
 */
export async function getGroveCapacity(groveId: string): Promise<{
  current: number
  limit: number
  available: number
  percentage: number
  canAddMore: boolean
  planType: string
}> {
  const grove = await prisma.grove.findUnique({
    where: { id: groveId },
    select: {
      treeCount: true,
      treeLimit: true,
      planType: true,
    },
  })

  if (!grove) {
    throw new Error('Grove not found')
  }

  const available = Math.max(0, grove.treeLimit - grove.treeCount)
  const percentage = grove.treeLimit > 0
    ? Math.round((grove.treeCount / grove.treeLimit) * 100)
    : 0

  return {
    current: grove.treeCount,
    limit: grove.treeLimit,
    available,
    percentage,
    canAddMore: grove.treeCount < grove.treeLimit,
    planType: grove.planType,
  }
}

/**
 * Get suggested upgrade plan when at capacity
 * @param groveId - Grove ID
 * @returns Suggested plan info or null if already at max
 */
export async function getSuggestedUpgrade(groveId: string): Promise<{
  currentPlan: string
  suggestedPlan: string
  newLimit: number
  monthlyCost: number
} | null> {
  const grove = await prisma.grove.findUnique({
    where: { id: groveId },
    select: {
      planType: true,
      treeLimit: true,
    },
  })

  if (!grove) {
    throw new Error('Grove not found')
  }

  const currentPlan = getPlanById(grove.planType)
  if (!currentPlan) {
    return null
  }

  // Suggest upgrade based on current plan
  let suggestedPlanId: string
  switch (grove.planType) {
    case 'trial':
      suggestedPlanId = 'family'
      break
    case 'family':
      suggestedPlanId = 'ancestry'
      break
    case 'ancestry':
      suggestedPlanId = 'community'
      break
    case 'community':
      return null // Already at max
    default:
      return null
  }

  const suggestedPlan = getPlanById(suggestedPlanId)
  if (!suggestedPlan) {
    return null
  }

  return {
    currentPlan: currentPlan.name,
    suggestedPlan: suggestedPlan.name,
    newLimit: suggestedPlan.treeLimit,
    monthlyCost: suggestedPlan.price / 12, // Annual to monthly
  }
}

/**
 * Validate that tree count matches actual memberships
 * @param groveId - Grove ID
 * @returns true if counts match, false otherwise
 */
export async function validateTreeCount(groveId: string): Promise<boolean> {
  const grove = await prisma.grove.findUnique({
    where: { id: groveId },
    select: { treeCount: true },
  })

  if (!grove) {
    throw new Error('Grove not found')
  }

  const actualCount = await getActualTreeCount(groveId)
  return grove.treeCount === actualCount
}
