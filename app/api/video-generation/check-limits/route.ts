import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Tiered limits configuration
const TIER_LIMITS = {
  free: {
    monthlyLimit: 2,
    storageDays: 30,
    hasWatermark: true,
    displayName: 'Free',
  },
  trial: {
    monthlyLimit: 2,
    storageDays: 30,
    hasWatermark: true,
    displayName: 'Trial',
  },
  family: {
    monthlyLimit: 5,
    storageDays: 60,
    hasWatermark: false,
    displayName: 'Family Grove',
  },
  ancestry: {
    monthlyLimit: null, // unlimited
    storageDays: null, // permanent
    hasWatermark: false,
    displayName: 'Ancestry Grove',
  },
  institutional: {
    monthlyLimit: null, // unlimited
    storageDays: null, // permanent
    hasWatermark: false,
    displayName: 'Institutional Grove',
  },
  admin: {
    monthlyLimit: null, // unlimited
    storageDays: null, // permanent
    hasWatermark: false,
    displayName: 'Admin',
  },
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const isAdmin = (session.user as any).isAdmin

    // Get user's grove to determine plan type
    const grove = await prisma.grove.findUnique({
      where: { userId },
      select: { planType: true },
    })

    // Determine effective plan type
    let planType = isAdmin ? 'admin' : (grove?.planType || 'free')
    const tierConfig = TIER_LIMITS[planType as keyof typeof TIER_LIMITS] || TIER_LIMITS.free

    // Get video generation count for this month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyCount = await prisma.videoGeneration.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth,
        },
        deletedAt: null,
      },
    })

    // Calculate remaining videos
    const remaining = tierConfig.monthlyLimit !== null
      ? Math.max(0, tierConfig.monthlyLimit - monthlyCount)
      : null // null means unlimited

    // Check if user can generate another video
    const canGenerate = tierConfig.monthlyLimit === null || monthlyCount < tierConfig.monthlyLimit

    return NextResponse.json({
      planType,
      tierConfig: {
        ...tierConfig,
        monthlyLimit: tierConfig.monthlyLimit || 'Unlimited',
      },
      usage: {
        monthlyCount,
        remaining: remaining !== null ? remaining : 'Unlimited',
        canGenerate,
      },
    })
  } catch (error) {
    console.error('[Video Generation Limits] Error:', error)
    return NextResponse.json({ error: 'Failed to check limits' }, { status: 500 })
  }
}
