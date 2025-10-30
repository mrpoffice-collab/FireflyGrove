import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/facebook/status
 * Check if user has connected Facebook account
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Check if user has a Facebook token
    const token = await prisma.facebookToken.findUnique({
      where: { userId },
      select: {
        id: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    if (!token) {
      return NextResponse.json({ connected: false })
    }

    // Check if token is expired
    const isExpired = token.expiresAt && token.expiresAt < new Date()

    return NextResponse.json({
      connected: true,
      expiresAt: token.expiresAt,
      connectedAt: token.createdAt,
      isExpired,
    })
  } catch (error: any) {
    console.error('Error checking Facebook status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    )
  }
}
