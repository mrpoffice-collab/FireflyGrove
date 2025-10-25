import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Tiered limits configuration (matches check-limits)
const TIER_LIMITS = {
  free: {
    monthlyLimit: 2,
    storageDays: 30,
    hasWatermark: true,
  },
  trial: {
    monthlyLimit: 2,
    storageDays: 30,
    hasWatermark: true,
  },
  family: {
    monthlyLimit: 5,
    storageDays: 60,
    hasWatermark: false,
  },
  ancestry: {
    monthlyLimit: null, // unlimited
    storageDays: null, // permanent
    hasWatermark: false,
  },
  institutional: {
    monthlyLimit: null, // unlimited
    storageDays: null, // permanent
    hasWatermark: false,
  },
  admin: {
    monthlyLimit: null, // unlimited
    storageDays: null, // permanent
    hasWatermark: false,
  },
}

export async function POST(req: NextRequest) {
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

    // Check monthly limit (unless admin or unlimited tier)
    if (tierConfig.monthlyLimit !== null) {
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

      if (monthlyCount >= tierConfig.monthlyLimit) {
        return NextResponse.json(
          {
            error: 'Monthly limit reached',
            limit: tierConfig.monthlyLimit,
            current: monthlyCount,
          },
          { status: 429 }
        )
      }
    }

    // Parse request body
    const body = await req.json()
    const { title, photoCount, durationSeconds, sizeBytes } = body

    // Validate required fields
    if (!photoCount || !durationSeconds) {
      return NextResponse.json(
        { error: 'Missing required fields: photoCount, durationSeconds' },
        { status: 400 }
      )
    }

    // Calculate auto-deletion date
    let autoDeleteAt: Date | null = null
    if (tierConfig.storageDays !== null) {
      autoDeleteAt = new Date()
      autoDeleteAt.setDate(autoDeleteAt.getDate() + tierConfig.storageDays)
    }

    // Create video generation record
    const videoGeneration = await prisma.videoGeneration.create({
      data: {
        userId,
        planType,
        title: title || null,
        photoCount,
        durationSeconds,
        sizeBytes: sizeBytes || null,
        hasWatermark: tierConfig.hasWatermark,
        autoDeleteAt,
      },
    })

    console.log(
      `[Video Generation] User ${userId} (${planType}) generated video #${videoGeneration.id} with ${photoCount} photos`
    )

    return NextResponse.json({
      success: true,
      video: {
        id: videoGeneration.id,
        hasWatermark: videoGeneration.hasWatermark,
        autoDeleteAt: videoGeneration.autoDeleteAt,
      },
    })
  } catch (error) {
    console.error('[Video Generation Record] Error:', error)
    return NextResponse.json({ error: 'Failed to record video generation' }, { status: 500 })
  }
}
