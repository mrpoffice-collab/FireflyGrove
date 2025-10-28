import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/nest
 * Get all nest items for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Get user to check admin status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })

    const items = await prisma.nestItem.findMany({
      where: {
        userId,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    })

    return NextResponse.json({
      items,
      isAdmin: user?.isAdmin || false
    })
  } catch (error: any) {
    console.error('Error fetching nest items:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch nest items' },
      { status: 500 }
    )
  }
}
