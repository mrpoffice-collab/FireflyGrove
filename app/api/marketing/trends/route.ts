import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trends = await prisma.trendingTopic.findMany({
      where: {
        status: 'new',
        detectedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: [
        { priority: 'desc' },
        { score: 'desc' }
      ],
      take: 20
    })

    return NextResponse.json(trends)
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 })
  }
}
