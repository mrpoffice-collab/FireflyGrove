/**
 * Grove and Tree Freeze/Unfreeze Logic
 *
 * Handles freezing and unfreezing of Groves and individual Trees based on subscription status.
 *
 * Freeze Rules:
 * 1. When Grove subscription expires → freeze all dependent Trees (isOriginal: true, no individual subscription)
 * 2. Linked Trees (isOriginal: false) are NOT frozen when their Grove freezes
 * 3. Trees with individual subscriptions stay active even if Grove is frozen
 * 4. Frozen content is read-only (no new memories, no edits)
 */

import { prisma } from './prisma'

/**
 * Freeze a Grove and all its dependent Trees
 * @param groveId - Grove ID
 * @returns Number of trees frozen
 */
export async function freezeGrove(groveId: string): Promise<number> {
  // Update Grove status
  await prisma.grove.update({
    where: { id: groveId },
    data: { status: 'frozen' },
  })

  // Freeze all dependent trees (original trees without individual subscriptions)
  const result = await prisma.groveTreeMembership.updateMany({
    where: {
      groveId,
      isOriginal: true, // Only original trees
      status: 'active',
      subscription: null, // No individual subscription
    },
    data: { status: 'frozen' },
  })

  return result.count
}

/**
 * Unfreeze a Grove and all its trees
 * @param groveId - Grove ID
 * @returns Number of trees unfrozen
 */
export async function unfreezeGrove(groveId: string): Promise<number> {
  // Update Grove status
  await prisma.grove.update({
    where: { id: groveId },
    data: { status: 'active' },
  })

  // Unfreeze all trees in this Grove
  const result = await prisma.groveTreeMembership.updateMany({
    where: {
      groveId,
      status: 'frozen',
    },
    data: { status: 'active' },
  })

  return result.count
}

/**
 * Freeze a specific Tree (GroveTreeMembership)
 * @param membershipId - GroveTreeMembership ID
 */
export async function freezeTree(membershipId: string): Promise<void> {
  await prisma.groveTreeMembership.update({
    where: { id: membershipId },
    data: { status: 'frozen' },
  })
}

/**
 * Unfreeze a specific Tree (GroveTreeMembership)
 * @param membershipId - GroveTreeMembership ID
 */
export async function unfreezeTree(membershipId: string): Promise<void> {
  await prisma.groveTreeMembership.update({
    where: { id: membershipId },
    data: { status: 'active' },
  })
}

/**
 * Check if a Tree is frozen
 * @param membershipId - GroveTreeMembership ID
 * @returns true if frozen, false otherwise
 */
export async function isTreeFrozen(membershipId: string): Promise<boolean> {
  const membership = await prisma.groveTreeMembership.findUnique({
    where: { id: membershipId },
    select: { status: true },
  })

  return membership?.status === 'frozen'
}

/**
 * Check if a Tree is frozen by Person ID and Grove ID
 * @param personId - Person ID
 * @param groveId - Grove ID
 * @returns true if frozen, false otherwise
 */
export async function isPersonTreeFrozen(
  personId: string,
  groveId: string
): Promise<boolean> {
  const membership = await prisma.groveTreeMembership.findFirst({
    where: {
      personId,
      groveId,
    },
    select: { status: true },
  })

  return membership?.status === 'frozen'
}

/**
 * Check if user can edit content on a Branch
 * A Branch is editable if:
 * 1. Its Person's membership in the Branch's Grove is active
 * 2. OR the Branch has no Grove association (legacy data)
 *
 * @param branchId - Branch ID
 * @returns true if editable, false if frozen
 */
export async function canEditBranch(branchId: string): Promise<boolean> {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      person: {
        include: {
          memberships: {
            include: {
              grove: true,
            },
          },
        },
      },
      owner: {
        include: {
          grove: true,
        },
      },
    },
  })

  if (!branch) {
    return false
  }

  // Legacy branches without Person (old Tree model)
  if (!branch.person) {
    // Check if owner's Grove is active
    if (branch.owner?.grove?.status === 'frozen') {
      return false
    }
    return true
  }

  // Find the membership for this Person in the owner's Grove
  const ownerGroveId = branch.owner?.grove?.id
  if (!ownerGroveId) {
    return true // No Grove association, allow edit
  }

  const membership = branch.person.memberships.find(
    (m) => m.groveId === ownerGroveId
  )

  if (!membership) {
    return false // No membership found
  }

  return membership.status === 'active'
}

/**
 * Get frozen trees for a Grove
 * @param groveId - Grove ID
 * @returns Array of frozen GroveTreeMemberships with Person info
 */
export async function getFrozenTrees(groveId: string): Promise<
  Array<{
    id: string
    personId: string
    personName: string
    isOriginal: boolean
    hasIndividualSubscription: boolean
  }>
> {
  const frozenMemberships = await prisma.groveTreeMembership.findMany({
    where: {
      groveId,
      status: 'frozen',
    },
    include: {
      person: {
        select: {
          id: true,
          name: true,
        },
      },
      subscription: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  })

  return frozenMemberships.map((m) => ({
    id: m.id,
    personId: m.personId,
    personName: m.person.name,
    isOriginal: m.isOriginal,
    hasIndividualSubscription: !!m.subscription,
  }))
}

/**
 * Get count of frozen vs active trees in a Grove
 * @param groveId - Grove ID
 * @returns Counts of frozen and active trees
 */
export async function getGroveTreeStatus(groveId: string): Promise<{
  frozen: number
  active: number
  total: number
}> {
  const frozen = await prisma.groveTreeMembership.count({
    where: {
      groveId,
      status: 'frozen',
    },
  })

  const active = await prisma.groveTreeMembership.count({
    where: {
      groveId,
      status: 'active',
    },
  })

  return {
    frozen,
    active,
    total: frozen + active,
  }
}

/**
 * Check if Grove is frozen
 * @param groveId - Grove ID
 * @returns true if frozen, false otherwise
 */
export async function isGroveFrozen(groveId: string): Promise<boolean> {
  const grove = await prisma.grove.findUnique({
    where: { id: groveId },
    select: { status: true },
  })

  return grove?.status === 'frozen'
}

/**
 * Freeze Trees when their individual subscription expires
 * @param membershipId - GroveTreeMembership ID
 */
export async function freezeTreeOnSubscriptionExpiry(
  membershipId: string
): Promise<void> {
  const membership = await prisma.groveTreeMembership.findUnique({
    where: { id: membershipId },
    include: {
      grove: {
        select: {
          status: true,
        },
      },
    },
  })

  if (!membership) {
    throw new Error('Membership not found')
  }

  // Only freeze if Grove is also frozen/inactive
  if (membership.grove.status !== 'active') {
    await freezeTree(membershipId)
  }
}

/**
 * Get user-facing freeze message based on Tree status
 * @param membershipId - GroveTreeMembership ID
 * @returns Freeze message or null if not frozen
 */
export async function getFreezeMessage(
  membershipId: string
): Promise<string | null> {
  const membership = await prisma.groveTreeMembership.findUnique({
    where: { id: membershipId },
    include: {
      grove: {
        select: {
          status: true,
          planType: true,
        },
      },
      person: {
        select: {
          name: true,
        },
      },
      subscription: {
        select: {
          status: true,
        },
      },
    },
  })

  if (!membership || membership.status !== 'frozen') {
    return null
  }

  const personName = membership.person.name

  // Has individual subscription that expired
  if (membership.subscription && membership.subscription.status !== 'active') {
    return `${personName}'s Tree subscription has expired. Memories are safe but frozen. Reactivate for $4.99/year to continue adding memories.`
  }

  // Grove is frozen
  if (membership.grove.status === 'frozen') {
    return `Your Grove plan expired. ${personName}'s Tree is frozen. Memories are safe but read-only. Renew your Grove or reactivate this Tree individually for $4.99/year.`
  }

  return `${personName}'s Tree is frozen. Contact support if this seems incorrect.`
}
