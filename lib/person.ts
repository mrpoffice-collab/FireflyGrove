/**
 * Person Management Utilities
 *
 * Handles Person creation, search, linking, and membership management.
 * Person is a global identity that can appear in multiple Groves.
 */

import { prisma } from './prisma'
import { incrementTreeCount, canAddOriginalTree } from './capacity'

export interface PersonSearchResult {
  id: string
  name: string
  userId: string | null
  isLegacy: boolean
  birthDate: Date | null
  deathDate: Date | null
  memoryCount: number
  groveCount: number
  groves: Array<{
    id: string
    name: string
    ownerName: string
  }>
}

export interface CreatePersonOptions {
  name: string
  userId?: string
  birthDate?: Date
  deathDate?: Date
  isLegacy?: boolean
  trusteeId?: string
  ownerId?: string
  moderatorId?: string
  trusteeExpiresAt?: Date
  discoveryEnabled?: boolean
  memoryLimit?: number
}

/**
 * Find a Person by email (via their userId)
 * @param email - User email
 * @returns Person record or null
 */
export async function findPersonByEmail(
  email: string
): Promise<PersonSearchResult | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      persons: {
        include: {
          memberships: {
            include: {
              grove: {
                include: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user || user.persons.length === 0) {
    return null
  }

  // Return first person (users typically have one primary Person)
  const person = user.persons[0]

  return {
    id: person.id,
    name: person.name,
    userId: person.userId,
    isLegacy: person.isLegacy,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    memoryCount: person.memoryCount,
    groveCount: person.memberships.length,
    groves: person.memberships.map((m) => ({
      id: m.grove.id,
      name: m.grove.name,
      ownerName: m.grove.user.name,
    })),
  }
}

/**
 * Find a Person by ID
 * @param personId - Person ID
 * @returns Person record or null
 */
export async function findPersonById(
  personId: string
): Promise<PersonSearchResult | null> {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      memberships: {
        include: {
          grove: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!person) {
    return null
  }

  return {
    id: person.id,
    name: person.name,
    userId: person.userId,
    isLegacy: person.isLegacy,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    memoryCount: person.memoryCount,
    groveCount: person.memberships.length,
    groves: person.memberships.map((m) => ({
      id: m.grove.id,
      name: m.grove.name,
      ownerName: m.grove.user.name,
    })),
  }
}

/**
 * Search for Persons by name
 * @param query - Search query
 * @param limit - Maximum results
 * @returns Array of matching Persons
 */
export async function searchPersonsByName(
  query: string,
  limit: number = 10
): Promise<PersonSearchResult[]> {
  const persons = await prisma.person.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: limit,
    include: {
      memberships: {
        include: {
          grove: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })

  return persons.map((person) => ({
    id: person.id,
    name: person.name,
    userId: person.userId,
    isLegacy: person.isLegacy,
    birthDate: person.birthDate,
    deathDate: person.deathDate,
    memoryCount: person.memoryCount,
    groveCount: person.memberships.length,
    groves: person.memberships.map((m) => ({
      id: m.grove.id,
      name: m.grove.name,
      ownerName: m.grove.user.name,
    })),
  }))
}

/**
 * Create a new Person
 * @param options - Person creation options
 * @returns Created Person
 */
export async function createPerson(options: CreatePersonOptions) {
  const person = await prisma.person.create({
    data: {
      name: options.name.trim(),
      userId: options.userId,
      birthDate: options.birthDate,
      deathDate: options.deathDate,
      isLegacy: options.isLegacy ?? false,
      trusteeId: options.trusteeId,
      ownerId: options.ownerId ?? options.userId,
      moderatorId: options.moderatorId ?? options.ownerId ?? options.userId,
      trusteeExpiresAt: options.trusteeExpiresAt,
      discoveryEnabled: options.discoveryEnabled ?? true,
      memoryLimit: options.memoryLimit,
      memoryCount: 0,
    },
  })

  return person
}

/**
 * Create a new Person and add to Grove as original tree
 * @param groveId - Grove ID
 * @param options - Person creation options
 * @returns Created Person and GroveTreeMembership
 */
export async function createPersonInGrove(
  groveId: string,
  options: CreatePersonOptions
): Promise<{
  person: any
  membership: any
}> {
  // Check capacity
  const hasCapacity = await canAddOriginalTree(groveId)
  if (!hasCapacity) {
    throw new Error('Grove has reached its tree limit')
  }

  // Create Person
  const person = await createPerson(options)

  // Create membership (original tree)
  const membership = await prisma.groveTreeMembership.create({
    data: {
      groveId,
      personId: person.id,
      isOriginal: true,
      status: 'active',
    },
  })

  // Increment tree count
  await incrementTreeCount(groveId)

  return { person, membership }
}

/**
 * Link an existing Person to a Grove (does not count toward tree limit)
 * @param personId - Person ID
 * @param groveId - Grove ID
 * @param adoptionType - "adopted" (moved, uses slot) or "rooted" (linked, no slot)
 * @returns Created GroveTreeMembership
 */
export async function linkPersonToGrove(
  personId: string,
  groveId: string,
  adoptionType: 'adopted' | 'rooted' = 'rooted'
): Promise<any> {
  // Check if already linked
  const existing = await prisma.groveTreeMembership.findFirst({
    where: {
      personId,
      groveId,
    },
  })

  if (existing) {
    throw new Error('Person is already linked to this Grove')
  }

  // Create membership
  const isOriginal = adoptionType === 'adopted'

  // If adopted, check capacity
  if (isOriginal) {
    const hasCapacity = await canAddOriginalTree(groveId)
    if (!hasCapacity) {
      throw new Error('Grove has reached its tree limit')
    }
  }

  const membership = await prisma.groveTreeMembership.create({
    data: {
      groveId,
      personId,
      isOriginal,
      adoptionType,
      status: 'active',
    },
  })

  // Increment count if adopted
  if (isOriginal) {
    await incrementTreeCount(groveId)
  }

  return membership
}

/**
 * Get all GroveTreeMemberships for a Person
 * @param personId - Person ID
 * @returns Array of memberships with Grove info
 */
export async function getPersonMemberships(personId: string): Promise<
  Array<{
    id: string
    groveId: string
    groveName: string
    isOriginal: boolean
    status: string
    hasSubscription: boolean
  }>
> {
  const memberships = await prisma.groveTreeMembership.findMany({
    where: { personId },
    include: {
      grove: {
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

  return memberships.map((m) => ({
    id: m.id,
    groveId: m.grove.id,
    groveName: m.grove.name,
    isOriginal: m.isOriginal,
    status: m.status,
    hasSubscription: !!m.subscription && m.subscription.status === 'active',
  }))
}

/**
 * Get Persons in a Grove with their membership info
 * @param groveId - Grove ID
 * @returns Array of Persons with membership details
 */
export async function getPersonsInGrove(groveId: string): Promise<
  Array<{
    id: string
    name: string
    isLegacy: boolean
    memoryCount: number
    membership: {
      id: string
      isOriginal: boolean
      status: string
      hasSubscription: boolean
    }
  }>
> {
  const memberships = await prisma.groveTreeMembership.findMany({
    where: { groveId },
    include: {
      person: {
        select: {
          id: true,
          name: true,
          isLegacy: true,
          memoryCount: true,
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

  return memberships.map((m) => ({
    id: m.person.id,
    name: m.person.name,
    isLegacy: m.person.isLegacy,
    memoryCount: m.person.memoryCount,
    membership: {
      id: m.id,
      isOriginal: m.isOriginal,
      status: m.status,
      hasSubscription: !!m.subscription && m.subscription.status === 'active',
    },
  }))
}

/**
 * Remove a Person from a Grove (delete membership)
 * @param membershipId - GroveTreeMembership ID
 */
export async function removePersonFromGrove(membershipId: string): Promise<void> {
  const membership = await prisma.groveTreeMembership.findUnique({
    where: { id: membershipId },
    select: {
      isOriginal: true,
      groveId: true,
    },
  })

  if (!membership) {
    throw new Error('Membership not found')
  }

  // Delete membership
  await prisma.groveTreeMembership.delete({
    where: { id: membershipId },
  })

  // Decrement count if it was original
  if (membership.isOriginal) {
    await prisma.grove.update({
      where: { id: membership.groveId },
      data: {
        treeCount: {
          decrement: 1,
        },
      },
    })
  }
}

/**
 * Check if a Person exists in a specific Grove
 * @param personId - Person ID
 * @param groveId - Grove ID
 * @returns Membership or null
 */
export async function isPersonInGrove(
  personId: string,
  groveId: string
): Promise<boolean> {
  const membership = await prisma.groveTreeMembership.findFirst({
    where: {
      personId,
      groveId,
    },
  })

  return !!membership
}
