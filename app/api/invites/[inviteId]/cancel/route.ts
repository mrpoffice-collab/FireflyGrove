import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { inviteId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const inviteId = params.inviteId

    // Get the invite
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        branch: {
          include: {
            owner: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (invite.branch.owner.id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Mark as expired
    await prisma.invite.update({
      where: { id: inviteId },
      data: {
        status: 'EXPIRED',
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Error canceling invite:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel invite' },
      { status: 500 }
    )
  }
}
