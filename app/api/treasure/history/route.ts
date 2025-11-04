import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get all treasure entries for the user
    const entries = await prisma.treasureEntry.findMany({
      where: { userId },
      include: {
        branch: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        entryUTC: 'desc',
      },
    })

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        treasureCount: true,
        timeZone: true,
      },
    })

    return NextResponse.json({
      entries,
      stats: {
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
        totalCount: user?.treasureCount || 0,
      },
    })
  } catch (error) {
    console.error('Treasure history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treasure history' },
      { status: 500 }
    )
  }
}
