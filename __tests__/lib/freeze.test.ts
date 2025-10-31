/**
 * Tests for lib/freeze.ts
 * Grove and Tree freeze/unfreeze management
 */

import {
  freezeGrove,
  unfreezeGrove,
  freezeTree,
  unfreezeTree,
  isTreeFrozen,
  isPersonTreeFrozen,
  canEditBranch,
  getFrozenTrees,
  getGroveTreeStatus,
  isGroveFrozen,
  freezeTreeOnSubscriptionExpiry,
  getFreezeMessage,
} from '@/lib/freeze'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    grove: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    groveTreeMembership: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    branch: {
      findUnique: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('lib/freeze.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('freezeGrove', () => {
    it('should freeze grove and return count of frozen trees', async () => {
      mockPrisma.grove.update.mockResolvedValue({} as any)
      mockPrisma.groveTreeMembership.updateMany.mockResolvedValue({ count: 5 } as any)

      const result = await freezeGrove('grove-1')

      expect(result).toBe(5)
      expect(mockPrisma.grove.update).toHaveBeenCalledWith({
        where: { id: 'grove-1' },
        data: { status: 'frozen' },
      })
      expect(mockPrisma.groveTreeMembership.updateMany).toHaveBeenCalledWith({
        where: {
          groveId: 'grove-1',
          isOriginal: true,
          status: 'active',
          subscription: null,
        },
        data: { status: 'frozen' },
      })
    })

    it('should return 0 when no trees to freeze', async () => {
      mockPrisma.grove.update.mockResolvedValue({} as any)
      mockPrisma.groveTreeMembership.updateMany.mockResolvedValue({ count: 0 } as any)

      const result = await freezeGrove('grove-1')

      expect(result).toBe(0)
    })
  })

  describe('unfreezeGrove', () => {
    it('should unfreeze grove and return count of unfrozen trees', async () => {
      mockPrisma.grove.update.mockResolvedValue({} as any)
      mockPrisma.groveTreeMembership.updateMany.mockResolvedValue({ count: 5 } as any)

      const result = await unfreezeGrove('grove-1')

      expect(result).toBe(5)
      expect(mockPrisma.grove.update).toHaveBeenCalledWith({
        where: { id: 'grove-1' },
        data: { status: 'active' },
      })
      expect(mockPrisma.groveTreeMembership.updateMany).toHaveBeenCalledWith({
        where: {
          groveId: 'grove-1',
          status: 'frozen',
        },
        data: { status: 'active' },
      })
    })

    it('should return 0 when no frozen trees', async () => {
      mockPrisma.grove.update.mockResolvedValue({} as any)
      mockPrisma.groveTreeMembership.updateMany.mockResolvedValue({ count: 0 } as any)

      const result = await unfreezeGrove('grove-1')

      expect(result).toBe(0)
    })
  })

  describe('freezeTree', () => {
    it('should freeze specific tree membership', async () => {
      mockPrisma.groveTreeMembership.update.mockResolvedValue({} as any)

      await freezeTree('membership-1')

      expect(mockPrisma.groveTreeMembership.update).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
        data: { status: 'frozen' },
      })
    })
  })

  describe('unfreezeTree', () => {
    it('should unfreeze specific tree membership', async () => {
      mockPrisma.groveTreeMembership.update.mockResolvedValue({} as any)

      await unfreezeTree('membership-1')

      expect(mockPrisma.groveTreeMembership.update).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
        data: { status: 'active' },
      })
    })
  })

  describe('isTreeFrozen', () => {
    it('should return true when tree is frozen', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        status: 'frozen',
      } as any)

      const result = await isTreeFrozen('membership-1')

      expect(result).toBe(true)
    })

    it('should return false when tree is active', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        status: 'active',
      } as any)

      const result = await isTreeFrozen('membership-1')

      expect(result).toBe(false)
    })

    it('should return false when membership not found', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue(null)

      const result = await isTreeFrozen('invalid-membership')

      expect(result).toBe(false)
    })
  })

  describe('isPersonTreeFrozen', () => {
    it('should return true when person tree is frozen in grove', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue({
        status: 'frozen',
      } as any)

      const result = await isPersonTreeFrozen('person-1', 'grove-1')

      expect(result).toBe(true)
      expect(mockPrisma.groveTreeMembership.findFirst).toHaveBeenCalledWith({
        where: {
          personId: 'person-1',
          groveId: 'grove-1',
        },
        select: { status: true },
      })
    })

    it('should return false when person tree is active', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue({
        status: 'active',
      } as any)

      const result = await isPersonTreeFrozen('person-1', 'grove-1')

      expect(result).toBe(false)
    })

    it('should return false when no membership found', async () => {
      mockPrisma.groveTreeMembership.findFirst.mockResolvedValue(null)

      const result = await isPersonTreeFrozen('person-1', 'grove-1')

      expect(result).toBe(false)
    })
  })

  describe('canEditBranch', () => {
    it('should return true when branch membership is active', async () => {
      mockPrisma.branch.findUnique.mockResolvedValue({
        id: 'branch-1',
        person: {
          id: 'person-1',
          memberships: [
            {
              groveId: 'grove-1',
              status: 'active',
            },
          ],
        },
        owner: {
          id: 'user-1',
          grove: {
            id: 'grove-1',
            status: 'active',
          },
        },
      } as any)

      const result = await canEditBranch('branch-1')

      expect(result).toBe(true)
    })

    it('should return false when branch membership is frozen', async () => {
      mockPrisma.branch.findUnique.mockResolvedValue({
        id: 'branch-1',
        person: {
          id: 'person-1',
          memberships: [
            {
              groveId: 'grove-1',
              status: 'frozen',
            },
          ],
        },
        owner: {
          id: 'user-1',
          grove: {
            id: 'grove-1',
            status: 'frozen',
          },
        },
      } as any)

      const result = await canEditBranch('branch-1')

      expect(result).toBe(false)
    })

    it('should return false when branch not found', async () => {
      mockPrisma.branch.findUnique.mockResolvedValue(null)

      const result = await canEditBranch('invalid-branch')

      expect(result).toBe(false)
    })

    it('should return true for legacy branches without person when grove is active', async () => {
      mockPrisma.branch.findUnique.mockResolvedValue({
        id: 'branch-1',
        person: null,
        owner: {
          id: 'user-1',
          grove: {
            id: 'grove-1',
            status: 'active',
          },
        },
      } as any)

      const result = await canEditBranch('branch-1')

      expect(result).toBe(true)
    })

    it('should return false for legacy branches when grove is frozen', async () => {
      mockPrisma.branch.findUnique.mockResolvedValue({
        id: 'branch-1',
        person: null,
        owner: {
          id: 'user-1',
          grove: {
            id: 'grove-1',
            status: 'frozen',
          },
        },
      } as any)

      const result = await canEditBranch('branch-1')

      expect(result).toBe(false)
    })

    it('should return true when no grove association', async () => {
      mockPrisma.branch.findUnique.mockResolvedValue({
        id: 'branch-1',
        person: {
          id: 'person-1',
          memberships: [],
        },
        owner: {
          id: 'user-1',
          grove: null,
        },
      } as any)

      const result = await canEditBranch('branch-1')

      expect(result).toBe(true)
    })

    it('should return false when no membership found for person', async () => {
      mockPrisma.branch.findUnique.mockResolvedValue({
        id: 'branch-1',
        person: {
          id: 'person-1',
          memberships: [
            {
              groveId: 'grove-2', // Different grove
              status: 'active',
            },
          ],
        },
        owner: {
          id: 'user-1',
          grove: {
            id: 'grove-1',
            status: 'active',
          },
        },
      } as any)

      const result = await canEditBranch('branch-1')

      expect(result).toBe(false)
    })
  })

  describe('getFrozenTrees', () => {
    it('should return frozen trees with person info', async () => {
      mockPrisma.groveTreeMembership.findMany.mockResolvedValue([
        {
          id: 'membership-1',
          personId: 'person-1',
          person: { id: 'person-1', name: 'John Doe' },
          isOriginal: true,
          subscription: null,
        },
        {
          id: 'membership-2',
          personId: 'person-2',
          person: { id: 'person-2', name: 'Jane Doe' },
          isOriginal: true,
          subscription: { id: 'sub-1', status: 'active' },
        },
      ] as any)

      const result = await getFrozenTrees('grove-1')

      expect(result).toEqual([
        {
          id: 'membership-1',
          personId: 'person-1',
          personName: 'John Doe',
          isOriginal: true,
          hasIndividualSubscription: false,
        },
        {
          id: 'membership-2',
          personId: 'person-2',
          personName: 'Jane Doe',
          isOriginal: true,
          hasIndividualSubscription: true,
        },
      ])
    })

    it('should return empty array when no frozen trees', async () => {
      mockPrisma.groveTreeMembership.findMany.mockResolvedValue([])

      const result = await getFrozenTrees('grove-1')

      expect(result).toEqual([])
    })
  })

  describe('getGroveTreeStatus', () => {
    it('should return counts of frozen and active trees', async () => {
      mockPrisma.groveTreeMembership.count
        .mockResolvedValueOnce(3) // frozen
        .mockResolvedValueOnce(7) // active

      const result = await getGroveTreeStatus('grove-1')

      expect(result).toEqual({
        frozen: 3,
        active: 7,
        total: 10,
      })
    })

    it('should handle grove with all active trees', async () => {
      mockPrisma.groveTreeMembership.count
        .mockResolvedValueOnce(0) // frozen
        .mockResolvedValueOnce(10) // active

      const result = await getGroveTreeStatus('grove-1')

      expect(result).toEqual({
        frozen: 0,
        active: 10,
        total: 10,
      })
    })

    it('should handle grove with all frozen trees', async () => {
      mockPrisma.groveTreeMembership.count
        .mockResolvedValueOnce(10) // frozen
        .mockResolvedValueOnce(0) // active

      const result = await getGroveTreeStatus('grove-1')

      expect(result).toEqual({
        frozen: 10,
        active: 0,
        total: 10,
      })
    })

    it('should handle empty grove', async () => {
      mockPrisma.groveTreeMembership.count
        .mockResolvedValueOnce(0) // frozen
        .mockResolvedValueOnce(0) // active

      const result = await getGroveTreeStatus('grove-1')

      expect(result).toEqual({
        frozen: 0,
        active: 0,
        total: 0,
      })
    })
  })

  describe('isGroveFrozen', () => {
    it('should return true when grove is frozen', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        status: 'frozen',
      } as any)

      const result = await isGroveFrozen('grove-1')

      expect(result).toBe(true)
    })

    it('should return false when grove is active', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        status: 'active',
      } as any)

      const result = await isGroveFrozen('grove-1')

      expect(result).toBe(false)
    })

    it('should return false when grove not found', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue(null)

      const result = await isGroveFrozen('invalid-grove')

      expect(result).toBe(false)
    })
  })

  describe('freezeTreeOnSubscriptionExpiry', () => {
    it('should freeze tree when grove is frozen', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        id: 'membership-1',
        grove: {
          status: 'frozen',
        },
      } as any)
      mockPrisma.groveTreeMembership.update.mockResolvedValue({} as any)

      await freezeTreeOnSubscriptionExpiry('membership-1')

      expect(mockPrisma.groveTreeMembership.update).toHaveBeenCalledWith({
        where: { id: 'membership-1' },
        data: { status: 'frozen' },
      })
    })

    it('should not freeze tree when grove is active', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        id: 'membership-1',
        grove: {
          status: 'active',
        },
      } as any)

      await freezeTreeOnSubscriptionExpiry('membership-1')

      expect(mockPrisma.groveTreeMembership.update).not.toHaveBeenCalled()
    })

    it('should throw error when membership not found', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue(null)

      await expect(freezeTreeOnSubscriptionExpiry('invalid-membership')).rejects.toThrow(
        'Membership not found'
      )
    })
  })

  describe('getFreezeMessage', () => {
    it('should return null when membership not found', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue(null)

      const result = await getFreezeMessage('invalid-membership')

      expect(result).toBeNull()
    })

    it('should return null when tree is active', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        status: 'active',
      } as any)

      const result = await getFreezeMessage('membership-1')

      expect(result).toBeNull()
    })

    it('should return individual subscription expiry message', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        status: 'frozen',
        person: { name: 'John Doe' },
        grove: { status: 'active' },
        subscription: { status: 'expired' },
      } as any)

      const result = await getFreezeMessage('membership-1')

      expect(result).toContain("John Doe's Tree subscription has expired")
      expect(result).toContain('$4.99/year')
    })

    it('should return grove frozen message', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        status: 'frozen',
        person: { name: 'Jane Doe' },
        grove: { status: 'frozen', planType: 'family' },
        subscription: null,
      } as any)

      const result = await getFreezeMessage('membership-1')

      expect(result).toContain('Your Grove plan expired')
      expect(result).toContain("Jane Doe's Tree is frozen")
      expect(result).toContain('$4.99/year')
    })

    it('should return generic frozen message when cause unknown', async () => {
      mockPrisma.groveTreeMembership.findUnique.mockResolvedValue({
        status: 'frozen',
        person: { name: 'Bob Smith' },
        grove: { status: 'active' },
        subscription: null,
      } as any)

      const result = await getFreezeMessage('membership-1')

      expect(result).toContain("Bob Smith's Tree is frozen")
      expect(result).toContain('Contact support')
    })
  })
})
