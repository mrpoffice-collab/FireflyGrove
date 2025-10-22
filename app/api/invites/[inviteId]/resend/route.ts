import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMemberInviteEmail } from '@/lib/email'
import crypto from 'crypto'

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
                name: true,
              },
            },
          },
        },
        inviter: {
          select: {
            name: true,
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

    // Generate new token and extend expiration
    const newToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Update invite
    const updatedInvite = await prisma.invite.update({
      where: { id: inviteId },
      data: {
        token: newToken,
        expiresAt,
        status: 'PENDING',
      },
    })

    // Resend email with new token
    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${newToken}`
    await sendMemberInviteEmail(
      invite.email,
      invite.email.split('@')[0],
      invite.branch.title,
      invite.inviter.name,
      inviteUrl,
      true // New user
    )

    return NextResponse.json({
      success: true,
      invite: updatedInvite,
    })
  } catch (error: any) {
    console.error('Error resending invite:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to resend invite' },
      { status: 500 }
    )
  }
}
