/**
 * Tests for lib/capacity.ts
 * Grove tree capacity management functions
 */

import {
  canAddOriginalTree,
  getTreeCount,
  getActualTreeCount,
  incrementTreeCount,
  decrementTreeCount,
  syncTreeCount,
  getGroveCapacity,
  getSuggestedUpgrade,
  validateTreeCount,
} from '@/lib/capacity'
import { prisma } from '@/lib/prisma'
import { getPlanById } from '@/lib/plans'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    grove: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    groveTreeMembership: {
      count: jest.fn(),
    },
  },
}))

// Mock plans
jest.mock('@/lib/plans', () => ({
  getPlanById: jest.fn(),
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockGetPlanById = getPlanById as jest.MockedFunction<typeof getPlanById>

describe('lib/capacity.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('canAddOriginalTree', () => {
    it('should return true when grove has capacity', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeLimit: 10,
        treeCount: 5,
      } as any)

      const result = await canAddOriginalTree('grove-1')
      expect(result).toBe(true)
      expect(mockPrisma.grove.findUnique).toHaveBeenCalledWith({
        where: { id: 'grove-1' },
        select: {
          treeLimit: true,
          treeCount: true,
        },
      })
    })

    it('should return false when grove is at capacity', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeLimit: 10,
        treeCount: 10,
      } as any)

      const result = await canAddOriginalTree('grove-1')
      expect(result).toBe(false)
    })

    it('should return false when grove is over capacity', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeLimit: 10,
        treeCount: 11,
      } as any)

      const result = await canAddOriginalTree('grove-1')
      expect(result).toBe(false)
    })

    it('should throw error when grove not found', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue(null)

      await expect(canAddOriginalTree('invalid-grove')).rejects.toThrow('Grove not found')
    })
  })

  describe('getTreeCount', () => {
    it('should return tree count for valid grove', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeCount: 7,
      } as any)

      const result = await getTreeCount('grove-1')
      expect(result).toBe(7)
      expect(mockPrisma.grove.findUnique).toHaveBeenCalledWith({
        where: { id: 'grove-1' },
        select: { treeCount: true },
      })
    })

    it('should throw error when grove not found', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue(null)

      await expect(getTreeCount('invalid-grove')).rejects.toThrow('Grove not found')
    })
  })

  describe('getActualTreeCount', () => {
    it('should return count of original trees from memberships', async () => {
      mockPrisma.groveTreeMembership.count.mockResolvedValue(5)

      const result = await getActualTreeCount('grove-1')
      expect(result).toBe(5)
      expect(mockPrisma.groveTreeMembership.count).toHaveBeenCalledWith({
        where: {
          groveId: 'grove-1',
          isOriginal: true,
        },
      })
    })

    it('should return 0 when no original trees exist', async () => {
      mockPrisma.groveTreeMembership.count.mockResolvedValue(0)

      const result = await getActualTreeCount('grove-1')
      expect(result).toBe(0)
    })
  })

  describe('incrementTreeCount', () => {
    it('should increment tree count by 1', async () => {
      mockPrisma.grove.update.mockResolvedValue({} as any)

      await incrementTreeCount('grove-1')

      expect(mockPrisma.grove.update).toHaveBeenCalledWith({
        where: { id: 'grove-1' },
        data: {
          treeCount: {
            increment: 1,
          },
        },
      })
    })
  })

  describe('decrementTreeCount', () => {
    it('should decrement tree count by 1', async () => {
      mockPrisma.grove.update.mockResolvedValue({} as any)

      await decrementTreeCount('grove-1')

      expect(mockPrisma.grove.update).toHaveBeenCalledWith({
        where: { id: 'grove-1' },
        data: {
          treeCount: {
            decrement: 1,
          },
        },
      })
    })
  })

  describe('syncTreeCount', () => {
    it('should sync tree count with actual membership count', async () => {
      mockPrisma.groveTreeMembership.count.mockResolvedValue(8)
      mockPrisma.grove.update.mockResolvedValue({} as any)

      const result = await syncTreeCount('grove-1')

      expect(result).toBe(8)
      expect(mockPrisma.grove.update).toHaveBeenCalledWith({
        where: { id: 'grove-1' },
        data: {
          treeCount: 8,
        },
      })
    })

    it('should handle zero count correctly', async () => {
      mockPrisma.groveTreeMembership.count.mockResolvedValue(0)
      mockPrisma.grove.update.mockResolvedValue({} as any)

      const result = await syncTreeCount('grove-1')

      expect(result).toBe(0)
      expect(mockPrisma.grove.update).toHaveBeenCalledWith({
        where: { id: 'grove-1' },
        data: {
          treeCount: 0,
        },
      })
    })
  })

  describe('getGroveCapacity', () => {
    it('should return correct capacity info when below limit', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeCount: 3,
        treeLimit: 10,
        planType: 'family',
      } as any)

      const result = await getGroveCapacity('grove-1')

      expect(result).toEqual({
        current: 3,
        limit: 10,
        available: 7,
        percentage: 30,
        canAddMore: true,
        planType: 'family',
      })
    })

    it('should return correct capacity info when at limit', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeCount: 10,
        treeLimit: 10,
        planType: 'family',
      } as any)

      const result = await getGroveCapacity('grove-1')

      expect(result).toEqual({
        current: 10,
        limit: 10,
        available: 0,
        percentage: 100,
        canAddMore: false,
        planType: 'family',
      })
    })

    it('should handle 0 limit correctly', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeCount: 0,
        treeLimit: 0,
        planType: 'trial',
      } as any)

      const result = await getGroveCapacity('grove-1')

      expect(result).toEqual({
        current: 0,
        limit: 0,
        available: 0,
        percentage: 0,
        canAddMore: false,
        planType: 'trial',
      })
    })

    it('should not return negative available count', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeCount: 12,
        treeLimit: 10,
        planType: 'family',
      } as any)

      const result = await getGroveCapacity('grove-1')

      expect(result.available).toBe(0)
      expect(result.canAddMore).toBe(false)
    })

    it('should throw error when grove not found', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue(null)

      await expect(getGroveCapacity('invalid-grove')).rejects.toThrow('Grove not found')
    })
  })

  describe('getSuggestedUpgrade', () => {
    it('should suggest family plan for trial users', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        planType: 'trial',
        treeLimit: 1,
      } as any)

      mockGetPlanById
        .mockReturnValueOnce({
          id: 'trial',
          name: 'Trial',
          price: 0,
          treeLimit: 1,
          stripePriceId: null,
        })
        .mockReturnValueOnce({
          id: 'family',
          name: 'Family Plan',
          price: 120,
          treeLimit: 10,
          stripePriceId: 'price_family',
        })

      const result = await getSuggestedUpgrade('grove-1')

      expect(result).toEqual({
        currentPlan: 'Trial',
        suggestedPlan: 'Family Plan',
        newLimit: 10,
        monthlyCost: 10, // 120 / 12
      })
    })

    it('should suggest ancestry plan for family users', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        planType: 'family',
        treeLimit: 10,
      } as any)

      mockGetPlanById
        .mockReturnValueOnce({
          id: 'family',
          name: 'Family Plan',
          price: 120,
          treeLimit: 10,
          stripePriceId: 'price_family',
        })
        .mockReturnValueOnce({
          id: 'ancestry',
          name: 'Ancestry Plan',
          price: 240,
          treeLimit: 30,
          stripePriceId: 'price_ancestry',
        })

      const result = await getSuggestedUpgrade('grove-1')

      expect(result).toEqual({
        currentPlan: 'Family Plan',
        suggestedPlan: 'Ancestry Plan',
        newLimit: 30,
        monthlyCost: 20, // 240 / 12
      })
    })

    it('should suggest community plan for ancestry users', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        planType: 'ancestry',
        treeLimit: 30,
      } as any)

      mockGetPlanById
        .mockReturnValueOnce({
          id: 'ancestry',
          name: 'Ancestry Plan',
          price: 240,
          treeLimit: 30,
          stripePriceId: 'price_ancestry',
        })
        .mockReturnValueOnce({
          id: 'community',
          name: 'Community Plan',
          price: 480,
          treeLimit: 100,
          stripePriceId: 'price_community',
        })

      const result = await getSuggestedUpgrade('grove-1')

      expect(result).toEqual({
        currentPlan: 'Ancestry Plan',
        suggestedPlan: 'Community Plan',
        newLimit: 100,
        monthlyCost: 40, // 480 / 12
      })
    })

    it('should return null for community users (already at max)', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        planType: 'community',
        treeLimit: 100,
      } as any)

      mockGetPlanById.mockReturnValue({
        id: 'community',
        name: 'Community Plan',
        price: 480,
        treeLimit: 100,
        stripePriceId: 'price_community',
      })

      const result = await getSuggestedUpgrade('grove-1')

      expect(result).toBeNull()
    })

    it('should return null when plan not found', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        planType: 'trial',
        treeLimit: 1,
      } as any)

      mockGetPlanById.mockReturnValue(null)

      const result = await getSuggestedUpgrade('grove-1')

      expect(result).toBeNull()
    })

    it('should throw error when grove not found', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue(null)

      await expect(getSuggestedUpgrade('invalid-grove')).rejects.toThrow('Grove not found')
    })
  })

  describe('validateTreeCount', () => {
    it('should return true when counts match', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeCount: 5,
      } as any)
      mockPrisma.groveTreeMembership.count.mockResolvedValue(5)

      const result = await validateTreeCount('grove-1')

      expect(result).toBe(true)
    })

    it('should return false when counts do not match', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeCount: 5,
      } as any)
      mockPrisma.groveTreeMembership.count.mockResolvedValue(7)

      const result = await validateTreeCount('grove-1')

      expect(result).toBe(false)
    })

    it('should return true when both counts are zero', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue({
        treeCount: 0,
      } as any)
      mockPrisma.groveTreeMembership.count.mockResolvedValue(0)

      const result = await validateTreeCount('grove-1')

      expect(result).toBe(true)
    })

    it('should throw error when grove not found', async () => {
      mockPrisma.grove.findUnique.mockResolvedValue(null)

      await expect(validateTreeCount('invalid-grove')).rejects.toThrow('Grove not found')
    })
  })
})
