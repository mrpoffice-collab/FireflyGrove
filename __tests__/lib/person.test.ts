/**
 * Tests for lib/person.ts
 * Person management and grove membership functions
 */

import {
  findPersonByEmail,
  findPersonById,
  searchPersonsByName,
  createPerson,
  createPersonInGrove,
  linkPersonToGrove,
  getPersonMemberships,
  getPersonsInGrove,
  removePersonFromGrove,
  isPersonInGrove,
} from '@/lib/person'
import { prisma } from '@/lib/prisma'
import * as capacity from '@/lib/capacity'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    person: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    groveTreeMembership: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    grove: {
      update: jest.fn(),
    },
  },
}))

// Mock capacity functions
jest.mock('@/lib/capacity', () => ({
  canAddOriginalTree: jest.fn(),
  incrementTreeCount: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockCanAddOriginalTree = capacity.canAddOriginalTree as jest.MockedFunction<
  typeof capacity.canAddOriginalTree
>
const mockIncrementTreeCount = capacity.incrementTreeCount as jest.MockedFunction<
  typeof capacity.incrementTreeCount
>

describe('lib/person.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('findPersonByEmail', () => {
    it('should find person by user email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'john@example.com',
        persons: [
          {
            id: 'person-1',
            name: 'John Doe',
            userId: 'user-1',
            isLegacy: false,
            birthDate: new Date('1980-01-01'),
            deathDate: null,
            memoryCount: 10,
            memberships: [
              {
                grove: {
                  id: 'grove-1',
                  name: 'Family Grove',
                  user: { name: 'Owner Name' },
                },
              },
            ],
          },
        ],
      } as any)

      const result = await findPersonByEmail('john@example.com')

      expect(result).toEqual({
        id: 'person-1',
        name: 'John Doe',
        userId: 'user-1',
        isLegacy: false,
        birthDate: new Date('1980-01-01'),
        deathDate: null,
        memoryCount: 10,
        groveCount: 1,
        groves: [
          {
            id: 'grove-1',
            name: 'Family Grove',
            ownerName: 'Owner Name',
          },
        ],
      })
    })

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await findPersonByEmail('notfound@example.com')

      expect(result).toBeNull()
    })

    it('should return null when user has no persons', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        persons: [],
      } as any)

      const result = await findPersonByEmail('john@example.com')

      expect(result).toBeNull()
    })

    it('should handle person with multiple grove memberships', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        persons: [
          {
            id: 'person-1',
            name: 'John Doe',
            userId: 'user-1',
            isLegacy: false,
            birthDate: null,
            deathDate: null,
            memoryCount: 5,
            memberships: [
              {
                grove: {
                  id: 'grove-1',
                  name: 'Grove 1',
                  user: { name: 'Owner 1' },
                },
              },
              {
                grove: {
                  id: 'grove-2',
                  name: 'Grove 2',
                  user: { name: 'Owner 2' },
                },
              },
            ],
          },
        ],
      } as any)

      const result = await findPersonByEmail('john@example.com')

      expect(result?.groveCount).toBe(2)
      expect(result?.groves).toHaveLength(2)
    })
  })

  describe('findPersonById', () => {
    it('should find person by ID', async () => {
      mockPrisma.person.findUnique.mockResolvedValue({
        id: 'person-1',
        name: 'John Doe',
        userId: 'user-1',
        isLegacy: false,
        birthDate: new Date('1980-01-01'),
        deathDate: null,
        memoryCount: 10,
        memberships: [
          {
            grove: {
              id: 'grove-1',
              name: 'Family Grove',
              user: { name: 'Owner Name' },
            },
          },
        ],
      } as any)

      const result = await findPersonById('person-1')

      expect(result).toEqual({
        id: 'person-1',
        name: 'John Doe',
        userId: 'user-1',
        isLegacy: false,
        birthDate: new Date('1980-01-01'),
        deathDate: null,
        memoryCount: 10,
        groveCount: 1,
        groves: [
          {
            id: 'grove-1',
            name: 'Family Grove',
            ownerName: 'Owner Name',
          },
        ],
      })
    })

    it('should return null when person not found', async () => {
      mockPrisma.person.findUnique.mockResolvedValue(null)

      const result = await findPersonById('invalid-person')

      expect(result).toBeNull()
    })
  })

  describe('searchPersonsByName', () => {
    it('should search persons by name', async () => {
      mockPrisma.person.findMany.mockResolvedValue([
        {
          id: 'person-1',
          name: 'John Doe',
          userId: 'user-1',
          isLegacy: false,
          birthDate: null,
          deathDate: null,
          memoryCount: 5,
          memberships: [
            {
              grove: {
                id: 'grove-1',
                name: 'Grove 1',
                user: { name: 'Owner 1' },
              },
            },
          ],
        },
        {
          id: 'person-2',
          name: 'John Smith',
          userId: 'user-2',
          isLegacy: false,
          birthDate: null,
          deathDate: null,
          memoryCount: 3,
          memberships: [],
        },
      ] as any)

      const result = await searchPersonsByName('John')

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('John Doe')
      expect(result[1].name).toBe('John Smith')
      expect(mockPrisma.person.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'John',
            mode: 'insensitive',
          },
        },
        take: 10,
        include: expect.any(Object),
      })
    })

    it('should respect limit parameter', async () => {
      mockPrisma.person.findMany.mockResolvedValue([])

      await searchPersonsByName('John', 5)

      expect(mockPrisma.person.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      )
    })

    it('should return empty array when no matches', async () => {
      mockPrisma.person.findMany.mockResolvedValue([])

      const result = await searchPersonsByName('Nonexistent')

      expect(result).toEqual([])
    })
  })

  describe('createPerson', () => {
    it('should create person with all options', async () => {
      const birthDate = new Date('1980-01-01')
      const deathDate = new Date('2020-01-01')
      const trusteeExpiresAt = new Date('2025-01-01')

      mockPrisma.person.create.mockResolvedValue({
        id: 'person-1',
        name: 'John Doe',
      } as any)

      await createPerson({
        name: '  John Doe  ', // Test trimming
        userId: 'user-1',
        birthDate,
        deathDate,
        isLegacy: true,
        trusteeId: 'trustee-1',
        ownerId: 'owner-1',
        moderatorId: 'moderator-1',
        trusteeExpiresAt,
        discoveryEnabled: false,
        memoryLimit: 100,
      })

      expect(mockPrisma.person.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe', // Trimmed
          userId: 'user-1',
          birthDate,
          deathDate,
          isLegacy: true,
          trusteeId: 'trustee-1',
          ownerId: 'owner-1',
          moderatorId: 'moderator-1',
          trusteeExpiresAt,
          discoveryEnabled: false,
          memoryLimit: 100,
          memoryCount: 0,
        },
      })
    })

    it('should use defaults for optional fields', async () => {
      mockPrisma.person.create.mockResolvedValue({
        id: 'person-1',
        name: 'Jane Doe',
      } as any)

      await createPerson({
        name: 'Jane Doe',
        userId: 'user-1',
      })

      expect(mockPrisma.person.create).toHaveBeenCalledWith({
        data: {
          name: 'Jane Doe',
          userId: 'user-1',
          birthDate: undefined,
          deathDate: undefined,
          isLegacy: false,
          trusteeId: undefined,
          ownerId: 'user-1', // Defaults to userId
          moderatorId: 'user-1', // Defaults to ownerId/userId
          trusteeExpiresAt: undefined,
          discoveryEnabled: true,
          memoryLimit: undefined,
          memoryCount: 0,
        },
      })
    })
  })

  describe('createPersonInGrove', () => {
    it('should create person and add to grove', async () => {
      mockCanAddOriginalTree.mockResolvedValue(true)
      mockPrisma.person.create.mockResolvedValue({
        id: 'person-1',
        name: 'John Doe',
      } as any)
      mockPrisma.groveTreeMembership.create.mockResolvedValue({
        id: 'membership-1',
      } as any)
      mockIncrementTreeCount.mockResolvedValue()

      const result = await createPersonInGrove('grove-1', {
        name: 'John Doe',
        userId: 'user-1',
      })

      expect(mockCanAddOriginalTree).toHaveBeenCalledWith('grove-1')
      expect(mockPrisma.person.create).toHaveBeenCalled()
      expect(mockPrisma.groveTreeMembership.create).toHaveBeenCalledWith({
        data: {
          groveId: 'grove-1',
          personId: 'person-1',
          isOriginal: true,
          status: 'active',
        },
      })
      expect(mockIncrementTreeCount).toHaveBeenCalledWith('grove-1')
      expect(result.person.id).toBe('person-1')
      expect(result.membership.id).toBe('membership-1')
    })

    it('should throw error when grove is at capacity', async () => {
      mockCanAddOriginalTree.mockResolvedValue(false)

      await expect(
        createPersonInGrove('grove-1', {
          name: 'John Doe',
          userId: 'user-1',
        })
      ).rejects.toThrow('Grove has reached its tree limit')

      expect(mockPrisma.person.create).not.toHaveBeenCalled()
    })
  })

  describe('linkPersonToGrove', () => {
    it('should link person to grove as rooted (does not count)', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue(null) // Not already linked
      mockPrisma.groveTreeMembership.create.mockResolvedValue({
        id: 'membership-1',
      } as any)

      const result = await linkPersonToGrove('person-1', 'grove-1', 'rooted')

      expect(mockPrisma.groveTreeMembership.create).toHaveBeenCalledWith({
        data: {
          groveId: 'grove-1',
          personId: 'person-1',
          isOriginal: false,
          adoptionType: 'rooted',
          status: 'active',
        },
      })
      expect(mockIncrementTreeCount).not.toHaveBeenCalled() // Rooted doesn't count
      expect(result.id).toBe('membership-1')
    })

    it('should link person to grove as adopted (counts toward limit)', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue(null)
      mockCanAddOriginalTree.mockResolvedValue(true)
      mockPrisma.groveTreeMembership.create.mockResolvedValue({
        id: 'membership-1',
      } as any)
      mockIncrementTreeCount.mockResolvedValue()

      await linkPersonToGrove('person-1', 'grove-1', 'adopted')

      expect(mockCanAddOriginalTree).toHaveBeenCalledWith('grove-1')
      expect(mockPrisma.groveTreeMembership.create).toHaveBeenCalledWith({
        data: {
          groveId: 'grove-1',
          personId: 'person-1',
          isOriginal: true,
          adoptionType: 'adopted',
          status: 'active',
        },
      })
      expect(mockIncrementTreeCount).toHaveBeenCalledWith('grove-1')
    })

    it('should throw error when person already linked to grove', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue({
        id: 'existing-membership',
      } as any)

      await expect(linkPersonToGrove('person-1', 'grove-1')).rejects.toThrow(
        'Person is already linked to this Grove'
      )

      expect(mockPrisma.groveTreeMembership.create).not.toHaveBeenCalled()
    })

    it('should throw error when grove at capacity for adopted', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue(null)
      mockCanAddOriginalTree.mockResolvedValue(false)

      await expect(linkPersonToGrove('person-1', 'grove-1', 'adopted')).rejects.toThrow(
        'Grove has reached its tree limit'
      )

      expect(mockPrisma.groveTreeMembership.create).not.toHaveBeenCalled()
    })

    it('should default to rooted when adoptionType not specified', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue(null)
      mockPrisma.groveTreeMembership.create.mockResolvedValue({
        id: 'membership-1',
      } as any)

      await linkPersonToGrove('person-1', 'grove-1') // No adoptionType

      expect(mockPrisma.groveTreeMembership.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isOriginal: false,
            adoptionType: 'rooted',
          }),
        })
      )
    })
  })

  describe('getPersonMemberships', () => {
    it('should return person memberships with grove info', async () => {
      mockPrisma.groveTreeMembership.findMany.mockResolvedValue([
        {
          id: 'membership-1',
          grove: { id: 'grove-1', name: 'Grove 1' },
          isOriginal: true,
          status: 'active',
          subscription: { id: 'sub-1', status: 'active' },
        },
        {
          id: 'membership-2',
          grove: { id: 'grove-2', name: 'Grove 2' },
          isOriginal: false,
          status: 'active',
          subscription: null,
        },
      ] as any)

      const result = await getPersonMemberships('person-1')

      expect(result).toEqual([
        {
          id: 'membership-1',
          groveId: 'grove-1',
          groveName: 'Grove 1',
          isOriginal: true,
          status: 'active',
          hasSubscription: true,
        },
        {
          id: 'membership-2',
          groveId: 'grove-2',
          groveName: 'Grove 2',
          isOriginal: false,
          status: 'active',
          hasSubscription: false,
        },
      ])
    })

    it('should return empty array when person has no memberships', async () => {
      mockPrisma.groveTreeMembership.findMany.mockResolvedValue([])

      const result = await getPersonMemberships('person-1')

      expect(result).toEqual([])
    })

    it('should handle expired subscriptions correctly', async () => {
      mockPrisma.groveTreeMembership.findMany.mockResolvedValue([
        {
          id: 'membership-1',
          grove: { id: 'grove-1', name: 'Grove 1' },
          isOriginal: true,
          status: 'frozen',
          subscription: { id: 'sub-1', status: 'expired' },
        },
      ] as any)

      const result = await getPersonMemberships('person-1')

      expect(result[0].hasSubscription).toBe(false) // Expired subscription
      expect(result[0].status).toBe('frozen')
    })
  })

  describe('getPersonsInGrove', () => {
    it('should return persons in grove with membership details', async () => {
      mockPrisma.groveTreeMembership.findMany.mockResolvedValue([
        {
          id: 'membership-1',
          person: {
            id: 'person-1',
            name: 'John Doe',
            isLegacy: false,
            memoryCount: 10,
          },
          isOriginal: true,
          status: 'active',
          subscription: { id: 'sub-1', status: 'active' },
        },
        {
          id: 'membership-2',
          person: {
            id: 'person-2',
            name: 'Jane Doe',
            isLegacy: true,
            memoryCount: 5,
          },
          isOriginal: false,
          status: 'active',
          subscription: null,
        },
      ] as any)

      const result = await getPersonsInGrove('grove-1')

      expect(result).toEqual([
        {
          id: 'person-1',
          name: 'John Doe',
          isLegacy: false,
          memoryCount: 10,
          membership: {
            id: 'membership-1',
            isOriginal: true,
            status: 'active',
            hasSubscription: true,
          },
        },
        {
          id: 'person-2',
          name: 'Jane Doe',
          isLegacy: true,
          memoryCount: 5,
          membership: {
            id: 'membership-2',
            isOriginal: false,
            status: 'active',
            hasSubscription: false,
          },
        },
      ])
    })

    it('should return empty array when grove has no persons', async () => {
      mockPrisma.groveTreeMembership.findMany.mockResolvedValue([])

      const result = await getPersonsInGrove('grove-1')

      expect(result).toEqual([])
    })
  })

  describe('removePersonFromGrove', () => {
    it('should remove original person and decrement count', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        isOriginal: true,
        groveId: 'grove-1',
      } as any)
      mockPrisma.groveTreeMembership.delete.mockResolvedValue({} as any)
      mockPrisma.grove.update.mockResolvedValue({} as any)

      await removePersonFromGrove('membership-1')

      expect(mockPrisma.groveTreeMembership.delete).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
      })
      expect(mockPrisma.grove.update).toHaveBeenCalledWith({
        where: { id: 'grove-1' },
        data: {
          treeCount: {
            decrement: 1,
          },
        },
      })
    })

    it('should remove rooted person without decrementing count', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        isOriginal: false,
        groveId: 'grove-1',
      } as any)
      mockPrisma.groveTreeMembership.delete.mockResolvedValue({} as any)

      await removePersonFromGrove('membership-1')

      expect(mockPrisma.groveTreeMembership.delete).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
      })
      expect(mockPrisma.grove.update).not.toHaveBeenCalled()
    })

    it('should throw error when membership not found', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue(null)

      await expect(removePersonFromGrove('invalid-membership')).rejects.toThrow(
        'Membership not found'
      )

      expect(mockPrisma.groveTreeMembership.delete).not.toHaveBeenCalled()
    })
  })

  describe('isPersonInGrove', () => {
    it('should return true when person is in grove', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue({
        id: 'membership-1',
      } as any)

      const result = await isPersonInGrove('person-1', 'grove-1')

      expect(result).toBe(true)
      expect(mockPrisma.groveTreeMembership.findFirst).toHaveBeenCalledWith({
        where: {
          personId: 'person-1',
          groveId: 'grove-1',
        },
      })
    })

    it('should return false when person is not in grove', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue(null)

      const result = await isPersonInGrove('person-1', 'grove-1')

      expect(result).toBe(false)
    })
  })
})
