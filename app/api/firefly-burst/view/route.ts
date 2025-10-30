import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { burstId } = body

    if (!burstId) {
      return NextResponse.json({ error: 'Burst ID required' }, { status: 400 })
    }

    // Mark burst as viewed
    const burst = await prisma.fireflyBurst.update({
      where: {
        id: burstId,
        userId: user.id, // Ensure user owns this burst
      },
      data: {
        viewed: true,
        viewedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, burst })
  } catch (error) {
    console.error('Error marking burst as viewed:', error)
    return NextResponse.json(
      { error: 'Failed to mark burst as viewed' },
      { status: 500 }
    )
  }
}
