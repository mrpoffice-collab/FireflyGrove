import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * POST /api/facebook/disconnect
 * Disconnect Facebook account and delete stored token
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Delete the Facebook token
    await prisma.facebookToken.deleteMany({
      where: { userId },
    })

    // Create audit log
    await prisma.audit.create({
      data: {
        actorId: userId,
        action: 'FACEBOOK_DISCONNECTED',
        targetType: 'USER',
        targetId: userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error disconnecting Facebook:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
